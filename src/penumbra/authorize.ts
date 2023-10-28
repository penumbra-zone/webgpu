import { TransactionPlannerResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { AuthorizeResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { authorize } from '@penumbra-zone/wasm-bundler';

export async function authorization(txPlan: TransactionPlannerResponse): Promise<AuthorizeResponse> {
    const spendKey = "penumbraspendkey1qul0huewkcmemljd5m3vz3awqt7442tjg2dudahvzu6eyj9qf0eszrnguh"

    const authorizationData = authorize(spendKey, txPlan.plan?.toJson())
    
    return authorizationData
  }
  