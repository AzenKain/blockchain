import { createHash } from "crypto";
// import { Constants } from "./constants";

export class MerkleHash {
  value: Buffer;

  private constructor(hash: Buffer) {
    this.value = hash;
  }

  static create(buffer: Buffer | string): MerkleHash {
    if (typeof buffer === "string") {
      buffer = Buffer.from(buffer, "utf-8");
    }
    return new MerkleHash(this.computeHash(buffer));
  }

  static createFromHashes(left: MerkleHash, right: MerkleHash): MerkleHash {
    return MerkleHash.create(Buffer.concat([left.value, right.value]));
  }

  private static computeHash(buffer: Buffer): Buffer {
    return createHash("sha256").update(buffer).digest();
  }

  equals(other: MerkleHash | Buffer): boolean {
    if (other instanceof MerkleHash) {
      return this.value.equals(other.value);
    }
    return this.value.equals(other);
  }

  toString(): string {
    return this.value.toString("hex");
  }
}
