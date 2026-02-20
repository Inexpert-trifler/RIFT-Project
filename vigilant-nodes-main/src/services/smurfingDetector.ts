import { Transaction, FraudRing } from "@/types/transaction";
import { AdjacencyGraph } from "./graphBuilder";

const WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours
const MIN_PARTICIPANTS = 10;

/**
 * Smurfing detection with 72-hour sliding window and merchant-like filtering.
 * Fan-in: >=10 unique senders → 1 receiver within 72h window
 * Fan-out: 1 sender → >=10 unique receivers within 72h window
 * 
 * Merchant suppression: accounts with high temporal dispersion (activity
 * spanning >30 days with consistent volume) are excluded.
 */
export function detectSmurfing(
  transactions: Transaction[],
  graph: AdjacencyGraph,
  threshold = MIN_PARTICIPANTS
): FraudRing[] {
  const rings: FraudRing[] = [];
  let id = 0;

  // Group transactions by receiver for fan-in
  const byReceiver = new Map<string, Transaction[]>();
  // Group transactions by sender for fan-out
  const bySender = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    if (!byReceiver.has(tx.receiver_id)) byReceiver.set(tx.receiver_id, []);
    byReceiver.get(tx.receiver_id)!.push(tx);

    if (!bySender.has(tx.sender_id)) bySender.set(tx.sender_id, []);
    bySender.get(tx.sender_id)!.push(tx);
  }

  // Fan-In detection with sliding window
  for (const [receiver, txs] of byReceiver) {
    if (isMerchantLike(receiver, graph)) continue;

    const sorted = txs.sort((a, b) => a.parsed_time - b.parsed_time);
    const windows = findWindowClusters(sorted, WINDOW_MS);

    for (const windowTxs of windows) {
      const uniqueSenders = new Set(windowTxs.map(t => t.sender_id));
      if (uniqueSenders.size >= threshold) {
        const totalAmount = windowTxs.reduce((s, t) => s + t.amount, 0);
        rings.push({
          ring_id: `smurf_in_${id++}`,
          members: [receiver, ...uniqueSenders],
          type: "smurfing_fan_in",
          total_amount: Math.round(totalAmount * 100) / 100,
        });
      }
    }
  }

  // Fan-Out detection with sliding window
  for (const [sender, txs] of bySender) {
    if (isMerchantLike(sender, graph)) continue;

    const sorted = txs.sort((a, b) => a.parsed_time - b.parsed_time);
    const windows = findWindowClusters(sorted, WINDOW_MS);

    for (const windowTxs of windows) {
      const uniqueReceivers = new Set(windowTxs.map(t => t.receiver_id));
      if (uniqueReceivers.size >= threshold) {
        const totalAmount = windowTxs.reduce((s, t) => s + t.amount, 0);
        rings.push({
          ring_id: `smurf_out_${id++}`,
          members: [sender, ...uniqueReceivers],
          type: "smurfing_fan_out",
          total_amount: Math.round(totalAmount * 100) / 100,
        });
      }
    }
  }

  // Deduplicate rings with same member set
  const unique = new Map<string, FraudRing>();
  for (const ring of rings) {
    const key = ring.type + "|" + [...ring.members].sort().join(",");
    if (!unique.has(key)) unique.set(key, ring);
  }

  return Array.from(unique.values());
}

/**
 * Sliding window: find all maximal clusters within windowMs.
 * Uses two-pointer approach for O(n) per account.
 */
function findWindowClusters(sortedTxs: Transaction[], windowMs: number): Transaction[][] {
  if (sortedTxs.length < MIN_PARTICIPANTS) return [];

  const clusters: Transaction[][] = [];
  let left = 0;

  for (let right = 0; right < sortedTxs.length; right++) {
    while (sortedTxs[right].parsed_time - sortedTxs[left].parsed_time > windowMs) {
      left++;
    }
    if (right - left + 1 >= MIN_PARTICIPANTS) {
      clusters.push(sortedTxs.slice(left, right + 1));
      // Skip ahead to avoid near-duplicate windows
      left = right + 1;
    }
  }

  return clusters;
}

/**
 * Merchant-like heuristic: high-volume account with activity spread
 * over >30 days and relatively uniform transaction sizes.
 */
function isMerchantLike(accountId: string, graph: AdjacencyGraph): boolean {
  const stats = graph.accountStats.get(accountId);
  if (!stats) return false;

  const activitySpanDays = (stats.lastSeen - stats.firstSeen) / (1000 * 60 * 60 * 24);
  const hasHighVolume = stats.txCount > 50;
  const hasLongHistory = activitySpanDays > 30;
  const hasManyPartners = stats.uniquePartners.size > 20;

  return hasHighVolume && hasLongHistory && hasManyPartners;
}
