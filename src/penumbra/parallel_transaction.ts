import { loadWasmModule } from "./wasm-loader";
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IndexedDb } from './database';
import { base64ToUint8Array } from './utils'
import { authorization } from "./authorize";
import { transaction_plan } from "./tx-plan";
import { webWorkers } from "./workers/worker";
import { WasmBuilder } from "./pkg/penumbra_wasm_bg";
import { SpendPlan } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb";
import { ActionPlan, MemoPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

// Globally load WASM module from Penumbra WASM crate 
export const wasm_module = await loadWasmModule();

export const penumbra_wasm_parallel = async (): Promise<any> => {    
    console.log("entered penumbra_wasm_parallel")
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
          address: { altBech32m: "penumbrav2t1ztjrnr9974u4308zxy3sc378sh0k2r8mh0xqt9525c78l9vlyxf2w7c087tlzp4pnk9a7ztvlrnp9lf7hqx3wsm9su4e7vchtav0ap3lpnedry5hfn22hnu9vvaxjpv0t8phvp" },
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

    // Authorize
    const authorizationData = await authorization(transactionPlan)
    console.log("Authorization data: ", authorizationData)

    // Retrieve SCT 
    const sct = await indexedDb.getStateCommitmentTree()

    // Generate witness data from SCT and specific transaction plan
    const witnessData = wasm_module.witness(transactionPlan.plan?.toJson(), sct)
    console.log("Witness: ", witnessData)

    // Viewing key to reveal asset balances and transactions
    const fullViewingKey = "penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2"

    // Check if related fields are non-null
    const action_plan = transactionPlan.plan?.actions;
    const memo = transactionPlan.plan?.memoPlan

    // Execute round of concurrent webworkers to build actions
    const workerPromises = [];
    if (action_plan && memo) {
        for (let i = 0; i < action_plan.length; i++) {
            const workerPromise = webWorkers(
                action_plan[i],
                fullViewingKey,
                witnessData,
                memo
            );

            workerPromises.push(workerPromise)
        }
    }

    // Use Promise.all to spawn all web workers at the same time
    const batchActions = await Promise.all(workerPromises);

    // Execute parallel build method
    const tx = WasmBuilder.build_parallel(
        batchActions, 
        fullViewingKey, 
        transactionPlan.plan?.toJson(), 
        witnessData, 
        authorizationData
    )
    
    console.log("tx is: ", tx)

    // End timer
    const endTime = performance.now()
    const executionTime = endTime - startTime;
    console.log(`sendTx execution time: ${executionTime} milliseconds`)

    return executionTime
};