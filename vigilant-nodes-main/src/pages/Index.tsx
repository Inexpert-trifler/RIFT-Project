import { useState, useCallback } from "react";
import { parseCSV } from "@/services/csvParser";
import { runAnalysis, buildGraphData } from "@/services/analysisEngine";
import { generateSampleData } from "@/services/sampleDataGenerator";
import { Transaction, AnalysisResult, GraphData } from "@/types/transaction";
import { FileUpload } from "@/components/FileUpload";
import { GraphVisualization } from "@/components/GraphVisualization";
import { SuspiciousAccountsTable } from "@/components/SuspiciousAccountsTable";
import { FraudRingSummary } from "@/components/FraudRingSummary";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import { Download, Play, Loader2, Database, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fileName, setFileName] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string>();

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(undefined);
    setResult(null);
    setGraphData(null);
    try {
      const txs = await parseCSV(file);
      setTransactions(txs);
      setFileName(file.name);
      toast.success(`Loaded ${txs.length} transactions`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoadSample = useCallback(() => {
    const txs = generateSampleData();
    setTransactions(txs);
    setFileName("sample-data.csv");
    setResult(null);
    setGraphData(null);
    setError(undefined);
    toast.success(`Loaded ${txs.length} sample transactions with embedded fraud patterns`);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (transactions.length === 0) {
      setError("Upload a CSV file first");
      return;
    }
    setIsAnalyzing(true);
    setError(undefined);
    setTimeout(() => {
      try {
        const analysisResult = runAnalysis(transactions);
        const graph = buildGraphData(transactions, analysisResult);
        setResult(analysisResult);
        setGraphData(graph);
        toast.success("Analysis complete!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setIsAnalyzing(false);
      }
    }, 50);
  }, [transactions]);

  const handleExport = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis-report.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Upload + Sample Data Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <Card className="lg:col-span-2 border-dashed border-2 border-primary/20 bg-card/60 card-glow">
          <CardContent className="pt-6">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} fileName={fileName} />
          </CardContent>
        </Card>

        {/* Sample Data Card */}
        <Card className="bg-card/60 card-glow">
          <CardContent className="pt-6 flex flex-col items-center justify-center gap-4 h-full text-center">
            <div className="w-14 h-14 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-center glow-warning">
              <Database className="w-7 h-7 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">No CSV? Try sample data</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generates transactions with embedded fraud patterns
              </p>
            </div>
            <Button onClick={handleLoadSample} variant="outline" className="font-mono text-xs border-warning/30 text-warning hover:bg-warning/10">
              <Database className="w-3.5 h-3.5 mr-1.5" /> Load Sample Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {transactions.length > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            {transactions.length.toLocaleString()} transactions loaded
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {!transactions.length && (
            <span className="text-xs text-muted-foreground font-mono">Upload data first</span>
          )}
          <Button
            onClick={handleAnalyze}
            disabled={transactions.length === 0 || isAnalyzing}
            className="font-mono text-xs glow-primary"
          >
            {isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isAnalyzing ? "Analyzing..." : "Run Detection Engine"}
          </Button>
          {result && (
            <Button onClick={handleExport} variant="outline" size="sm" className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export JSON
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-mono">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!result && (
        <Card className="bg-card/30 border-dashed border-primary/10">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
              <Network className="w-10 h-10 text-primary/30" />
            </div>
            <p className="text-sm font-medium text-foreground">Upload transaction data to begin</p>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              The detection engine will analyze patterns including cycles, smurfing, and layering
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <AnalysisSummary summary={result.summary} />
          {graphData && graphData.nodes.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Transaction Graph
              </h2>
              <GraphVisualization data={graphData} />
            </section>
          )}
          <SuspiciousAccountsTable accounts={result.suspicious_accounts} />
          <FraudRingSummary rings={result.fraud_rings} />
        </div>
      )}
    </div>
  );
};

export default Index;
