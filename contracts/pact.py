# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class Contract(gl.Contract):
    # Persistent storage collections (⚠️ DO NOT initialize in __init__ per Rule 2)
    pacts: TreeMap[u256, str]                    # pact_id -> JSON-serialized Pact details
    user_pacts: TreeMap[Address, DynArray[u256]] # user -> array of pact IDs
    user_success_count: TreeMap[Address, u256]   # user -> lifetime successful pact count
    user_failure_count: TreeMap[Address, u256]   # user -> lifetime failed pact count

    # Persistent scalars (initialize in __init__)
    total_pacts: u256
    total_staked_volume: u256
    total_donated_volume: u256
    owner: Address
    platform_fee_bps: u256                        # e.g., 100 = 1% (retained on success)

    def __init__(self):
        # Initialize persistent scalars (Rule 2: Do NOT touch TreeMap/DynArray fields here)
        self.total_pacts = u256(0)
        self.total_staked_volume = u256(0)
        self.total_donated_volume = u256(0)
        self.owner = gl.message.sender_address    # Rule 8: Use sender_address, NOT sender
        self.platform_fee_bps = u256(100)         # 100 bps = 1% platform fee

    # Helper methods for JSON serialization/deserialization
    def _serialize_pact(self, pact: dict) -> str:
        import json
        return json.dumps(pact)

    def _deserialize_pact(self, pact_str: str) -> dict:
        import json
        return json.loads(pact_str)

    @gl.public.write.payable
    def create_pact(
        self,
        title: str,
        description: str,
        category: str,
        verification_url: str,
        success_criteria: str,
        duration_days: u256,
        beneficiary_on_failure: Address,
    ) -> u256:
        """
        Public payable method allowing users to stake GEN and create a personal commitment pact.
        Enforces a maximum limit of 10 active pacts per user to prevent spam.
        """
        # Rule 3 & 4: Only allowed signature types (no float/dict/list generic types)
        assert gl.message.value > 0, "Stake amount must be greater than zero"
        assert duration_days > 0, "Duration must be at least 1 day"
        assert len(title) > 0, "Title cannot be empty"
        assert len(verification_url) > 0, "Verification URL cannot be empty"
        assert len(success_criteria) > 0, "Success criteria cannot be empty"

        owner = gl.message.sender_address

        # Anti-spam: max 10 active pacts per user
        active_count = 0
        if owner in self.user_pacts:
            import json
            user_pact_ids = self.user_pacts[owner]
            for i in range(len(user_pact_ids)):
                p_id = user_pact_ids[i]
                p_json = self.pacts.get(p_id, "")
                if p_json != "":
                    p_data = json.loads(p_json)
                    if p_data.get("status") == "active":
                        active_count += 1

        assert active_count < 10, "User has reached the limit of 10 active pacts"

        # Create new pact ID
        self.total_pacts = u256(int(self.total_pacts) + 1)
        new_pact_id = self.total_pacts

        start = gl.block.timestamp
        deadline = start + duration_days * 86400

        pact_dict = {
            "id": int(new_pact_id),
            "owner": str(owner),
            "title": title,
            "description": description,
            "category": category,
            "verification_url": verification_url,
            "success_criteria": success_criteria,
            "start_timestamp": int(start),
            "deadline_timestamp": int(deadline),
            "stake_amount": str(gl.message.value),
            "beneficiary_on_success": str(owner),
            "beneficiary_on_failure": str(beneficiary_on_failure),
            "status": "active",
            "ai_verdict": "",
            "ai_reasoning": "",
            "ai_confidence": 0,
            "verified_at": 0,
            "created_at": int(start),
            "reverification_allowed": True,
            "inconclusive_timestamp": 0
        }

        # Store serialized JSON to bypass sizing limits on dataclasses
        self.pacts[new_pact_id] = self._serialize_pact(pact_dict)

        # Append pact ID to user's pact registry
        if owner not in self.user_pacts:
            self.user_pacts[owner] = DynArray[u256]()
        self.user_pacts[owner].append(new_pact_id)

        # Add to absolute staked stats
        self.total_staked_volume = u256(int(self.total_staked_volume) + int(gl.message.value))

        return new_pact_id

    @gl.public.write
    def verify_pact(self, pact_id: u256) -> str:
        """
        Public write method triggered after deadline to execute AI verification of goal criteria.
        Uses run_nondet_unsafe per Rule 7 to reach network consensus on external web fetching and AI verdict.
        """
        pact_json = self.pacts.get(pact_id, "")
        assert pact_json != "", "Pact does not exist"

        pact_data = self._deserialize_pact(pact_json)
        assert pact_data["status"] in ["active", "verifying"], "Pact is not in a verifiable state"

        current_time = int(gl.block.timestamp)
        deadline = pact_data["deadline_timestamp"]
        assert current_time >= deadline, "Deadline has not passed yet"

        url = pact_data["verification_url"]
        title = pact_data["title"]
        success_criteria = pact_data["success_criteria"]
        start_ts = pact_data["start_timestamp"]
        deadline_ts = pact_data["deadline_timestamp"]

        # Wrapped in run_nondet_unsafe per Rule 7 (All non-deterministic calls like gl.nondet.* must be inside leader_fn)
        def leader_fn():
            # Step 1: Render the public profile to text
            web_data = gl.nondet.web.render(url, mode="text")

            # Step 2: Request AI verdict evaluation
            prompt = f"""You are an impartial judge for a personal commitment smart contract.

            GOAL: {title}
            SUCCESS CRITERIA: {success_criteria}
            TIMEFRAME: {start_ts} to {deadline_ts} (POSIX timestamps)

            EVIDENCE FROM USER'S PUBLIC PROFILE:
            {web_data}

            Did the user meet the success criteria within the timeframe?
            Be strict but fair. If the evidence is unclear or missing, return INCONCLUSIVE.

            Return JSON: {{
              "verdict": "SUCCESS" | "FAILURE" | "INCONCLUSIVE",
              "reasoning": "max 200 words explanation",
              "confidence": 0-100,
              "evidence_summary": "key data points found"
            }}"""

            verdict = gl.nondet.exec_prompt(prompt, response_format="json")
            return verdict

        def validator_fn(leader_result) -> bool:
            return isinstance(leader_result, gl.vm.Return)

        # Run non-deterministic consensus pipeline
        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        # Parse final consensus verdict
        import json
        verdict_data = json.loads(result)
        verdict_str = verdict_data.get("verdict", "INCONCLUSIVE")
        reasoning = verdict_data.get("reasoning", "")
        confidence = int(verdict_data.get("confidence", 0))

        owner_addr = Address(pact_data["owner"])

        if verdict_str == "SUCCESS":
            pact_data["status"] = "succeeded"
            pact_data["ai_verdict"] = "SUCCESS"
            pact_data["ai_reasoning"] = reasoning
            pact_data["ai_confidence"] = confidence
            pact_data["verified_at"] = current_time

            # Record lifetime success
            success_count = int(self.user_success_count.get(owner_addr, u256(0)))
            self.user_success_count[owner_addr] = u256(success_count + 1)

        elif verdict_str == "FAILURE":
            pact_data["status"] = "failed"
            pact_data["ai_verdict"] = "FAILURE"
            pact_data["ai_reasoning"] = reasoning
            pact_data["ai_confidence"] = confidence
            pact_data["verified_at"] = current_time

            # Record lifetime failure
            failure_count = int(self.user_failure_count.get(owner_addr, u256(0)))
            self.user_failure_count[owner_addr] = u256(failure_count + 1)

        else:  # INCONCLUSIVE
            if pact_data.get("reverification_allowed", True):
                # Move to active state again, disable future grace periods
                pact_data["status"] = "active"
                pact_data["reverification_allowed"] = False
                pact_data["inconclusive_timestamp"] = current_time
                # Extend deadline by 24h grace period
                pact_data["deadline_timestamp"] = current_time + 86400

                pact_data["ai_verdict"] = "INCONCLUSIVE"
                pact_data["ai_reasoning"] = "Verification was inconclusive. Extending deadline by 24 hours for final retry."
                pact_data["ai_confidence"] = confidence
                pact_data["verified_at"] = current_time
            else:
                # If already had one grace period, default to failure
                pact_data["status"] = "failed"
                pact_data["ai_verdict"] = "FAILURE"
                pact_data["ai_reasoning"] = "Re-verification remained inconclusive. Defaulted to FAILURE. " + reasoning
                pact_data["ai_confidence"] = confidence
                pact_data["verified_at"] = current_time

                # Record lifetime failure
                failure_count = int(self.user_failure_count.get(owner_addr, u256(0)))
                self.user_failure_count[owner_addr] = u256(failure_count + 1)

        # Save pact modifications
        self.pacts[pact_id] = self._serialize_pact(pact_data)

        return result

    @gl.public.write
    def claim(self, pact_id: u256) -> None:
        """
        Triggered to distribute stakes.
        Succeeded pacts refund the owner (minus platform fee sent to contract owner).
        Failed pacts donate 100% of stakes directly to the charity/anti-charity address.
        """
        pact_json = self.pacts.get(pact_id, "")
        assert pact_json != "", "Pact does not exist"

        pact_data = self._deserialize_pact(pact_json)
        status = pact_data["status"]
        assert status in ["succeeded", "failed"], "Pact is not in a claimable state"

        stake = u256(int(pact_data["stake_amount"]))

        if status == "succeeded":
            assert gl.message.sender_address == Address(pact_data["owner"]), "Only pact owner can claim refund"

            # Calculate 1% platform fee (retained only on success)
            fee = u256((int(stake) * int(self.platform_fee_bps)) // 10000)
            refund = u256(int(stake) - int(fee))

            # Refund owner
            success_recipient = Address(pact_data["beneficiary_on_success"])
            gl.get_contract_at(success_recipient).emit_transfer(value=refund, on='finalized')

            # Transfer platform fees to developer
            if int(fee) > 0:
                gl.get_contract_at(self.owner).emit_transfer(value=fee, on='finalized')

        else:  # status == "failed"
            # Anyone can trigger the charity/anti-charity payout
            failure_recipient = Address(pact_data["beneficiary_on_failure"])
            gl.get_contract_at(failure_recipient).emit_transfer(value=stake, on='finalized')

            # Update absolute platform donation stats
            self.total_donated_volume = u256(int(self.total_donated_volume) + int(stake))

        # Lock pact state to claimed
        pact_data["status"] = "claimed"
        self.pacts[pact_id] = self._serialize_pact(pact_data)

    @gl.public.view
    def get_pact(self, pact_id: u256) -> str:
        """
        Returns JSON-serialized details of the pact.
        """
        return self.pacts.get(pact_id, "")

    @gl.public.view
    def get_user_pacts(self, user: Address) -> DynArray[u256]:
        """
        Returns list of all pact IDs created by a user.
        """
        if user not in self.user_pacts:
            return DynArray[u256]()
        return self.user_pacts[user]

    @gl.public.view
    def get_active_pacts(self) -> DynArray[str]:
        """
        Returns all currently active pacts (JSON formatted strings) to feed global dashboard lists.
        """
        active_pacts = DynArray[str]()
        for i in range(1, int(self.total_pacts) + 1):
            pact_id = u256(i)
            pact_json = self.pacts.get(pact_id, "")
            if pact_json != "":
                import json
                pact_data = json.loads(pact_json)
                if pact_data.get("status") == "active":
                    active_pacts.append(pact_json)
        return active_pacts

    @gl.public.view
    def get_stats(self, user: Address) -> str:
        """
        Aggregates and returns success rate, streak indicators, and volume stats for reputation building.
        """
        import json

        successes = int(self.user_success_count.get(user, u256(0)))
        failures = int(self.user_failure_count.get(user, u256(0)))

        total_staked = 0
        total_won = 0
        total_lost = 0

        if user in self.user_pacts:
            pact_ids = self.user_pacts[user]
            for i in range(len(pact_ids)):
                p_id = pact_ids[i]
                p_json = self.pacts.get(p_id, "")
                if p_json != "":
                    p_data = json.loads(p_json)
                    pact_stake = int(p_data.get("stake_amount", 0))
                    total_staked += pact_stake
                    st = p_data.get("status")

                    if st == "succeeded" or (st == "claimed" and p_data.get("ai_verdict") == "SUCCESS"):
                        total_won += pact_stake
                    elif st == "failed" or (st == "claimed" and p_data.get("ai_verdict") == "FAILURE"):
                        total_lost += pact_stake

        total_pacts = successes + failures
        success_rate = (successes * 100) // total_pacts if total_pacts > 0 else 0

        stats_dict = {
            "success_count": successes,
            "failure_count": failures,
            "success_rate": success_rate,
            "total_staked": str(total_staked),
            "total_won": str(total_won),
            "total_lost": str(total_lost)
        }

        return json.dumps(stats_dict)
