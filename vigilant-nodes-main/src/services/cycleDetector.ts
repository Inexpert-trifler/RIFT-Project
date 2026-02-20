import { AdjacencyGraph } from "./graphBuilder";
import { FraudRing } from "@/types/transaction";

/**
 * Detect simple cycles of length 3–5 using Johnson's-inspired DFS.
 * Deduplicates by canonical form (sorted + rotated to minimum).
 * Complexity: O(V+E) per start node, bounded by max depth 5.
 */
export function detectCycles(graph: AdjacencyGraph): FraudRing[] {
  const { adjacency } = graph;
  const uniqueCycles = new Map<string, string[]>();

  function canonicalize(cycle: string[]): string {
    // Find rotation starting with lexicographically smallest element
    const sorted = [...cycle];
    let minIdx = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] < sorted[minIdx]) minIdx = i;
    }
    const rotated = [...sorted.slice(minIdx), ...sorted.slice(0, minIdx)];
    return rotated.join("|");
  }

  function dfs(start: string, current: string, path: string[], visited: Set<string>, depth: number) {
    if (depth > 5) return;
    const neighbors = adjacency.get(current);
    if (!neighbors) return;

    for (const next of neighbors) {
      if (next === start && path.length >= 3 && path.length <= 5) {
        const key = canonicalize(path);
        if (!uniqueCycles.has(key)) {
          uniqueCycles.set(key, [...path]);
        }
        continue;
      }
      if (visited.has(next)) continue;
      if (path.length >= 5) continue; // max cycle length 5

      visited.add(next);
      dfs(start, next, [...path, next], visited, depth + 1);
      visited.delete(next);
    }
  }

  for (const node of graph.accounts) {
    const visited = new Set<string>([node]);
    dfs(node, node, [node], visited, 1);
  }

  let ringId = 0;
  return Array.from(uniqueCycles.values()).map((members) => {
    let totalAmount = 0;
    for (let i = 0; i < members.length; i++) {
      const next = members[(i + 1) % members.length];
      const ed = graph.edgeData.get(`${members[i]}->${next}`);
      if (ed) totalAmount += ed.totalAmount;
    }
    return {
      ring_id: `cycle_${ringId++}`,
      members,
      type: "cycle" as const,
      total_amount: Math.round(totalAmount * 100) / 100,
    };
  });
}
