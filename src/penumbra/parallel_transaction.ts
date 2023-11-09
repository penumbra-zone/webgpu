import { loadWasmModule } from "./wasm-loader";
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IndexedDb } from './database';
import { base64ToUint8Array } from './utils'
import { authorization } from "./authorize";
import { witness_and_build_parallel } from './build_parallel'
import { transaction_plan } from "./tx-plan";
import { webWorkers } from "./workers/worker";
import { WasmBuilder } from "./pkg/penumbra_wasm_bg";
import { SpendPlan } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb";

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
    const auth = await authorization(transactionPlan)
    console.log("Authorization: ", auth)

    // // Witness and Build
    const build = await witness_and_build_parallel(indexedDb, auth, transactionPlan)

    // Use `hardwareConcurrency` instead
    const maxWebWorkers = 8; 

    // Array of web worker promises
    const workerPromises = [];

    // Check if actions are non-null
    const actions = transactionPlan.plan?.actions
    const memo = transactionPlan.plan?.memoPlan

    // Execute round of concurrent webworkers 
    if (actions && memo) {
        for (let i = 0; i < actions.length; i++) {
            workerPromises.push(webWorkers(
                actions[i]!,
                build[0],
                build[1],
                memo
            ))
        }
    }

    // End timer
    const endTime = performance.now()
    const executionTime = endTime - startTime;
    console.log(`sendTx execution time: ${executionTime} milliseconds`)

    return executionTime
};