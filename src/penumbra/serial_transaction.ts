import { loadWasmModule } from "./wasm-loader";
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IndexedDb } from './database';
import { base64ToUint8Array } from './utils'
import { authorization } from "./authorize";
import { witness_and_build } from './build'
import { transaction_plan } from "./tx-plan";

// Globally load WASM module from Penumbra WASM crate 
export const wasm_module = await loadWasmModule();

export const penumbra_wasm = async (): Promise<any> => {    
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

    // Witness and Build
    const build = await witness_and_build(indexedDb, auth, transactionPlan)
    console.log("ZK Proof: ", build)
    

    // End timer
    const endTime = performance.now();
    const executionTime = endTime - startTime; 
    console.log(`sendTx execution time: ${executionTime} milliseconds`);

    return executionTime
};