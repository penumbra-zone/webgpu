import { IDBPDatabase, openDB } from 'idb';
import { DBSchema, StoreNames } from 'idb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Note } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { SpendableNoteRecord, SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { StateCommitmentTree, StoreCommitment, StoredPosition, StoreHash } from './sct';

// Represents any possible JSON value:
export type JsonValue = number | string | boolean | null | JsonObject | JsonValue[];

// Represents a JSON object
export type JsonObject = {
  [k: string]: JsonValue;
};

type Jsonified<T> = JsonValue;

export type Tables = Record<string, StoreNames<PenumbraDb>>;

export interface IdbConstants {
  name: string;
  version: number;
  tables: Tables;
}

export const IDB_TABLES: Tables = {
  assets: 'ASSETS',
  notes: 'NOTES',
  spendable_notes: 'SPENDABLE_NOTES',
  swaps: 'SWAPS',
};

export interface PenumbraDb extends DBSchema {
  TREE_LAST_POSITION: {
    key: 'last_position';
    value: StoredPosition;
  };
  TREE_LAST_FORGOTTEN: {
    key: 'last_forgotten';
    value: bigint;
  };
  TREE_HASHES: {
    key: number;
    value: StoreHash;
  };
  TREE_COMMITMENTS: {
    key: StoreCommitment['commitment']['inner'];
    value: StoreCommitment;
  };
  // ======= Json serialized values =======
  // Allows wasm crate to directly deserialize
  ASSETS: {
    key: string; // Jsonified<DenomMetadata['penumbraAssetId']['inner']>
    value: Jsonified<DenomMetadata>;
  };
  SPENDABLE_NOTES: {
    key: string; // Jsonified<SpendableNoteRecord['noteCommitment']['inner']>
    value: Jsonified<SpendableNoteRecord>;
    indexes: {
      nullifier: string; // Jsonified<SpendableNoteRecord['nullifier']['inner']>
    };
  };
  NOTES: {
    key: string; // Jsonified<Note['address']['inner']>
    value: Jsonified<Note>;
  };
  SWAPS: {
    key: string; // Jsonified<SwapRecord['swapCommitment']['inner']>
    value: Jsonified<SwapRecord>;
  };
}

export interface IndexedDbInterface {
  constants(): IdbConstants;
  getStateCommitmentTree(): Promise<StateCommitmentTree>;
}

interface IndexedDbProps {
  dbVersion: number;
  chainId: string;
  walletId: string;
}

export class IndexedDb implements IndexedDbInterface { 
  private constructor(
    public readonly db: IDBPDatabase<PenumbraDb>,
    public readonly c: IdbConstants,
  ) {}

  static async initialize({ dbVersion, walletId, chainId }: IndexedDbProps): Promise<IndexedDb> {
      const dbName = `viewdata/${chainId}/${walletId}`;
      const db = await openDB<PenumbraDb>(dbName, dbVersion, {
        upgrade(db: IDBPDatabase<PenumbraDb>) {
          db.createObjectStore('SPENDABLE_NOTES', {
            keyPath: 'noteCommitment.inner',
          }).createIndex('nullifier', 'nullifier.inner', { unique: false });
          db.createObjectStore('TREE_LAST_POSITION');
          db.createObjectStore('TREE_LAST_FORGOTTEN');
          db.createObjectStore('TREE_COMMITMENTS', { keyPath: 'commitment.inner' });
          db.createObjectStore('TREE_HASHES', { autoIncrement: true });
        },
      });

      const constants = {
        name: dbName,
        version: dbVersion,
        tables: IDB_TABLES,
      } satisfies IdbConstants;

      console.log("db is: ", db)
      return new this(db, constants);
  }

  public constants(): IdbConstants {
    return this.c;
  }

  public async getStateCommitmentTree(): Promise<StateCommitmentTree> {
    const lastPosition = await this.db.get('TREE_LAST_POSITION', 'last_position');
    const lastForgotten = await this.db.get('TREE_LAST_FORGOTTEN', 'last_forgotten');
    const hashes = await this.db.getAll('TREE_HASHES');
    const commitments = await this.db.getAll('TREE_COMMITMENTS');

    const last_position: any = {
      Position: {
        epoch: 0,
        block: 0,
        commitment: 0,
      },
    };
   
    return {
      last_position: lastPosition ?? last_position,
      last_forgotten: lastForgotten ?? 0n,
      hashes,
      commitments,
    };
  }
}