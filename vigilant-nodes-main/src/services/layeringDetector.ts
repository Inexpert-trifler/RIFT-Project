import { AdjacencyGraph } from "./graphBuilder";
import { FraudRing } from "@/types/transaction";

const MAX_CHAIN_DEPTH = 7;
const MAX_INTERMEDIARY_TXS = 3;
const RAPID_CHAIN_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours between hops

/**
 * Layered shell detection:
 * - Chains of >=3 hops (4+ nodes)
 * - Intermediate nodes have <=3 total transactions
 * - Rapid timestamp chaining: each hop within 48h of previous
 * Complexity: O(V * d^MAX_DEPTH) worst case, bounded by intermediary filter
 */
export function detectLayering(graph: AdjacencyGraph): FraudRing[] {
  const { adjacency, accountStats, edgeData } = graph;
  const rings: FraudRing[] = [];
  let id = 0;

  for (const start of graph.accounts) {
    const startStats = accountStats.get(start);
    if (!startStats || startStats.outDegree === 0) continue;

    const chains = findChains(start, adjacency, accountStats, edgeData, [], -Infinity, 0);
    for (const chain of chains) {
      if (chain.length >= 4) {
        rings.push({
          ring_id: `layer_${id++}`,
          members: chain,
          type: "layering",
          total_amount: computeChainAmount(chain, edgeData),
        });
      }
    }
  }

  // Deduplicate by sorted member key
  const unique = new Map<string, FraudRing>();
  for (const ring of rings) {
    // Use ordered key (not sorted) since chain order matters, but dedupe same chains
    const key = ring.members.join("->");
    if (!unique.has(key)) unique.set(key, ring);
  }

  return Array.from(unique.values());
}

function findChains(
  current: string,
  adjacency: Map<string, Set<string>>,
  accountStats: Map<string, import("./graphBuilder").AccountStats>,
  edgeData: Map<string, import("./graphBuilder").EdgeData>,
  path: string[],
  lastTimestamp: number,
  depth: number
): string[][] {
  const newPath = [...path, current];
  if (depth > MAX_CHAIN_DEPTH) return newPath.length >= 4 ? [newPath] : [];

  const neighbors = adjacency.get(current);
  if (!neighbors) return newPath.length >= 4 ? [newPath] : [];

  const results: string[][] = [];

  for (const next of neighbors) {
    if (path.includes(next)) continue;

    const ed = edgeData.get(`${current}->${next}`);
    if (!ed || ed.timestamps.length === 0) continue;

    // Check temporal chaining: at least one timestamp on this edge is within
    // RAPID_CHAIN_WINDOW_MS after lastTimestamp
    const validTimestamp = depth === 0
      ? Math.min(...ed.timestamps)
      : ed.timestamps.find(t => t >= lastTimestamp && t - lastTimestamp <= RAPID_CHAIN_WINDOW_MS);

    if (depth > 0 && validTimestamp === undefined) continue;

    const hopTime = validTimestamp ?? Math.min(...ed.timestamps);

    // Intermediate node filter (not first, not exploring as endpoint)
    if (depth > 0) {
      const nextStats = accountStats.get(next);
      if (!nextStats) continue;
      if (nextStats.txCount > MAX_INTERMEDIARY_TXS) {
        // This node is too active to be a shell → end chain here
        if (newPath.length >= 4) results.push(newPath);
        continue;
      }
    }

    const chains = findChains(next, adjacency, accountStats, edgeData, newPath, hopTime, depth + 1);
    results.push(...chains);
  }

  if (results.length === 0 && newPath.length >= 4) {
    return [newPath];
  }

  return results;
}

function computeChainAmount(
  chain: string[],
  edgeData: Map<string, import("./graphBuilder").EdgeData>
): number {
  let total = 0;
  for (let i = 0; i < chain.length - 1; i++) {
    const ed = edgeData.get(`${chain[i]}->${chain[i + 1]}`);
    if (ed) total += ed.totalAmount;
  }
  return Math.round(total * 100) / 100;
}
