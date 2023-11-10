import { ActionPlan, MemoData, MemoPlan, WitnessData  } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { spawn, Thread, Worker } from 'threads';
import { expose } from 'threads/worker';
import { WasmBuilder } from '../pkg/penumbra_wasm.js';
import { JsonValue } from '@bufbuild/protobuf';

export async function execute_worker(
    action_plan: JsonValue,
    full_viewing_key: string,
    witness_data: WitnessData,
    memo_key: MemoPlan,
): Promise<any> {
    const action = await WasmBuilder.action_builder(action_plan, full_viewing_key, witness_data, memo_key)
    return action;
}

// Expose function to web workers
expose(execute_worker)