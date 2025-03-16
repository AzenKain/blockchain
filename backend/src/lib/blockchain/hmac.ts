import { randomBytes, createHmac } from "crypto";

export class Hmac {
  private static readonly KeySize = 32;

  static generateKey(): Buffer {
    return randomBytes(this.KeySize);
  }

  static computeHmacSha256(toBeHashed: Buffer, key: Buffer): Buffer {
    return createHmac("sha256", key).update(toBeHashed).digest();
  }
}
