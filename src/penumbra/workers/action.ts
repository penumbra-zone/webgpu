import { WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { build_action, load_proving_key } from '@penumbra-zone-test/wasm-bundler';
import { fetchBinaryFile } from '../utils';
import { expose } from 'threads/worker';
import { JsonValue } from '@bufbuild/protobuf';

export async function execute_worker(
    transaction_plan: JsonValue,
    action_plan: JsonValue,
    full_viewing_key: string,
    witness_data: WitnessData,
): Promise<any> {    
    // Read proving keys from disk
    const delegatorKey = await fetchBinaryFile('delegator_vote_pk.bin');
    const nullifierKey = await fetchBinaryFile('nullifier_derivation_pk.bin');
    const outputKey = await fetchBinaryFile('output_pk.bin');
    const spendKey = await fetchBinaryFile('spend_pk.bin');
    const swapKey = await fetchBinaryFile('swap_pk.bin');
    const swapClaimKey = await fetchBinaryFile('swapclaim_pk.bin');
    const undelegateClaimKey = await fetchBinaryFile('undelegateclaim_pk.bin');

    // Load keys into WASM binary
    load_proving_key(spendKey, "spend");
    load_proving_key(outputKey, "output");
    load_proving_key(delegatorKey, "delegator_vote");
    load_proving_key(nullifierKey, "nullifier_derivation");
    load_proving_key(swapKey, "swap");
    load_proving_key(swapClaimKey, "swap_claim");
    load_proving_key(undelegateClaimKey, "undelegate_claim");

    // Build specific action in transaction plan
    const action = build_action(transaction_plan, action_plan, full_viewing_key, witness_data)

    return action;
}

// Expose function to web workers
expose(execute_worker)
