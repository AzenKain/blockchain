import { createHash } from "crypto";

export class HashData {
  static computeHashSha256(toBeHashed: Buffer): Buffer {
    return createHash("sha256").update(toBeHashed).digest();
  }
}