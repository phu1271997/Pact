# 🩺 GenLayer RPC Health Diagnostic Guide

This guide details steps and diagnostic commands to verify that the GenLayer RPC Node is operational, check network height, retrieve transaction traces, and identify server outages.

---

## 🌐 STATUS RESILIENT LINKS
- **GenLayer Developer Discord:** `#devnet-status` / `#testnet-status` for live server announcements.
- **Developer Documentation:** `https://docs.genlayer.com`
- **Underlying Explorer:** `https://explorer.genlayer.com`

---

## ⚡ DIAGNOSTIC SHELL COMMANDS

### 1. Check RPC Server Liveness
Query the GenLayer Node directly using curl to confirm it answers JSON-RPC queries.
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://testnet.genlayer.com
```
*Expected Response:* A valid JSON returning the current block number in hex:
```json
{"jsonrpc":"2.0","result":"0x18a3d","id":1}
```

### 2. Verify Contract Balance (Ghost Contract)
Query the underlying balance in Wei of your deployed Intelligent Contract:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xYourContractAddress", "latest"],"id":1}' \
  https://testnet.genlayer.com
```

### 3. Check Transaction Receipt
If a MetaMask transaction appears to stall, retrieve its on-chain receipt and status traceback:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0xYourTransactionHash"],"id":1}' \
  https://testnet.genlayer.com
```

---

## 🛡️ ERROR RESOLUTION DECREE

### RPC Error `-32603` / "service temporarily unavailable"
- **Cause:** GenLayer testnet validator node cluster is undergoing a network reset, memory leak recovery, or code upgrade.
- **Action:**
  1. Do **NOT** modify or redeploy your contract code.
  2. Open the GenLayer Discord status channel to verify the outage.
  3. Wait 15-30 minutes for the nodes to restart, reset your Studio storage, and redeploy.
