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
    key_type: string
): Promise<any> {    
    // Conditionally read proving keys from disk and load keys into WASM binary
    switch(key_type) {
        case "spend":
            const spendKey = await fetchBinaryFile('spend_pk.bin');
            load_proving_key(spendKey, "spend");
            break;
        case "output":
            const outputKey = await fetchBinaryFile('output_pk.bin');
            load_proving_key(outputKey, "output");
            break;
        case "delegatorVote":
            const delegatorKey = await fetchBinaryFile('delegator_vote_pk.bin');
            load_proving_key(delegatorKey, "delegator_vote");
            break;
        case "swap":
            const swapKey = await fetchBinaryFile('swap_pk.bin');
            load_proving_key(swapKey, "swap");
            break;
        case "swapClaim":
            const swapClaimKey = await fetchBinaryFile('swapclaim_pk.bin');
            load_proving_key(swapClaimKey, "swap_claim");
            break;
         case "UndelegateClaim":
            const undelegateClaimKey = await fetchBinaryFile('undelegateclaim_pk.bin');
            load_proving_key(undelegateClaimKey, "undelegate_claim");
            break;
    }

    // Build specific action in transaction plan
    const action = build_action(transaction_plan, action_plan, full_viewing_key, witness_data)

    return action;
}

// Expose function to web workers
expose(execute_worker)
