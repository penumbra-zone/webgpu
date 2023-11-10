import { ActionPlan, MemoData, WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { WasmBuilder } from './pkg/penumbra_wasm.js';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';

self.addEventListener('message', async function(e) {
    const { type, data } = e.data;

    if (type === 'ExecuteFunction') {        
        // Destructure the data object to get individual fields
        const { action_plan, full_viewing_key, witness_data, memo_key } = data

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
    const penumbraWasmModule = await import('./pkg/penumbra_wasm');
    
    const action = await penumbraWasmModule.WasmBuilder.action_builder(action_plan, full_viewing_key, witness_data, memo_key)

    return action
}