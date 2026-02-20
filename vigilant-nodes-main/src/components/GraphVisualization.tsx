import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { GraphData } from "@/types/transaction";
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GraphVisualizationProps {
  data: GraphData;
}

interface TooltipData {
  x: number;
  y: number;
  id: string;
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

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${n.toFixed(2)}`;

export function GraphVisualization({ data }: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [
      ...data.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          score: n.score,
          suspicious: n.suspicious,
          inDegree: n.inDegree,
          outDegree: n.outDegree,
          totalIn: n.totalIn,
          totalOut: n.totalOut,
          txCount: n.txCount,
          patterns: n.patterns,
          reasons: n.reasons,
          // Size node by transaction count
          nodeSize: Math.max(24, Math.min(60, 20 + n.txCount * 2)),
        },
      })),
      ...data.edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          amount: e.amount,
          edgeWidth: Math.max(1, Math.min(6, Math.log10(e.amount + 1))),
        },
      })),
    ];

    if (cyRef.current) cyRef.current.destroy();

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "font-size": "9px",
            "font-family": "JetBrains Mono, monospace",
            color: "#94a3b8",
            "text-valign": "bottom",
            "text-margin-y": 8,
            "background-color": "#1e293b",
            "border-width": 2,
            "border-color": "#334155",
            width: "data(nodeSize)",
            height: "data(nodeSize)",
            "overlay-opacity": 0,
            "transition-property": "border-color, border-width, background-color",
            "transition-duration": "150ms" as any,
          },
        },
        {
          selector: "node[?suspicious]",
          style: {
            "background-color": "#dc2626",
            "border-color": "#f87171",
            "border-width": 3,
            color: "#fbbf24",
            "font-weight": "bold",
            "font-size": "10px",
          },
        },
        {
          selector: "node.highlighted",
          style: {
            "border-width": 4,
            "border-color": "#22d3ee",
            "background-color": "#0e7490",
            "z-index": 999,
          } as any,
        },
        {
          selector: "node.neighbor",
          style: {
            "border-width": 3,
            "border-color": "#38bdf8",
            opacity: 1,
          },
        },
        {
          selector: "node.dimmed",
          style: {
            opacity: 0.15,
          },
        },
        {
          selector: "edge",
          style: {
            width: "data(edgeWidth)",
            "line-color": "#334155",
            "target-arrow-color": "#475569",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            opacity: 0.5,
            "arrow-scale": 0.8,
          },
        },
        {
          selector: "edge.highlighted",
          style: {
            "line-color": "#22d3ee",
            "target-arrow-color": "#22d3ee",
            opacity: 1,
            width: 3,
            "z-index": 999,
            label: "data(amount)",
            "font-size": "8px",
            "font-family": "JetBrains Mono, monospace",
            color: "#67e8f9",
            "text-background-color": "#0f172a",
            "text-background-opacity": 0.9,
            "text-background-padding": "3px" as any,
            "text-rotation": "autorotate",
          } as any,
        },
        {
          selector: "edge.dimmed",
          style: {
            opacity: 0.05,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: false,
        nodeDimensionsIncludeLabels: true,
        randomize: true,
        idealEdgeLength: () => 150,
        nodeRepulsion: () => 12000,
        gravity: 0.3,
        nestingFactor: 0.5,
      } as any,
      minZoom: 0.15,
      maxZoom: 4,
      wheelSensitivity: 0.3,
    });

    const cy = cyRef.current;

    // Hover: highlight neighborhood
    cy.on("mouseover", "node", (e) => {
      const node = e.target;
      const neighborhood = node.neighborhood().add(node);

      cy.elements().addClass("dimmed");
      neighborhood.removeClass("dimmed");
      node.addClass("highlighted");
      node.connectedEdges().addClass("highlighted");
      node.neighborhood("node").addClass("neighbor");

      // Show tooltip
      const pos = node.renderedPosition();
      const containerRect = containerRef.current!.getBoundingClientRect();
      setTooltip({
        x: containerRect.left + pos.x,
        y: containerRect.top + pos.y,
        id: node.data("id"),
        score: node.data("score"),
        suspicious: node.data("suspicious"),
        inDegree: node.data("inDegree"),
        outDegree: node.data("outDegree"),
        totalIn: node.data("totalIn"),
        totalOut: node.data("totalOut"),
        txCount: node.data("txCount"),
        patterns: node.data("patterns") || [],
        reasons: node.data("reasons") || [],
      });
    });

    cy.on("mouseout", "node", () => {
      cy.elements().removeClass("dimmed highlighted neighbor");
      cy.edges().removeClass("highlighted");
      setTooltip(null);
    });

    // Edge hover
    cy.on("mouseover", "edge", (e) => {
      const edge = e.target;
      edge.addClass("highlighted");
    });
    cy.on("mouseout", "edge", (e) => {
      e.target.removeClass("highlighted");
    });

    return () => {
      cy.destroy();
    };
  }, [data]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.3);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() / 1.3);
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleReset = () => {
    if (!cyRef.current) return;
    cyRef.current.layout({
      name: "cose",
      animate: true,
      animationDuration: 500,
      nodeDimensionsIncludeLabels: true,
      randomize: true,
      idealEdgeLength: () => 150,
      nodeRepulsion: () => 12000,
    } as any).run();
  };

  const suspiciousCount = data.nodes.filter((n) => n.suspicious).length;
  const normalCount = data.nodes.length - suspiciousCount;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <Button variant="outline" size="icon" className="h-7 w-7 bg-card/80 backdrop-blur border-border/50" onClick={handleZoomIn}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7 bg-card/80 backdrop-blur border-border/50" onClick={handleZoomOut}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7 bg-card/80 backdrop-blur border-border/50" onClick={handleFit}>
          <Maximize className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7 bg-card/80 backdrop-blur border-border/50" onClick={handleReset}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 bg-card/80 backdrop-blur border border-border/50 rounded-lg px-3 py-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1e293b] border-2 border-[#334155] inline-block" />
          <span className="text-muted-foreground">Normal ({normalCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#dc2626] border-2 border-[#f87171] inline-block" />
          <span className="text-destructive">Suspicious ({suspiciousCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-[#334155] inline-block" />
          <span className="text-muted-foreground">Transaction flow</span>
        </div>
      </div>

      {/* Graph */}
      <div
        ref={containerRef}
        className="w-full h-[600px] rounded-lg bg-card border border-border"
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x + 20,
            top: tooltip.y - 10,
            maxWidth: 320,
          }}
        >
          <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs font-mono space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-foreground truncate">{tooltip.id}</span>
              {tooltip.suspicious ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/20 text-destructive border border-destructive/30 shrink-0">
                  ⚠ SUSPICIOUS
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/30 shrink-0">
                  NORMAL
                </span>
              )}
            </div>

            {/* Score bar */}
            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Risk Score</span>
                <span className={tooltip.score >= 50 ? "text-destructive font-bold" : "text-foreground"}>
                  {tooltip.score.toFixed(1)}/100
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${tooltip.score}%`,
                    background: tooltip.score >= 70 ? "#dc2626" : tooltip.score >= 40 ? "#f59e0b" : "#22c55e",
                  }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Transactions</span>
                <span className="text-foreground">{tooltip.txCount}</span>
              </div>
              <div className="flex justify-between">
                <span>In / Out</span>
                <span className="text-foreground">{tooltip.inDegree} / {tooltip.outDegree}</span>
              </div>
              <div className="flex justify-between">
                <span>Total In</span>
                <span className="text-emerald-400">{fmt(tooltip.totalIn)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Out</span>
                <span className="text-red-400">{fmt(tooltip.totalOut)}</span>
              </div>
            </div>

            {/* Patterns */}
            {tooltip.patterns.length > 0 && (
              <div>
                <span className="text-muted-foreground block mb-1">Detected Patterns</span>
                <div className="flex flex-wrap gap-1">
                  {tooltip.patterns.map((p, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-warning/15 text-warning border border-warning/30">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reasons */}
            {tooltip.reasons.length > 0 && (
              <div>
                <span className="text-muted-foreground block mb-1">Flagging Reasons</span>
                <ul className="space-y-0.5 text-foreground">
                  {tooltip.reasons.slice(0, 4).map((r, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-destructive shrink-0">›</span>
                      <span className="text-[10px] leading-tight">{r}</span>
                    </li>
                  ))}
                  {tooltip.reasons.length > 4 && (
                    <li className="text-muted-foreground text-[10px]">+{tooltip.reasons.length - 4} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
