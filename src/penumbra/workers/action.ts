import { ActionPlan, MemoPlan, WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { expose } from 'threads/worker';
import { WasmBuilder } from '../pkg/penumbra_wasm_bg';

export async function execute_worker(
action_plan: ActionPlan,
  full_viewing_key: string,
  witness_data: WitnessData,
  memo_key: MemoPlan,
): Promise<any> {
    console.log("Spawned worker!");

    console.log("action_plan is: ", action_plan)
    console.log("full_viewing_key is: ", full_viewing_key)
    console.log("witness_data is: ", witness_data)
    console.log("memo_key is: ", memo_key)

    let action = await WasmBuilder.action_builder(action_plan, full_viewing_key, witness_data, memo_key)

    console.log("action is: ", action)
}

// Expose function to web workers
expose(execute_worker)