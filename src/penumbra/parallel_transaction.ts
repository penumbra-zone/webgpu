import { loadWasmModule } from "./wasm-loader";
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IndexedDb } from './database';
import { base64ToUint8Array } from './utils'
import { authorization } from "./authorize";
import { witness_and_build } from './build'
import { transaction_plan } from "./tx-plan";
import { webWorkers } from "./workers/worker";

// Globally load WASM module from Penumbra WASM crate 
export const wasm_module = await loadWasmModule();

export const penumbra_wasm_parallel = async (): Promise<any> => {    
    console.log("entered penumbra_wasm_parallel")
    // Start timer
    const startTime = performance.now(); // Record start time

    // Use `hardwareConcurrency` instead
    const maxWebWorkers = 8; 

    // Array of web worker promises
    const workerPromises = [];

    // Execute round of concurrent webworkers 
    for (let i = 0; i < maxWebWorkers; i++) {
        workerPromises.push(webWorkers())
    }
    const results = await Promise.all(workerPromises);
};