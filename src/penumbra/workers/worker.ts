import { ActionPlan, TransactionPlan, WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { spawn, Thread, Worker } from 'threads';

export const webWorkers = async (
  transaction_plan: TransactionPlan,
  action_plan: ActionPlan,
  full_viewing_key: string,
  witness_data: WitnessData,
  key_type: string,
) => {
  // Spawn web worker
  const worker = await spawn(new Worker('./webworkers.js'));

  // Execute web worker
  const result = await worker(transaction_plan?.toJson(), action_plan?.toJson(), full_viewing_key, witness_data, key_type);  

  // Terminate web worker
  await Thread.terminate(worker);
  return result;
}