import { create } from "zustand";
import { Pact, UserStats } from "./types";
import { TEMPLATES } from "./pact-templates";

// Consts
export const GENLAYER_CHAIN_ID = 61999;
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x4f36402778841B5a4c6D34B3654E708EAdA82Cb9";

// Custom Mock Data for Preview Mode
const MOCK_PACTS: Pact[] = [
  {
    id: 1,
    owner: "0x2c6b3252495b45f490f2305a415a77cf59755490",
    title: "Commit code every day",
    description: "Keep GitHub green and push at least one public commit per day to GitHub profile.",
    category: "coding",
    verification_url: "https://github.com/torvalds",
    success_criteria: "At least 1 public commit per day for 30 days",
    start_timestamp: Math.floor(Date.now() / 1000) - 25 * 86400,
    deadline_timestamp: Math.floor(Date.now() / 1000) - 1 * 86400, // passed
    stake_amount: "50000000000000000000", // 50 GEN
    beneficiary_on_success: "0x2c6b3252495b45f490f2305a415a77cf59755490",
    beneficiary_on_failure: "0x9a71f00000000000000000000000000000000001", // Charity
    status: "succeeded",
    ai_verdict: "SUCCESS",
    ai_reasoning: "Impartial AI Validator scanned the target GitHub repository and verified 38 active public commits between the contract start and deadline timestamps. The user successfully completed the streak.",
    ai_confidence: 98,
    verified_at: Math.floor(Date.now() / 1000) - 1 * 86400,
    created_at: Math.floor(Date.now() / 1000) - 25 * 86400,
    reverification_allowed: false,
    inconclusive_timestamp: 0
  },
  {
    id: 2,
    owner: "0x4fb83a1523f46f490f2305a415a77cf5975583b2",
    title: "Run 100km this month",
    description: "Log runs on Strava profile to reach a total volume of 100km.",
    category: "fitness",
    verification_url: "https://www.strava.com/athletes/12345",
    success_criteria: "Total running distance >= 100km in the given timeframe",
    start_timestamp: Math.floor(Date.now() / 1000) - 15 * 86400,
    deadline_timestamp: Math.floor(Date.now() / 1000) + 15 * 86400, // active
    stake_amount: "100000000000000000000", // 100 GEN
    beneficiary_on_success: "0x4fb83a1523f46f490f2305a415a77cf5975583b2",
    beneficiary_on_failure: "0x9a71f00000000000000000000000000000000002", // Anti-Charity
    status: "active",
    ai_verdict: "",
    ai_reasoning: "",
    ai_confidence: 0,
    verified_at: 0,
    created_at: Math.floor(Date.now() / 1000) - 15 * 86400,
    reverification_allowed: true,
    inconclusive_timestamp: 0
  },
  {
    id: 3,
    owner: "0x9a1fb3b778841B5a4c6D34B3654E708EAdA821f9",
    title: "Publish 30 blog posts",
    category: "writing",
    description: "Write consistently about technology and artificial intelligence on Medium.",
    verification_url: "https://medium.com/@nonexistent_blogger",
    success_criteria: "Publish minimum 30 blog posts in 30 days",
    start_timestamp: Math.floor(Date.now() / 1000) - 31 * 86400,
    deadline_timestamp: Math.floor(Date.now() / 1000) - 1 * 86400, // passed
    stake_amount: "75000000000000000000", // 75 GEN
    beneficiary_on_success: "0x9a1fb3b778841B5a4c6D34B3654E708EAdA821f9",
    beneficiary_on_failure: "0x9a71f00000000000000000000000000000000003", // Rival Sports Team
    status: "failed",
    ai_verdict: "FAILURE",
    ai_reasoning: "AI Validator scanned the Medium feed for user '@nonexistent_blogger'. Only 4 published articles were found during the commitment timeframe, falling far short of the required 30 posts.",
    ai_confidence: 100,
    verified_at: Math.floor(Date.now() / 1000) - 12 * 3600,
    created_at: Math.floor(Date.now() / 1000) - 31 * 86400,
    reverification_allowed: false,
    inconclusive_timestamp: 0
  }
];

interface GenLayerState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isMockMode: boolean;
  pacts: Pact[];
  stats: UserStats;
  loading: boolean;
  error: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  toggleMockMode: (enable: boolean) => void;
  createPact: (
    title: string,
    description: string,
    category: string,
    verificationUrl: string,
    successCriteria: string,
    durationDays: number,
    beneficiaryOnFailure: string,
    stakeAmountEth: string
  ) => Promise<number>;
  verifyPact: (pactId: number) => Promise<string>;
  claimPact: (pactId: number) => Promise<void>;
  fetchPacts: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
}

export const useGenLayer = create<GenLayerState>((set, get) => ({
  isConnected: false,
  address: null,
  balance: null,
  isMockMode: true, // Default to mock mode for beautiful demonstration and out-of-box experience
  pacts: MOCK_PACTS,
  stats: {
    success_count: 5,
    failure_count: 1,
    success_rate: 83,
    total_staked: "225000000000000000000", // 225 GEN
    total_won: "150000000000000000000", // 150 GEN
    total_lost: "75000000000000000000" // 75 GEN
  },
  loading: false,
  error: null,

  toggleMockMode: (enable) => {
    if (enable) {
      set({
        isMockMode: true,
        isConnected: false,
        address: null,
        balance: null,
        pacts: MOCK_PACTS,
        stats: {
          success_count: 5,
          failure_count: 1,
          success_rate: 83,
          total_staked: "225000000000000000000",
          total_won: "150000000000000000000",
          total_lost: "75000000000000000000"
        }
      });
    } else {
      set({ isMockMode: false });
    }
  },

  connectWallet: async () => {
    set({ loading: true, error: null });
    
    // Check if ethereum is injected
    if (typeof window === "undefined" || !window.ethereum) {
      set({
        loading: false,
        error: "MetaMask not found. Running in Preview Mode.",
        isMockMode: true
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      
      const currentAddress = accounts[0];

      // Switch to GenLayer Testnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${GENLAYER_CHAIN_ID.toString(16)}` }]
        });
      } catch (switchError: any) {
        // Chain not added, try adding it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${GENLAYER_CHAIN_ID.toString(16)}`,
                  chainName: "GenLayer Testnet",
                  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
                  rpcUrls: ["https://testnet.genlayer.com"],
                  blockExplorerUrls: ["https://explorer.genlayer.com"]
                }
              ]
            });
          } catch (addError) {
            throw new Error("Failed to add GenLayer Testnet network to MetaMask.");
          }
        } else {
          throw switchError;
        }
      }

      // Fetch balance in hex
      const balanceHex = await window.ethereum.request({
        method: "eth_getBalance",
        params: [currentAddress, "latest"]
      });

      // Parse balance (wei to GEN)
      const balanceBigInt = BigInt(balanceHex);
      const balanceEth = (Number(balanceBigInt) / 1e18).toFixed(4);

      set({
        isConnected: true,
        isMockMode: false,
        address: currentAddress,
        balance: balanceEth,
        loading: false
      });

      // Fetch contract data for real connection
      await get().fetchPacts();
      await get().fetchUserStats();

    } catch (err: any) {
      console.error(err);
      set({
        loading: false,
        error: err.message || "Failed to connect to MetaMask.",
        isMockMode: true // fallback
      });
    }
  },

  disconnectWallet: () => {
    set({
      isConnected: false,
      address: null,
      balance: null,
      isMockMode: true,
      pacts: MOCK_PACTS
    });
  },

  createPact: async (
    title,
    description,
    category,
    verificationUrl,
    successCriteria,
    durationDays,
    beneficiaryOnFailure,
    stakeAmountEth
  ) => {
    const { isMockMode, pacts, address } = get();
    
    // Parse stake amount in Wei
    const stakeWei = (Number(stakeAmountEth) * 1e18).toString();

    if (isMockMode) {
      const newId = pacts.length + 1;
      const start = Math.floor(Date.now() / 1000);
      const deadline = start + durationDays * 86400;

      const newPact: Pact = {
        id: newId,
        owner: address || "0x2c6b3252495b45f490f2305a415a77cf59755490",
        title,
        description,
        category,
        verification_url: verificationUrl,
        success_criteria: successCriteria,
        start_timestamp: start,
        deadline_timestamp: deadline,
        stake_amount: stakeWei,
        beneficiary_on_success: address || "0x2c6b3252495b45f490f2305a415a77cf59755490",
        beneficiary_on_failure: beneficiaryOnFailure,
        status: "active",
        ai_verdict: "",
        ai_reasoning: "",
        ai_confidence: 0,
        verified_at: 0,
        created_at: start,
        reverification_allowed: true,
        inconclusive_timestamp: 0
      };

      set({ pacts: [...pacts, newPact] });
      return newId;
    }

    // Real GenLayer Write
    if (!window.ethereum) throw new Error("MetaMask is required.");
    
    // Dynamically import genlayer-js to avoid server-side errors
    const { createClient } = await import("genlayer-js");
    const { studionet } = await import("genlayer-js/chains");

    const client = createClient({
      chain: studionet,
      account: address as `0x${string}`
    });

    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "create_pact",
      args: [
        title,
        description,
        category,
        verificationUrl,
        successCriteria,
        BigInt(durationDays),
        beneficiaryOnFailure
      ],
      value: BigInt(stakeWei)
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: "FINALIZED"
    });

    await get().fetchPacts();
    return Number(get().pacts.length); // approximate returning pact id
  },

  verifyPact: async (pactId) => {
    const { isMockMode, pacts, address } = get();

    if (isMockMode) {
      // Simulate network verification lag
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const updated = pacts.map((pact) => {
        if (pact.id === pactId) {
          // Check if URL is custom and contains failure hints
          const isFailure = pact.verification_url.toLowerCase().includes("fail") || pact.title.toLowerCase().includes("fail");
          const isInconclusive = pact.verification_url.toLowerCase().includes("inconclusive") || pact.verification_url.toLowerCase().includes("broken");

          if (isInconclusive && pact.reverification_allowed) {
            return {
              ...pact,
              status: "active" as const,
              reverification_allowed: false,
              inconclusive_timestamp: Math.floor(Date.now() / 1000),
              deadline_timestamp: Math.floor(Date.now() / 1000) + 86400, // extended
              ai_verdict: "INCONCLUSIVE" as const,
              ai_reasoning: "The provided Web2 public URL did not return clear readable elements. The AI Validator has granted a 24-hour grace period to fix the profile link before defaulting to FAILURE.",
              ai_confidence: 85,
              verified_at: Math.floor(Date.now() / 1000)
            };
          } else if (isInconclusive && !pact.reverification_allowed) {
            return {
              ...pact,
              status: "failed" as const,
              ai_verdict: "FAILURE" as const,
              ai_reasoning: "Second verification attempt remains inconclusive due to profile privacy. Submitting default FAILURE as specified in safety rules.",
              ai_confidence: 100,
              verified_at: Math.floor(Date.now() / 1000)
            };
          }

          if (isFailure) {
            return {
              ...pact,
              status: "failed" as const,
              ai_verdict: "FAILURE" as const,
              ai_reasoning: "AI Validator parsed the Strava activity log. Only 18.4km logged during the timeframe, falling short of the user's 100km commitment. Stake will be donated.",
              ai_confidence: 95,
              verified_at: Math.floor(Date.now() / 1000)
            };
          } else {
            return {
              ...pact,
              status: "succeeded" as const,
              ai_verdict: "SUCCESS" as const,
              ai_reasoning: "AI Validator parsed the public profile. Found that the user has successfully met all success criteria within the deadline timeframe.",
              ai_confidence: 96,
              verified_at: Math.floor(Date.now() / 1000)
            };
          }
        }
        return pact;
      });

      set({ pacts: updated });
      const verdict = updated.find((p) => p.id === pactId)?.ai_verdict || "SUCCESS";
      return JSON.stringify({ verdict, reasoning: "Mock reasoning complete." });
    }

    // Real GenLayer Write
    if (!window.ethereum) throw new Error("MetaMask is required.");
    const { createClient } = await import("genlayer-js");
    const { studionet } = await import("genlayer-js/chains");

    const client = createClient({
      chain: studionet,
      account: address as `0x${string}`
    });

    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "verify_pact",
      args: [BigInt(pactId)]
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: "FINALIZED"
    });

    await get().fetchPacts();
    const finalizedPact = get().pacts.find((p) => p.id === pactId);
    return JSON.stringify({
      verdict: finalizedPact?.ai_verdict,
      reasoning: finalizedPact?.ai_reasoning
    });
  },

  claimPact: async (pactId) => {
    const { isMockMode, pacts, address, stats } = get();

    if (isMockMode) {
      const targetPact = pacts.find((p) => p.id === pactId);
      if (!targetPact) return;

      const updated = pacts.map((pact) => {
        if (pact.id === pactId) {
          return { ...pact, status: "claimed" as const };
        }
        return pact;
      });

      // Update User Stats
      const stakeNum = Number(targetPact.stake_amount);
      const isSuccess = targetPact.ai_verdict === "SUCCESS";
      
      const newStats = {
        ...stats,
        success_count: stats.success_count + (isSuccess ? 1 : 0),
        failure_count: stats.failure_count + (isSuccess ? 0 : 1),
        total_staked: stats.total_staked,
        total_won: (BigInt(stats.total_won) + BigInt(isSuccess ? stakeNum * 0.99 : 0)).toString(),
        total_lost: (BigInt(stats.total_lost) + BigInt(isSuccess ? 0 : stakeNum)).toString()
      };
      
      const total = newStats.success_count + newStats.failure_count;
      newStats.success_rate = Math.round((newStats.success_count * 100) / total);

      set({ pacts: updated, stats: newStats });
      return;
    }

    // Real GenLayer Write
    if (!window.ethereum) throw new Error("MetaMask is required.");
    const { createClient } = await import("genlayer-js");
    const { studionet } = await import("genlayer-js/chains");

    const client = createClient({
      chain: studionet,
      account: address as `0x${string}`
    });

    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "claim",
      args: [BigInt(pactId)]
    });

    await client.waitForTransactionReceipt({
      hash: txHash,
      status: "FINALIZED"
    });

    await get().fetchPacts();
    await get().fetchUserStats();
  },

  fetchPacts: async () => {
    const { address, isMockMode } = get();
    if (isMockMode || !address) return;

    try {
      const { createClient } = await import("genlayer-js");
      const { studionet } = await import("genlayer-js/chains");

      const client = createClient({ chain: studionet });

      // Get user pact IDs
      const rawUserPacts = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "get_user_pacts",
        args: [address as `0x${string}`]
      }) as bigint[];

      // Resolve pact structures
      const resolvedPacts: Pact[] = [];
      for (const id of rawUserPacts) {
        const pactJson = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          functionName: "get_pact",
          args: [id]
        }) as string;

        if (pactJson) {
          resolvedPacts.push(JSON.parse(pactJson) as Pact);
        }
      }

      set({ pacts: resolvedPacts });
    } catch (e) {
      console.error("Failed to fetch user pacts from contract", e);
    }
  },

  fetchUserStats: async () => {
    const { address, isMockMode } = get();
    if (isMockMode || !address) return;

    try {
      const { createClient } = await import("genlayer-js");
      const { studionet } = await import("genlayer-js/chains");

      const client = createClient({ chain: studionet });

      const statsJson = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "get_stats",
        args: [address as `0x${string}`]
      }) as string;

      if (statsJson) {
        set({ stats: JSON.parse(statsJson) as UserStats });
      }
    } catch (e) {
      console.error("Failed to fetch user stats from contract", e);
    }
  }
}));

// Setup window listener for metamask chain changes
if (typeof window !== "undefined" && window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts: string[]) => {
    if (accounts.length === 0) {
      useGenLayer.getState().disconnectWallet();
    } else {
      useGenLayer.getState().connectWallet();
    }
  });

  window.ethereum.on("chainChanged", () => {
    useGenLayer.getState().connectWallet();
  });
}
