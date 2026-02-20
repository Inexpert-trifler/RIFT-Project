# RIFT-Project
Graph-Based Financial Crime Detection Engine
RIFT 2026 Hackathon – Money Muling Detection Challenge
🚀 Live Demo

🔗 Live Application:
https://lambent-pegasus-c7de7f.netlify.app/

🎥 Demo Video (LinkedIn Post):
[Add LinkedIn Video Link Here]

📂 GitHub Repository:
https://github.com/Inexpert-trifler/RIFT-Project

📌 Problem Statement

Money muling is a financial crime where illegal funds are transferred through networks of accounts to hide their origin.

Traditional database queries fail to detect these multi-hop fraud networks.

Our solution builds a Graph-Based Financial Forensics Engine that:

Converts transaction data into a directed graph

Detects hidden money muling rings

Flags suspicious accounts

Generates structured forensic reports

🧠 Our Approach

Instead of treating transactions as simple rows, we model them as a graph:

Each account → Node

Each transaction → Directed Edge (sender → receiver)

This allows us to detect complex fraud patterns using graph traversal and structural analysis.

🔍 Detection Patterns Implemented
1️⃣ Circular Fund Routing (Cycles)

Detect cycles of length 3–5

Example: A → B → C → A

All accounts in the cycle are grouped into the same fraud ring

2️⃣ Smurfing (Fan-In / Fan-Out)

Fan-In: 10+ senders → 1 receiver

Fan-Out: 1 sender → 10+ receivers

Temporal window analysis within 72 hours

Helps detect transaction structuring to avoid reporting thresholds

3️⃣ Layered Shell Networks

Chains of 3+ hops

Intermediate accounts have very low transaction counts

Used to obscure transaction origins

🎯 Suspicion Score Methodology

Each account is assigned a score between 0–100 based on:

Participation in fraud rings

Number of detected suspicious patterns

Temporal anomalies

Graph centrality within suspicious clusters

Scores are sorted in descending order in the output.

📊 Features

✔ CSV Upload (Strict format compliance)
✔ Sample Data Generator
✔ Interactive Graph Visualization
✔ Suspicious Accounts Table
✔ Fraud Rings Summary Table
✔ Downloadable JSON Output (Exact required format)
✔ Processing Time Metrics
✔ Fully Deployed Live Web App

📥 Input Specification

The application accepts CSV files with the following columns:

Column Name	Data Type	Description
transaction_id	String	Unique transaction ID
sender_id	String	Sender account ID
receiver_id	String	Receiver account ID
amount	Float	Transaction amount
timestamp	DateTime	YYYY-MM-DD HH:MM:SS
📤 Output Format

The system generates:

1️⃣ Interactive Graph Visualization

Directed graph

Suspicious nodes highlighted

Hover interaction

2️⃣ JSON Export File
{
  "suspicious_accounts": [
    {
      "account_id": "ACC_00123",
      "suspicion_score": 87.5,
      "detected_patterns": ["cycle_length_3", "high_velocity"],
      "ring_id": "RING_001"
    }
  ],
  "fraud_rings": [
    {
      "ring_id": "RING_001",
      "member_accounts": ["ACC_00123", "..."],
      "pattern_type": "cycle",
      "risk_score": 95.3
    }
  ],
  "summary": {
    "total_accounts_analyzed": 500,
    "suspicious_accounts_flagged": 15,
    "fraud_rings_detected": 4,
    "processing_time_seconds": 2.3
  }
}

All outputs strictly follow hackathon evaluation format.

🏗 System Architecture

CSV Parser

Graph Construction Module

Fraud Pattern Detection Engine

Suspicion Scoring Module

Visualization Engine

JSON Report Generator

Processing is performed in-memory for optimal performance.

⚙️ Tech Stack
Frontend

HTML

CSS

JavaScript

Graph Visualization Library

Backend

Node.js

Express.js

Deployment

Netlify

📈 Performance

Handles datasets up to 10,000 transactions

Processing time ≤ 30 seconds

Optimized graph traversal (DFS/BFS based)

Reduced false positives by excluding legitimate high-volume patterns

🛠 Installation & Setup
1️⃣ Clone Repository
https://github.com/Inexpert-trifler/RIFT-Project
2️⃣ Install Dependencies
npm install
3️⃣ Start Server
npm start

Server runs on:

http://localhost:3000
🧪 Usage Instructions

Login using email

Upload CSV file

Click “Run Detection Engine”

View graph and tables

Export JSON results

⚠ Known Limitations

Extremely large datasets (>50K transactions) may require optimization

Rule-based scoring (not ML-based)

Temporal window is fixed (72 hours)

Future improvements include:

Machine learning-based anomaly detection

Real-time streaming analysis

Advanced graph centrality scoring

👨‍💻 Team Members

Saransh Yadav

Kunal Adtani

Dhruv Sharma

First-Year Engineering Students
RIFT 2026 Hackathon Participants

🏁 Conclusion

Vigilant Nodes transforms raw transaction data into structured graph intelligence.

It detects hidden money muling networks using graph theory, risk scoring, and interactive visualization — enabling faster and more transparent financial crime detection.

Follow the money.
