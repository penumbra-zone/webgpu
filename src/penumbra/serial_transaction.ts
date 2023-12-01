// import { loadWasmModule } from "./wasm-loader";
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IndexedDb } from './database';
import { base64ToUint8Array } from './utils'
import { authorization } from "./authorize";
import { witness_and_build } from './build'
import { transaction_plan } from "./tx-plan";
import { fetchBinaryFile } from "./utils"
import { load_proving_key } from '@penumbra-zone-test/wasm-bundler';

export const penumbra_wasm = async (): Promise<any> => {    
    // Initialize database
    const indexedDb = await IndexedDb.initialize({
      chainId: 'penumbra-testnet-iapetus',
      dbVersion: 15,
      walletId: 'wallet_12345',
    })

    // Read proving keys from disk
    const delegatorKey = await fetchBinaryFile('delegator_vote_pk.bin');
    const nullifierKey = await fetchBinaryFile('nullifier_derivation_pk.bin');
    const outputKey = await fetchBinaryFile('output_pk.bin');
    const spendKey = await fetchBinaryFile('spend_pk.bin');
    const swapKey = await fetchBinaryFile('swap_pk.bin');
    const swapClaimKey = await fetchBinaryFile('swapclaim_pk.bin');
    const undelegateClaimKey = await fetchBinaryFile('undelegateclaim_pk.bin');

    // Load keys into WASM binary
    load_proving_key(spendKey, "spend");
    load_proving_key(outputKey, "output");
    load_proving_key(delegatorKey, "delegator_vote");
    load_proving_key(nullifierKey, "nullifier_derivation");
    load_proving_key(swapKey, "swap");
    load_proving_key(swapClaimKey, "swap_claim");
    load_proving_key(undelegateClaimKey, "undelegate_claim");

    // Query for a transaction plan
    const req = new TransactionPlannerRequest({
      outputs: [
        {
          address: { altBech32m: "penumbra1dugkjttfezh4gfkqs77377gnjlvmkkehusx6953udxeescc0qpgk6gqc0jmrsjq8xphzrg938843p0e63z09vt8lzzmef0q330e5njuwh4290n8pemcmx70sasym0lcjkstgzc" },
          value: {
            amount: { lo: 1n, hi: 0n },
            assetId: { inner: base64ToUint8Array("nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=") },
          },
        },
      ],
    });

    // Start timer
    const startTime = performance.now(); // Record start time

    // Transaction plan
    const transactionPlan = await transaction_plan(indexedDb, req)
    console.log("Transaction plan is: ", transactionPlan)

    // Authorize
    const auth = await authorization(transactionPlan)
    console.log("Authorization is: ", auth)

    // Witness and Build
    const build = await witness_and_build(indexedDb, auth, transactionPlan)
    console.log("TX is: ", build)
    
    const endTime = performance.now();
    const executionTime = endTime - startTime; 
    console.log(`Serial transaction execution time: ${executionTime} milliseconds`);

    return executionTime
};