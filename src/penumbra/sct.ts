export type Position = {
    epoch: number;
    block: number;
    commitment: number;
};  

export type StoredPosition = { Position: Position }

export interface StoreHash {
    position: Position;
    height: number;
    hash: Uint8Array;
    essential: boolean;
}

export interface StoreCommitment {
    position: Position;
    commitment: {
        inner: string; 
    };
}

export interface StateCommitmentTree {
    last_position: Position;
    last_forgotten: bigint;
    hashes: StoreHash[];
    commitments: StoreCommitment[];
}

export type SctUpdates = {
    store_commitments: {
        commitment: {
            inner: string;
        };
        position: {
            epoch: number;
            block: number;
            commitment: number;
        };
    };
    set_position: StoredPosition,
    set_forgotten: bigint;
  };
