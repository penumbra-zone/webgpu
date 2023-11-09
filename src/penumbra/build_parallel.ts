import { IndexedDb } from './database';
import { AuthorizeResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { TransactionPlannerResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { WitnessAndBuildResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { wasm_module } from './serial_transaction'
import { WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const witness_and_build_parallel = async (
    indexedDb: IndexedDb,
    auth: AuthorizeResponse,
    req: TransactionPlannerResponse
  ): Promise<[string, WitnessData, AuthorizeResponse]> => {
    // Retrieve SCT T
    const sct = await indexedDb.getStateCommitmentTree();

    // Generate witness data from SCT and specific transaction plan
    const witnessData = wasm_module.witness(req.plan?.toJson(), sct);
    console.log("Witness: ", witnessData)

    // Viewing key to reveal asset balances and transactions
    const fullViewingKey = "penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2"
  
    console.log("req.plan?.toJson() is: ", req.plan?.toJson())
    console.log("transaciton plan actions are: ", req.plan?.actions)

    return [fullViewingKey, witnessData, auth];
  };