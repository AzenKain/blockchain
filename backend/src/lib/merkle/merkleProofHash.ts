import { MerkleHash } from "./merkleHash";
export enum Branch {
    Left = "Left",
    Right = "Right",
    OldRoot = "OldRoot"
}
export class MerkleProofHash {


    hash: MerkleHash;
    direction: keyof typeof Branch;

    constructor(hash: MerkleHash, direction: keyof typeof Branch) {
        this.hash = hash;
        this.direction = direction;
    }

    toString(): string {
        return this.hash.toString();
    }
}
