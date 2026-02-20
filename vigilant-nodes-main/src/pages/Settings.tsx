import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, LogOut, Info, Shield, Code, Globe } from "lucide-react";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-mono text-foreground">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Sun className="w-4 h-4 text-primary" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-warning" />}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {theme === "dark" ? "Cybersecurity dark theme" : "Modern light theme"}
                  </p>
                </div>
              </div>
              <Switch checked={theme === "light"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-mono font-bold text-foreground text-sm">
                  MULE<span className="text-primary">DETECT</span>
                </p>
                <p className="text-xs text-muted-foreground">v2.0 — Hackathon Edition</p>
              </div>
            </div>
            <InfoRow icon={<Code className="w-3.5 h-3.5" />} label="Built with" value="React + Cytoscape.js" />
            <InfoRow icon={<Shield className="w-3.5 h-3.5" />} label="Detection" value="Cycle, Smurfing, Layering" />
            <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Processing" value="100% Client-Side" />
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              MuleDetect is a graph-based financial crime analysis platform that detects money muling patterns 
              using advanced cycle detection, smurfing analysis, and layered shell detection algorithms.
            </p>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sign Out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account</p>
              </div>
              <Button variant="destructive" onClick={handleLogout} className="font-mono">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-mono">{label}</span>
      </div>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}

export default Settings;
