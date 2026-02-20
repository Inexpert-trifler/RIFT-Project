import { FraudRing, SuspiciousAccount } from "@/types/transaction";
import { AdjacencyGraph } from "./graphBuilder";

/**
 * Production-grade suspicion scoring:
 * - Cycle: +40, Smurfing: +30, Layering: +20
 * - Multi-pattern bonus: +10
 * - False positive suppression via temporal dispersion
 * - Normalized 0–100 float scale, sorted descending
 */
export function scoreAccounts(
  fraudRings: FraudRing[],
  graph: AdjacencyGraph
): SuspiciousAccount[] {
  const accountScores = new Map<string, {
    score: number;
    reasons: Set<string>;
    patterns: Set<string>;
    ringCount: number;
  }>();

  function getOrCreate(id: string) {
    if (!accountScores.has(id)) {
      accountScores.set(id, { score: 0, reasons: new Set(), patterns: new Set(), ringCount: 0 });
    }
    return accountScores.get(id)!;
  }

  for (const ring of fraudRings) {
    for (const member of ring.members) {
      const acct = getOrCreate(member);
      acct.ringCount++;

      switch (ring.type) {
        case "cycle":
          if (!acct.patterns.has("cycle")) {
            acct.score += 40;
            acct.patterns.add("cycle");
            acct.reasons.add(`Part of cyclic fraud ring (${ring.ring_id})`);
          } else {
            // Additional cycles add diminishing score
            acct.score += 5;
            acct.reasons.add(`Multiple cycle involvement (${ring.ring_id})`);
          }
          break;
        case "smurfing_fan_in":
        case "smurfing_fan_out":
          if (!acct.patterns.has("smurfing")) {
            acct.score += 30;
            acct.patterns.add("smurfing");
            acct.reasons.add(`Smurfing pattern: ${ring.type.replace("smurfing_", "")} (${ring.ring_id})`);
          } else {
            acct.score += 5;
            acct.reasons.add(`Additional smurfing pattern (${ring.ring_id})`);
          }
          break;
        case "layering":
          if (!acct.patterns.has("layering")) {
            acct.score += 20;
            acct.patterns.add("layering");
            acct.reasons.add(`Layered transaction chain (${ring.ring_id})`);
          } else {
            acct.score += 3;
            acct.reasons.add(`Additional layering chain (${ring.ring_id})`);
          }
          break;
      }
    }
  }

  // Multi-pattern bonus
  for (const [, acct] of accountScores) {
    if (acct.patterns.size > 1) {
      acct.score += 10;
      acct.reasons.add(`Multi-pattern involvement (${acct.patterns.size} distinct patterns)`);
    }
    // Ring multiplicity bonus (involved in 3+ rings)
    if (acct.ringCount >= 3) {
      acct.score += 5;
      acct.reasons.add(`High ring involvement (${acct.ringCount} rings)`);
    }
  }

  // False positive suppression via temporal dispersion
  for (const [id, acct] of accountScores) {
    const stats = graph.accountStats.get(id);
    if (!stats) continue;

    const activitySpanDays = (stats.lastSeen - stats.firstSeen) / (1000 * 60 * 60 * 24);

    // Long-term high-volume legitimate accounts get penalty reduction
    if (activitySpanDays > 60 && stats.txCount > 100) {
      const reduction = Math.min(acct.score * 0.4, 30);
      acct.score -= reduction;
      acct.reasons.add(`Score reduced: long-term high-volume account (${Math.round(activitySpanDays)}d, ${stats.txCount} txs)`);
    }
    // Accounts with very high partner diversity are likely legitimate hubs
    if (stats.uniquePartners.size > 50 && activitySpanDays > 30) {
      const reduction = Math.min(acct.score * 0.3, 20);
      acct.score -= reduction;
      acct.reasons.add(`Score reduced: high partner diversity (${stats.uniquePartners.size} unique partners)`);
    }
  }

  // Normalize to 0–100 float
  for (const [, acct] of accountScores) {
    acct.score = Math.round(Math.max(0, Math.min(100, acct.score)) * 100) / 100;
  }

  return Array.from(accountScores.entries())
    .map(([id, data]) => ({
      account_id: id,
      score: data.score,
      reasons: Array.from(data.reasons),
      patterns: Array.from(data.patterns),
    }))
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score);
}
