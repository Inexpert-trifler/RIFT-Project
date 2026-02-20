import { Transaction, AnalysisResult, GraphData } from "@/types/transaction";
import { buildGraph } from "./graphBuilder";
import { detectCycles } from "./cycleDetector";
import { detectSmurfing } from "./smurfingDetector";
import { detectLayering } from "./layeringDetector";
import { scoreAccounts } from "./scoringService";

export function runAnalysis(transactions: Transaction[]): AnalysisResult {
  const start = performance.now();
  const graph = buildGraph(transactions);

  const cycleRings = detectCycles(graph);
  const smurfRings = detectSmurfing(transactions, graph);
  const layerRings = detectLayering(graph);

  const allRings = [...cycleRings, ...smurfRings, ...layerRings];
  const suspiciousAccounts = scoreAccounts(allRings, graph);

  const elapsed = (performance.now() - start) / 1000;

  return {
    suspicious_accounts: suspiciousAccounts,
    fraud_rings: allRings,
    summary: {
      total_accounts_analyzed: graph.accounts.size,
      suspicious_accounts_flagged: suspiciousAccounts.length,
      fraud_rings_detected: allRings.length,
      processing_time_seconds: Math.round(elapsed * 1000) / 1000,
    },
  };
}

export function buildGraphData(
  transactions: Transaction[],
  result: AnalysisResult
): GraphData {
  const suspiciousMap = new Map(
    result.suspicious_accounts.map((a) => [a.account_id, a])
  );
  const accountSet = new Set<string>();

  // Build edge list
  const edges: GraphData["edges"] = [];
  for (const tx of transactions) {
    accountSet.add(tx.sender_id);
    accountSet.add(tx.receiver_id);
    edges.push({
      id: tx.transaction_id,
      source: tx.sender_id,
      target: tx.receiver_id,
      amount: tx.amount,
    });
  }

  // Compute per-account stats
  const statsMap = new Map<string, { inDegree: number; outDegree: number; totalIn: number; totalOut: number; txCount: number }>();
  const getStats = (id: string) => {
    if (!statsMap.has(id)) statsMap.set(id, { inDegree: 0, outDegree: 0, totalIn: 0, totalOut: 0, txCount: 0 });
    return statsMap.get(id)!;
  };
  for (const tx of transactions) {
    const s = getStats(tx.sender_id);
    s.outDegree++;
    s.totalOut += tx.amount;
    s.txCount++;
    const r = getStats(tx.receiver_id);
    r.inDegree++;
    r.totalIn += tx.amount;
    r.txCount++;
  }

  const nodes: GraphData["nodes"] = Array.from(accountSet).map((id) => {
    const sa = suspiciousMap.get(id);
    const st = getStats(id);
    return {
      id,
      label: id,
      score: sa?.score || 0,
      suspicious: !!sa,
      inDegree: st.inDegree,
      outDegree: st.outDegree,
      totalIn: st.totalIn,
      totalOut: st.totalOut,
      txCount: st.txCount,
      patterns: sa?.patterns || [],
      reasons: sa?.reasons || [],
    };
  });

  return { nodes, edges };
}
