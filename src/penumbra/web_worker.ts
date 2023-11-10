import { ActionPlan, MemoData, WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { WasmBuilder } from './pkg/penumbra_wasm.js';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';

// let penumbraWasmModule: typeof import('./pkg/penumbra_wasm') | undefined

// // Use an IIFE (Immediately Invoked Function Expression) to perform the dynamic import
// (async () => {
//     // Preload the WebAssembly module
//     penumbraWasmModule = await import('./pkg/penumbra_wasm')
// })();

self.addEventListener('message', async function(e) {
    const { type, data } = e.data;

    if (type === 'ExecuteFunction') {
        console.log("!!!!!!!!!!!!!!!!!!")
        
        // Destructure the data object to get individual fields
        const { action_plan, full_viewing_key, witness_data, memo_key } = data

        console.log("action_plan is: ", action_plan)
        console.log("full_viewing_key is: ", full_viewing_key)
        console.log("witness_data is: ", witness_data)
        console.log("memo_key is: ", memo_key)
        
        // Execute your function using the fields
        const action = await execute_worker(action_plan, full_viewing_key, witness_data, memo_key);

        // JSON.parse(JSON.stringify(obj));
        self.postMessage(JSON.stringify(action));
    }
}, false);

async function execute_worker(
    action_plan: JsonValue, 
    full_viewing_key: string, 
    witness_data: WitnessData, 
    memo_key: MemoData
) {

    // Ensure that the WebAssembly module is preloaded before use
    // if (!penumbraWasmModule) {
    //     throw new Error('WebAssembly module not preloaded');
    // }

    const penumbraWasmModule = await import('./pkg/penumbra_wasm');
    
    const action = await penumbraWasmModule.WasmBuilder.action_builder(action_plan, full_viewing_key, witness_data, memo_key)

    console.log("action is: ", action)

    return action
}