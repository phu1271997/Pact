# 🚀 GenLayer Smart Contract Deployment Guide

This guide describes how to configure, deploy, and verify the Pact Intelligent Contracts using the [GenLayer Studio](https://studio.genlayer.com/run-debug).

---

## ⚙️ BATTLE-TESTED DEPLOYMENT LAWS (READ FIRST)

To avoid deployment failures, ensure your contract code strict satisfies these 10 laws:
1. **Law 1:** First two lines must be exactly the version and depends block comment.
2. **Law 2:** **NEVER** reassign `TreeMap` or `DynArray` in `__init__`. GenVM initializes them automatically.
3. **Law 3:** **NO float** in public signatures or storage fields. Sized ints (like `u256` in wei) are required.
4. **Law 4:** Only allowed public signature types are: `str`, `bool`, `bytes`, sized ints (`u8` to `u256`), `Address`, `DynArray[T]`, `TreeMap[K, V]`.
5. **Law 5:** All storage collections must be `TreeMap` or `DynArray`. Never use standard `dict` or `list` in storage fields.
6. **Law 6:** The primary contract class **MUST** be named exactly `Contract` extending `gl.Contract`.
7. **Law 7:** **ALL** non-deterministic operations (`gl.nondet.*` like web rendering or prompt execution) must be wrapped inside `gl.vm.run_nondet_unsafe`.
8. **Law 8:** Use `gl.message.sender_address` instead of `gl.message.sender` to retrieve the correct typed EOA Address.
9. **Law 9:** Constructor (`__init__`) must **NOT** have any decorators (no `@gl.public.write`).
10. **Law 10:** For methods receiving native value transfers, use the `@gl.public.write.payable` decorator.

---

## 🛠️ STEP-BY-STEP DEPLOYMENT FLOW

### Step 1: Prepare the Studio environment
1. Open your browser and navigate to `https://studio.genlayer.com/run-debug`.
2. Go to **Settings -> Reset Storage -> Confirm**.
3. Force-refresh the browser (`Cmd+Shift+R` or `Ctrl+Shift+F5`) to flush the RPC caching database.

### Step 2: Deploy `storage_test.py` (Sanity Check)
1. Copy the contents of `contracts/storage_test.py` into the editor.
2. Click **Deploy**.
3. Once the transaction is finalized, click the transaction in the sidebar.
4. Verify the result is `Result: SUCCESS` (not `Result: ERROR`).
5. Run the `write_test` method and then `read_test` view to confirm persistent reads and writes are functioning properly.

> [!NOTE]
> If `storage_test.py` fails with **"service temporarily unavailable"** or RPC error code `-32603`, this represents temporary testnet infrastructure outages. Do NOT modify the code; simply wait 15-30 minutes and try again.

### Step 3: Deploy `pact.py` (Main Contract)
1. Copy the contents of `contracts/pact.py` into the editor.
2. Click **Deploy**.
3. Verify the transaction results in the sidebar and ensure `Result: SUCCESS`.
4. Copy the newly generated contract Address.
5. Paste the address into your frontend project's `.env.local` file:
   ```bash
   NEXT_PUBLIC_CONTRACT_ADDRESS="0xYourCopiedContractAddress"
   ```

---

## 🩺 COMMON ERROR DIAGNOSTICS

| Symptom / Console Exception | Core Cause | Resolution |
| :--- | :--- | :--- |
| `Contract Queues not found` | Studio fell back to v0.1.0 compiler due to missing version comment. | Ensure line 1 of the file is exactly `# v0.2.16`. |
| `AssertionError: TreeMap <- TreeMap` | Reassigned `TreeMap` or `DynArray` storage fields inside `__init__`. | Remove `self.pacts = TreeMap()` or similar assignments from the constructor. |
| Schema Error | Invalid typing signature (e.g. `dict`, `list`, or `float` in signatures). | Replace standard python generics with `TreeMap`, `DynArray`, and `u256` equivalents. |
| Transaction finalizes but fails silently | Accessed `gl.message.sender` instead of `gl.message.sender_address`. | Update constructor and callers to use `gl.message.sender_address`. |
