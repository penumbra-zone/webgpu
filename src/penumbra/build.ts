import { IndexedDb } from './database';
import { AuthorizeResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { TransactionPlannerResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { WitnessAndBuildResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { witness, build } from '@penumbra-zone-test/wasm-bundler';

export const witness_and_build = async (
    indexedDb: IndexedDb,
    auth: AuthorizeResponse,
    req: TransactionPlannerResponse
  ): Promise<WitnessAndBuildResponse> => {
    // Retrieve SCT 
    const sct = await indexedDb.getStateCommitmentTree();

    // Generate witness data from SCT and specific transaction plan
    const witnessData = witness(req.plan?.toJson(), sct);

    // Viewing key to reveal asset balances and transactions
    const fullViewingKey = "penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2"
  
    // Generate proof
    const transaction = build(
      fullViewingKey,
      req.plan?.toJson(),
      witnessData,
      auth,
    );
  
    return transaction;
  };