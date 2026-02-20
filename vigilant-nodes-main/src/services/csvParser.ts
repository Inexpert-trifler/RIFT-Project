import Papa from "papaparse";
import { Transaction } from "@/types/transaction";

const REQUIRED_FIELDS = ["transaction_id", "sender_id", "receiver_id", "amount", "timestamp"] as const;

// Accepts YYYY-MM-DD HH:MM:SS or ISO 8601
function parseTimestamp(raw: string): number | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  // Try YYYY-MM-DD HH:MM:SS
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const d = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  // Fallback ISO parse
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d.getTime();
  return null;
}

export function parseCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        for (const f of REQUIRED_FIELDS) {
          if (!headers.includes(f)) {
            reject(new Error(`Missing required column: "${f}". Expected: ${REQUIRED_FIELDS.join(", ")}`));
            return;
          }
        }

        const transactions: Transaction[] = [];
        const seenIds = new Set<string>();
        let skipped = 0;

        for (const row of results.data as Record<string, string>[]) {
          const txId = row.transaction_id?.trim();
          const senderId = row.sender_id?.trim();
          const receiverId = row.receiver_id?.trim();
          const amountStr = row.amount?.trim();
          const timestampStr = row.timestamp?.trim() || "";

          // Strict validation
          if (!txId || !senderId || !receiverId || !amountStr) { skipped++; continue; }
          if (senderId === receiverId) { skipped++; continue; } // self-loop
          if (seenIds.has(txId)) { skipped++; continue; } // duplicate tx

          const amount = parseFloat(amountStr);
          if (isNaN(amount) || amount <= 0) { skipped++; continue; }

          const parsedTime = parseTimestamp(timestampStr);
          if (parsedTime === null) { skipped++; continue; }

          seenIds.add(txId);
          transactions.push({
            transaction_id: txId,
            sender_id: senderId,
            receiver_id: receiverId,
            amount,
            timestamp: timestampStr,
            parsed_time: parsedTime,
          });
        }

        if (transactions.length === 0) {
          reject(new Error(`No valid transactions found. ${skipped} rows rejected during validation.`));
        } else {
          // Sort by timestamp for temporal analysis
          transactions.sort((a, b) => a.parsed_time - b.parsed_time);
          resolve(transactions);
        }
      },
      error: (err) => reject(new Error(`CSV parse error: ${err.message}`)),
    });
  });
}
