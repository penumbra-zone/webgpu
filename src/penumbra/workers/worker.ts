import { ActionPlan, MemoData, MemoPlan, WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { spawn, Thread, Worker } from 'threads';
import { WasmBuilder } from "../pkg/penumbra_wasm";

export const webWorkers = async (
  action_plan: ActionPlan,
  full_viewing_key: string,
  witness_data: WitnessData,
  memo_key: MemoPlan,
) => {
  // Spawn web workers
  const worker = await spawn(new Worker('./webworkers.js'));
  const result = await worker(action_plan?.toJson(), full_viewing_key, witness_data, memo_key);  
  await Thread.terminate(worker);
  return result;
}