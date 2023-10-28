import { IndexedDb } from './database';
import { AuthorizeResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { TransactionPlannerResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { WitnessAndBuildResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { build, witness, } from '@penumbra-zone/wasm-bundler';

export const witness_and_build = async (
    indexedDb: IndexedDb,
    auth: AuthorizeResponse,
    req: TransactionPlannerResponse
  ): Promise<WitnessAndBuildResponse> => {
    const sct = await indexedDb.getStateCommitmentTree();
    
    const witnessData = witness(req.plan?.toJson(), sct);
  
    const fullViewingKey = "penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2"
  
    const transaction = build(
      fullViewingKey,
      req.plan?.toJson(),
      witnessData,
      auth,
    );
  
    return transaction;
  };