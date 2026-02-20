import { SuspiciousAccount } from "@/types/transaction";

interface SuspiciousAccountsTableProps {
  accounts: SuspiciousAccount[];
}

function getScoreColor(score: number) {
  if (score >= 70) return "text-destructive";
  if (score >= 40) return "text-warning";
  return "text-primary";
}

function getScoreBarColor(score: number) {
  if (score >= 70) return "bg-destructive";
  if (score >= 40) return "bg-warning";
  return "bg-primary";
}

export function SuspiciousAccountsTable({ accounts }: SuspiciousAccountsTableProps) {
  if (accounts.length === 0) return null;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-secondary/50 px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-glow" />
          Suspicious Accounts ({accounts.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Account</th>
              <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Score</th>
              <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Patterns</th>
              <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Reasons</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acct) => (
              <tr key={acct.account_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-foreground">{acct.account_id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${getScoreColor(acct.score)}`}>
                      {acct.score}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBarColor(acct.score)}`}
                        style={{ width: `${acct.score}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {acct.patterns.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                  {acct.reasons.join("; ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
