import { Transaction } from "@/types/transaction";

export function generateSampleData(): Transaction[] {
  const txs: Transaction[] = [];
  let id = 1;

  // Generate timestamps within a controlled range for temporal analysis
  const baseDate = new Date("2024-06-01T08:00:00Z").getTime();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  const ts = (offsetMs: number) => {
    const d = new Date(baseDate + offsetMs);
    return d.toISOString().replace("T", " ").substring(0, 19);
  };

  const parsedTime = (offsetMs: number) => baseDate + offsetMs;

  const push = (sender: string, receiver: string, amount: number, offsetMs: number) => {
    const timestamp = ts(offsetMs);
    txs.push({
      transaction_id: `TX_${id++}`,
      sender_id: sender,
      receiver_id: receiver,
      amount: Math.round(amount * 100) / 100,
      timestamp,
      parsed_time: parsedTime(offsetMs),
    });
  };

  // === Cycle: A->B->C->A (within hours of each other) ===
  push("ACC_101", "ACC_102", 5200, 0);
  push("ACC_102", "ACC_103", 5100, 2 * hour);
  push("ACC_103", "ACC_101", 4900, 4 * hour);

  // === Cycle 2: D->E->F->G->D (4-node cycle) ===
  push("ACC_201", "ACC_202", 3000, 1 * day);
  push("ACC_202", "ACC_203", 2800, 1 * day + 3 * hour);
  push("ACC_203", "ACC_204", 2600, 1 * day + 6 * hour);
  push("ACC_204", "ACC_201", 2500, 1 * day + 9 * hour);

  // === Smurfing Fan-In: 12 senders → ACC_300 within 48 hours ===
  for (let i = 0; i < 12; i++) {
    push(
      `ACC_4${String(i).padStart(2, "0")}`,
      "ACC_300",
      800 + Math.random() * 500,
      2 * day + i * 3 * hour // spread over ~36 hours
    );
  }

  // === Smurfing Fan-Out: ACC_500 → 11 receivers within 24 hours ===
  for (let i = 0; i < 11; i++) {
    push(
      "ACC_500",
      `ACC_6${String(i).padStart(2, "0")}`,
      600 + Math.random() * 400,
      4 * day + i * 2 * hour // spread over ~22 hours
    );
  }

  // === Layering chain: ACC_700 -> X01 -> X02 -> ACC_800 (rapid, low-activity intermediaries) ===
  push("ACC_700", "ACC_X01", 15000, 6 * day);
  push("ACC_X01", "ACC_X02", 14500, 6 * day + 4 * hour);
  push("ACC_X02", "ACC_800", 14000, 6 * day + 8 * hour);

  // === Normal transactions (spread over 90 days for contrast) ===
  for (let i = 0; i < 40; i++) {
    const s = `ACC_N${String(Math.floor(Math.random() * 20)).padStart(2, "0")}`;
    const r = `ACC_N${String(Math.floor(Math.random() * 20)).padStart(2, "0")}`;
    if (s !== r) {
      push(s, r, 100 + Math.random() * 5000, Math.random() * 90 * day);
    }
  }

  return txs.sort((a, b) => a.parsed_time - b.parsed_time);
}
