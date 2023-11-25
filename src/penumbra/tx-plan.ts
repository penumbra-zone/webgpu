import { IdbConstants } from './database'
import { ChainParameters, FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { Address, AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { Value } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { MemoPlaintext, TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { JsonValue} from '@bufbuild/protobuf';
import { TransactionPlannerRequest, TransactionPlannerResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { IndexedDb } from './database';
import { SctUpdates } from './sct'
import { spendable_note } from './note'
import { WasmPlanner } from '@penumbra-zone-test/wasm-bundler';

export async function transaction_plan(
    indexedDb: IndexedDb,
    req: TransactionPlannerRequest,
  ): Promise<TransactionPlannerResponse> {
    // Define sct updates
    const sctUpdates: SctUpdates = {
      store_commitments: {
          commitment: { inner: "MY7PmcrH4fhjFOoMIKEdF+x9EUhZ9CS/CIfVco7Y5wU=" },
          position: { 
            epoch: 746, 
            block: 237, 
            commitment: 0 
          },
        },
        set_position: {
          Position: {
              epoch: 750,
              block: 710,
              commitment: 0,
          },
        },
        set_forgotten: 3n,
    };
  
    const notes = indexedDb.db.transaction('SPENDABLE_NOTES', 'readwrite').objectStore('SPENDABLE_NOTES');
    const tree_commitments = indexedDb.db.transaction('TREE_COMMITMENTS', 'readwrite').objectStore('TREE_COMMITMENTS');
    const tree_last_position = indexedDb.db.transaction('TREE_LAST_POSITION', 'readwrite').objectStore('TREE_LAST_POSITION');
    const tree_last_forgotten = indexedDb.db.transaction('TREE_LAST_FORGOTTEN', 'readwrite').objectStore('TREE_LAST_FORGOTTEN');
  
    notes.put(spendable_note.toJson());
    tree_commitments.put(sctUpdates.store_commitments);
    tree_last_position.put(sctUpdates.set_position, "last_position");
    tree_last_forgotten.put(sctUpdates.set_forgotten, 'last_forgotten');
  
    const chainParams: ChainParameters = {
      chainId: "penumbra-testnet-iapetus",
      epochDuration: BigInt(5),
    } as ChainParameters;
  
    const fmdParams: FmdParameters = {
      precisionBits: 0,
      asOfBlockHeight: BigInt(1),
    } as FmdParameters;
    
    const planner = await TxPlanner.initialize({
      idbConstants: indexedDb.constants(),
      chainParams,
      fmdParams,
    });

    for (const o of req.outputs) {
      if (!o.value || !o.address) continue;
      planner.output(o.value, o.address);
    }

    // Construct memo data
    const address_for_memo = {
      altBech32m: "penumbra1dugkjttfezh4gfkqs77377gnjlvmkkehusx6953udxeescc0qpgk6gqc0jmrsjq8xphzrg938843p0e63z09vt8lzzmef0q330e5njuwh4290n8pemcmx70sasym0lcjkstgzc".toString(),
    }
    const memo = new MemoPlaintext({
      returnAddress: address_for_memo,
      text: "sample-memo",
    })
    const memo_result = await planner.memo(memo);

    // Construct transaction plan
    const addressIndex: AddressIndex | null = null;
    const refundAddrJson = {
      inner: "ts1I61pd5+xWqlwcuPwsPOGbjevxAoQVymTXyHe60jLlY57WHcAuGsSwYuSxnOX+nTgEBm3MHn7mBlNTxqEkbnJwlNu6YUSDmA8D+aOqCT4=".toString()
    }
    const plan = await planner.plan(refundAddrJson, addressIndex);

    return new TransactionPlannerResponse({ plan });
  }

  interface PlannerProps {
    idbConstants: IdbConstants;
    chainParams: ChainParameters;
    fmdParams: FmdParameters;
}

export class TxPlanner {
    public constructor(public wasmPlanner: any) {}
  
    static async initialize({idbConstants, chainParams, fmdParams }: PlannerProps): Promise<TxPlanner> {
      const wasmPlanner = await WasmPlanner.new(idbConstants, chainParams, fmdParams);
      return new this(wasmPlanner);
    }

    async output(value: Value, addr: Address): Promise<void> {
        this.wasmPlanner.output(value.toJson(), addr.toJson());
    }

    async memo(message: MemoPlaintext): Promise<void> {
      this.wasmPlanner.memo(message.toJson())
    }

    async plan(refundAddr: any, sourceAddr: any): Promise<TransactionPlan> {
        const json = (await this.wasmPlanner.plan(refundAddr, sourceAddr)) as JsonValue;

        return TransactionPlan.fromJson(json);
    }
}