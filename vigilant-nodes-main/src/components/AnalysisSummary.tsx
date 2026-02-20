import { AnalysisResult } from "@/types/transaction";
import { Shield, Users, AlertTriangle, Clock } from "lucide-react";

interface AnalysisSummaryProps {
  summary: AnalysisResult["summary"];
}

export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  const stats = [
    {
      label: "Accounts Analyzed",
      value: summary.total_accounts_analyzed,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      label: "Suspicious Flagged",
      value: summary.suspicious_accounts_flagged,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
    },
    {
      label: "Fraud Rings",
      value: summary.fraud_rings_detected,
      icon: Shield,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
    },
    {
      label: "Processing Time",
      value: `${summary.processing_time_seconds}s`,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg border ${stat.borderColor} ${stat.bgColor} p-4 flex flex-col gap-2 card-glow`}
        >
          <div className="flex items-center gap-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground font-mono">{stat.label}</span>
          </div>
          <span className={`text-2xl font-bold font-mono ${stat.color}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
