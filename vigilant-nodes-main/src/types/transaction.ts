export interface Transaction {
  transaction_id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  timestamp: string;
  parsed_time: number; // epoch ms for temporal analysis
}

export interface SuspiciousAccount {
  account_id: string;
  score: number;
  reasons: string[];
  patterns: string[];
}

export interface FraudRing {
  ring_id: string;
  members: string[];
  type: "cycle" | "smurfing_fan_in" | "smurfing_fan_out" | "layering";
  total_amount: number;
}

export interface AnalysisResult {
  suspicious_accounts: SuspiciousAccount[];
  fraud_rings: FraudRing[];
  summary: {
    total_accounts_analyzed: number;
    suspicious_accounts_flagged: number;
    fraud_rings_detected: number;
    processing_time_seconds: number;
  };
}

export interface GraphNode {
  id: string;
  label: string;
  score: number;
  suspicious: boolean;
  inDegree: number;
  outDegree: number;
  totalIn: number;
  totalOut: number;
  txCount: number;
  patterns: string[];
  reasons: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
