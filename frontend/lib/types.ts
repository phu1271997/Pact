export interface Pact {
  id: number;
  owner: string;
  title: string;
  description: string;
  category: string;
  verification_url: string;
  success_criteria: string;
  start_timestamp: number;
  deadline_timestamp: number;
  stake_amount: string; // in wei
  beneficiary_on_success: string;
  beneficiary_on_failure: string;
  status: "active" | "verifying" | "succeeded" | "failed" | "claimed";
  ai_verdict: "SUCCESS" | "FAILURE" | "INCONCLUSIVE" | "";
  ai_reasoning: string;
  ai_confidence: number;
  verified_at: number;
  created_at: number;
  reverification_allowed: boolean;
  inconclusive_timestamp: number;
}

export interface UserStats {
  success_count: number;
  failure_count: number;
  success_rate: number;
  total_staked: string; // in wei
  total_won: string; // in wei
  total_lost: string; // in wei
}

export interface Charity {
  id: string;
  name: string;
  logo: string;
  address: string;
  description: string;
  type: "charity" | "anticharity";
}
