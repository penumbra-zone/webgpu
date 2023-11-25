import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IndexedDb } from './database';
import { base64ToUint8Array } from './utils'
import { authorization } from "./authorize";
import { transaction_plan } from "./tx-plan";
import { webWorkers } from "./workers/worker";
import { witness, build_parallel } from '@penumbra-zone-test/wasm-bundler';

export const penumbra_wasm_parallel = async (): Promise<any> => {    
    // Initialize database
    const indexedDb = await IndexedDb.initialize({
      chainId: 'penumbra-testnet-iapetus',
      dbVersion: 15,
      walletId: 'wallet_12345',
    })

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

    // Transaction plan
    const transactionPlan = await transaction_plan(indexedDb, req)
    console.log("Transaction plan is: ", transactionPlan)

    // Authorize
    const authorizationData = await authorization(transactionPlan)
    console.log("Authorization is: ", authorizationData)

    // Retrieve SCT 
    const sct = await indexedDb.getStateCommitmentTree()

    // Generate witness data from SCT and specific transaction plan
    const witnessData = witness(transactionPlan.plan?.toJson(), sct)
    console.log("Witness is: ", witnessData)

    // Viewing key to reveal asset balances and transactions
    const fullViewingKey = "penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2"

    // Check if related fields are non-null
    const action_plan = transactionPlan.plan?.actions;

    // Start timer
    const startTime = performance.now(); // Record start time

    // Execute round of concurrent webworkers to build actions
    const workerPromises = [];
    if (action_plan && transactionPlan.plan) {
        for (let i = 0; i < action_plan.length; i++) {
            const workerPromise = webWorkers(
              transactionPlan.plan,
              action_plan[i],
              fullViewingKey,
              witnessData,
            );

            workerPromises.push(workerPromise)
        }
    }

    // Use Promise.all to spawn all web workers at the same time
    const batchActions = await Promise.all(workerPromises);

    // Execute parallel build method
    const tx = build_parallel(
        batchActions, 
        transactionPlan.plan?.toJson(), 
        witnessData, 
        authorizationData
    )
    
    console.log("TX is: ", tx)

    // End timer
    const endTime = performance.now()
    const executionTime = endTime - startTime;
    console.log(`Parallel transaction execution time: ${executionTime} milliseconds`);
};