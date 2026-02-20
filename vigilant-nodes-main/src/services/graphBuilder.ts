import { Transaction } from "@/types/transaction";

export interface EdgeData {
  totalAmount: number;
  count: number;
  timestamps: number[];
}

export interface AccountStats {
  inDegree: number;
  outDegree: number;
  totalIn: number;
  totalOut: number;
  txCount: number;
  firstSeen: number;
  lastSeen: number;
  uniquePartners: Set<string>;
}

export interface AdjacencyGraph {
  adjacency: Map<string, Set<string>>;
  reverseAdj: Map<string, Set<string>>;
  accounts: Set<string>;
  edgeData: Map<string, EdgeData>;
  accountStats: Map<string, AccountStats>;
  // Legacy compat
  edgeAmounts: Map<string, number>;
  transactionCounts: Map<string, number>;
}

function getOrCreateStats(map: Map<string, AccountStats>, id: string): AccountStats {
  if (!map.has(id)) {
    map.set(id, {
      inDegree: 0, outDegree: 0,
      totalIn: 0, totalOut: 0,
      txCount: 0,
      firstSeen: Infinity, lastSeen: -Infinity,
      uniquePartners: new Set(),
    });
  }
  return map.get(id)!;
}

export function buildGraph(transactions: Transaction[]): AdjacencyGraph {
  const adjacency = new Map<string, Set<string>>();
  const reverseAdj = new Map<string, Set<string>>();
  const accounts = new Set<string>();
  const edgeData = new Map<string, EdgeData>();
  const accountStats = new Map<string, AccountStats>();
  const edgeAmounts = new Map<string, number>();
  const transactionCounts = new Map<string, number>();

  for (const tx of transactions) {
    const { sender_id, receiver_id, amount, parsed_time } = tx;
    accounts.add(sender_id);
    accounts.add(receiver_id);

    // Forward adjacency
    if (!adjacency.has(sender_id)) adjacency.set(sender_id, new Set());
    adjacency.get(sender_id)!.add(receiver_id);

    // Reverse adjacency
    if (!reverseAdj.has(receiver_id)) reverseAdj.set(receiver_id, new Set());
    reverseAdj.get(receiver_id)!.add(sender_id);

    // Edge data
    const edgeKey = `${sender_id}->${receiver_id}`;
    if (!edgeData.has(edgeKey)) {
      edgeData.set(edgeKey, { totalAmount: 0, count: 0, timestamps: [] });
    }
    const ed = edgeData.get(edgeKey)!;
    ed.totalAmount += amount;
    ed.count++;
    ed.timestamps.push(parsed_time);

    // Legacy compat
    edgeAmounts.set(edgeKey, (edgeAmounts.get(edgeKey) || 0) + amount);
    transactionCounts.set(sender_id, (transactionCounts.get(sender_id) || 0) + 1);
    transactionCounts.set(receiver_id, (transactionCounts.get(receiver_id) || 0) + 1);

    // Account stats
    const sStats = getOrCreateStats(accountStats, sender_id);
    sStats.outDegree++;
    sStats.totalOut += amount;
    sStats.txCount++;
    sStats.firstSeen = Math.min(sStats.firstSeen, parsed_time);
    sStats.lastSeen = Math.max(sStats.lastSeen, parsed_time);
    sStats.uniquePartners.add(receiver_id);

    const rStats = getOrCreateStats(accountStats, receiver_id);
    rStats.inDegree++;
    rStats.totalIn += amount;
    rStats.txCount++;
    rStats.firstSeen = Math.min(rStats.firstSeen, parsed_time);
    rStats.lastSeen = Math.max(rStats.lastSeen, parsed_time);
    rStats.uniquePartners.add(sender_id);
  }

  return { adjacency, reverseAdj, accounts, edgeData, accountStats, edgeAmounts, transactionCounts };
}
