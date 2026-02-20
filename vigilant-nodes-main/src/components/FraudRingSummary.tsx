import { FraudRing } from "@/types/transaction";

interface FraudRingSummaryProps {
  rings: FraudRing[];
}

const typeLabels: Record<string, { label: string; className: string }> = {
  cycle: { label: "Cycle", className: "bg-destructive/10 text-destructive border-destructive/20" },
  smurfing_fan_in: { label: "Fan-In", className: "bg-warning/10 text-warning border-warning/20" },
  smurfing_fan_out: { label: "Fan-Out", className: "bg-warning/10 text-warning border-warning/20" },
  layering: { label: "Layering", className: "bg-primary/10 text-primary border-primary/20" },
};

export function FraudRingSummary({ rings }: FraudRingSummaryProps) {
  if (rings.length === 0) return null;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-secondary/50 px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse-glow" />
          Fraud Rings ({rings.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Ring ID</th>
              <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Type</th>
              <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Members</th>
              <th className="text-right px-4 py-2 font-mono text-xs text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rings.map((ring) => {
              const t = typeLabels[ring.type] || typeLabels.cycle;
              return (
                <tr key={ring.ring_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{ring.ring_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${t.className}`}>
                      {t.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {ring.members.length} accounts
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                    ${ring.total_amount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
