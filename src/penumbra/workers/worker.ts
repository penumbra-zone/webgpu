import { spawn, Thread, Worker } from 'threads';

export const webWorkers = async () => {
  console.log("Entered worker.ts")
  
  // Spawn web workers
  const worker = await spawn(new Worker('./webworkers.js'));
  const result = await worker();
  await Thread.terminate(worker);
  return result;
}