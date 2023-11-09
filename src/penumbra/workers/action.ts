import { expose } from 'threads/worker';

export async function execute_worker(): Promise<any> {
    console.log("action.ts")
    console.log("Spawned worker!");
    
    return 10
}

// Expose function to web workers
expose(execute_worker)