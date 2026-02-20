import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, TrendingUp, FileText, Shield, IndianRupee, Calendar, Building2 } from "lucide-react";

const mockProfile = {
  name: "Rahul Sharma",
  email: "rahul.sharma@gmail.com",
  phone: "+91 98765 43210",
  accountNo: "XXXX-XXXX-4521",
  bank: "State Bank of India",
  ifsc: "SBIN0001234",
  branch: "MG Road, Bangalore",
  cibilScore: 742,
  panCard: "ABCPS1234Q",
  aadhar: "XXXX-XXXX-6789",
  kycStatus: "Verified",
  pastLoans: [
    { type: "Home Loan", amount: 2500000, status: "Active", emi: 22000, startDate: "2021-06" },
    { type: "Personal Loan", amount: 300000, status: "Closed", emi: 0, startDate: "2019-03" },
    { type: "Car Loan", amount: 800000, status: "Active", emi: 15000, startDate: "2023-01" },
  ],
  recentTransactions: [
    { id: "TXN001", date: "2024-12-15", amount: -15000, desc: "EMI Payment - Home Loan", type: "debit" },
    { id: "TXN002", date: "2024-12-14", amount: 85000, desc: "Salary Credit", type: "credit" },
    { id: "TXN003", date: "2024-12-12", amount: -3500, desc: "Electricity Bill", type: "debit" },
    { id: "TXN004", date: "2024-12-10", amount: -12000, desc: "Online Shopping", type: "debit" },
    { id: "TXN005", date: "2024-12-08", amount: 5000, desc: "UPI Transfer Received", type: "credit" },
    { id: "TXN006", date: "2024-12-05", amount: -22000, desc: "EMI Payment - Car Loan", type: "debit" },
  ],
};

function getCibilColor(score: number) {
  if (score >= 750) return "text-success";
  if (score >= 650) return "text-warning";
  return "text-destructive";
}

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-mono text-foreground">User Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
                {mockProfile.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{user?.name || mockProfile.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email || mockProfile.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Phone" value={mockProfile.phone} />
              <Row label="PAN" value={mockProfile.panCard} />
              <Row label="Aadhar" value={mockProfile.aadhar} />
              <Row label="KYC" value={<Badge variant="outline" className="text-success border-success/30 text-[10px]">{mockProfile.kycStatus}</Badge>} />
            </div>
          </CardContent>
        </Card>

        {/* Banking Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Banking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Bank" value={mockProfile.bank} />
            <Row label="Account" value={mockProfile.accountNo} />
            <Row label="IFSC" value={mockProfile.ifsc} />
            <Row label="Branch" value={mockProfile.branch} />
          </CardContent>
        </Card>

        {/* CIBIL Score */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> CIBIL Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className={`text-5xl font-bold font-mono ${getCibilColor(mockProfile.cibilScore)}`}>
              {mockProfile.cibilScore}
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-destructive via-warning to-success"
                style={{ width: `${(mockProfile.cibilScore / 900) * 100}%` }}
              />
            </div>
            <div className="flex justify-between w-full text-[10px] text-muted-foreground font-mono">
              <span>300</span><span>500</span><span>700</span><span>900</span>
            </div>
            <Badge variant="outline" className="text-success border-success/30">Good Standing</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Past Loans */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" /> Loan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Type</th>
                  <th className="text-right px-4 py-2 font-mono text-xs text-muted-foreground">Amount</th>
                  <th className="text-right px-4 py-2 font-mono text-xs text-muted-foreground">EMI</th>
                  <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Since</th>
                  <th className="text-left px-4 py-2 font-mono text-xs text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockProfile.pastLoans.map((loan, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{loan.type}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">₹{loan.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">₹{loan.emi.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{loan.startDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${loan.status === "Active" ? "text-primary border-primary/30" : "text-muted-foreground border-border"}`}>
                        {loan.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Recent Banking Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockProfile.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.type === "credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {tx.type === "credit" ? "+" : "-"}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{tx.desc}</p>
                    <p className="text-xs text-muted-foreground font-mono">{tx.date}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm font-bold ${tx.type === "credit" ? "text-success" : "text-destructive"}`}>
                  {tx.type === "credit" ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/30">
      <span className="text-muted-foreground font-mono text-xs">{label}</span>
      <span className="text-foreground text-xs font-medium">{typeof value === "string" ? value : value}</span>
    </div>
  );
}

export default Profile;
