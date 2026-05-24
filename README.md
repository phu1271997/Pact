# 🎯 Pact - Personal Commitment Smart Contracts on GenLayer

> "Put your money where your mouth is. Let AI hold you accountable."

Pact is a decentralized, fully autonomous personal commitment platform built on the **GenLayer Testnet**. Users stake native `GEN` tokens on personal goals (e.g. running 100km a month, coding on GitHub daily, completing Duolingo streaks) and set an impartial AI Validator as the referee.

- **✅ If you succeed:** Your stake is returned directly to your wallet (minus a 1% protocol fee).
- **❌ If you fail:** 100% of your stake is immediately donated to a charity of your choice—or to an **"Anti-Charity"** (an organization you absolutely despise) to provide maximum psychological friction!

---

## 🌟 WHY PACT?

Traditional commitment services (like Beeminder or StickK) suffer from key issues:
1. **Centralization:** A single entity controls your funds.
2. **Referee Dependency:** You must trust a human referee to report results honestly, or pay for validation.
3. **Friction:** Constant manual logging of evidence is boring.

**Pact solves this using GenLayer's Intelligent Contracts:**
- **Autonomous Web2 Audits:** The contract connects directly to your Web2 profiles (GitHub, Strava, Goodreads) using GenLayer's deterministic web rendering APIs.
- **Trustless Judgement:** Impartial LLM nodes evaluate evidence on-chain against natural language criteria.
- **Consensus Guarantee:** Sub-validators verify the leader's judgement before payouts can occur, ensuring 100% secure, decentralized accountability.

---

## 🏗️ ARCHITECTURE

```text
       +-------------------------------------------------------+
       |                  Web3 Next.js Frontend                |
       |  (Zustand State, Wallet Connection, Template Forms)   |
       +----------------------------+--------------------------+
                                    |
                 Reads Views &      |  MetaMask Transactions
                 Stats (JSON)       |  (Staking, Claims, Verify)
                                    v
       +-------------------------------------------------------+
       |               GenLayer Intelligent Nodes              |
       |                    (GenVM v0.2.16)                    |
       |  +-------------------------------------------------+  |
       |  |                 Contract State                  |  |
       |  |  - TreeMap[pact_id, json_pact_data]             |  |
       |  |  - TreeMap[user, DynArray[pact_ids]]            |  |
       |  +------------------------+------------------------+  |
       |                           |                           |
       |                   Triggers AI verification            |
       |                   via gl.vm.run_nondet_unsafe         |
       |                           v                           |
       |  +-------------------------------------------------+  |
       |  |                AI Consensus Engine              |  |
       |  |                                                 |  |
       |  |  1. gl.nondet.web.render(verification_url)     |  |
       |  |     (Fetches public Web2 Strava/GitHub text)    |  |
       |  |                                                 |  |
       |  |  2. gl.nondet.exec_prompt(judgement_prompt)     |  |
       |  |     (AI Nodes judge if criteria is satisfied)   |  |
       |  |                                                 |  |
       |  |  3. validator_fn(leader_result)                 |  |
       |  |     (Validators reach consensus on verdict)     |  |
       |  +------------------------+------------------------+  |
       |                           |                           |
       |                   Executes GEN transfers              |
       |                           v                           |
       |  +-------------------------------------------------+  |
       |  |             Payout / Claims Routing             |  |
       |  |                                                 |  |
       |  |  - SUCCESS: 99% Refund to Creator               |  |
       |  |  - FAILURE: 100% Donation to Charity EOA        |  |
       |  +-------------------------------------------------+  |
       +-------------------------------------------------------+
```

---

## ⚙️ SMART CONTRACT SCHEMA & METHODS

### Data Model (JSON-Serialized Pact)
```json
{
  "id": 1,
  "owner": "0x2c6b3252495b45f490f2305a415a77cf59755490",
  "title": "Commit code every day",
  "description": "Keep GitHub green and push at least one public commit per day to GitHub profile.",
  "category": "coding",
  "verification_url": "https://github.com/torvalds",
  "success_criteria": "At least 1 public commit per day for 30 days",
  "start_timestamp": 1782259200,
  "deadline_timestamp": 1784851200,
  "stake_amount": "10000000000000000000",
  "beneficiary_on_success": "0x2c6b3252495b45f490f2305a415a77cf59755490",
  "beneficiary_on_failure": "0x81C7656EC7ab88b098defB751B7401B5f6d8976F",
  "status": "active",
  "ai_verdict": "",
  "ai_reasoning": "",
  "ai_confidence": 0,
  "verified_at": 0,
  "created_at": 1782259200,
  "reverification_allowed": true,
  "inconclusive_timestamp": 0
}
```

### Public Methods
1. **`create_pact(title, description, category, verification_url, success_criteria, duration_days, beneficiary_on_failure) -> u256`**
   - User stakes native GEN tokens (payable).
   - Validates active limit (max 10 active pacts per user).
   - Stores serialized pact details on-chain.
2. **`verify_pact(pact_id) -> str`**
   - Triggerable by anyone after the deadline.
   - Executes web fetching and AI consensus judgment.
   - Automatically handles inconclusive results (grants a one-time 24h grace extension).
3. **`claim(pact_id)`**
   - If success: sends 99% of stake to owner, 1% fee to platform owner.
   - If failure: sends 100% of stake directly to charity/anti-charity.
4. **`get_pact(pact_id) -> str`**
   - Returns serialized pact details.
5. **`get_stats(user) -> str`**
   - Aggregates success rates, aggregate staked, won, and lost metrics.

---

## 🚀 GETTING STARTED

### Prerequisites
- Node.js >= 18.0.0
- npm / pnpm
- MetaMask Extension

### 1. Smart Contract Deployment
To test and deploy the Intelligent Contract:
1. Open [GenLayer Studio](https://studio.genlayer.com/run-debug).
2. Go to **Settings -> Reset Storage -> Confirm**, then hard-refresh the page.
3. Deploy the sanity check first: `contracts/storage_test.py`. Ensure the result is `SUCCESS`.
4. Deploy the main contract: `contracts/pact.py`. Verify deployment.
5. Copy the deployed contract address.

### 2. Frontend Installation & Setup
1. Move to the frontend directory:
   ```bash
   cd frontend
   ```
2. Configure your contract address inside `.env.local`:
   ```bash
   NEXT_PUBLIC_CONTRACT_ADDRESS="YOUR_COPIED_CONTRACT_ADDRESS"
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 CORE TEST SCENARIOS

1. **Happy Path (Coding Streak):**
   - Create a code streak pact with 5 GEN staked. Use `https://github.com/torvalds` as the URL.
   - When verified, the AI Validator scans Torvalds' profile, sees active commits, and returns `SUCCESS`.
   - The user claims the refund and gets `4.95 GEN` (minus 1% platform fee).
2. **Failure Path (Strava Fitness):**
   - Create a fitness pact with 10 GEN staked. Use an inactive/empty URL.
   - The AI Validator parses the profile, finds zero activities, and returns `FAILURE`.
   - Anyone can execute the donation, sending the `10 GEN` directly to the anti-charity.
3. **Inconclusive Grace Period Extension:**
   - Create a pact using a broken/nonexistent URL.
   - The AI Validator returns `INCONCLUSIVE`.
   - The contract automatically extends the deadline by 24 hours to let you update your URL.
   - The second check is final; if it is still inconclusive, it defaults to `FAILURE`.

---

## 🗺️ ROADMAP

- **Multi-Chain Staking:** Support staking from Ethereum/zkSync via cross-chain messaging bridges.
- **Dynamic AI Prompting:** Allow users to choose different AI model profiles (e.g. "Strict Judge", "Supportive Coach") for custom accountability.
- **Social Proof Shares:** Dynamic viral image generation on achievement so users can share successes on Twitter/warpcast directly from detail receipts!
