import { generateKeyPairSync, createSign, createVerify } from "crypto";

export class DigitalSignature {
  private publicKey: string;
  private privateKey: string;

  constructor() {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  signData(hashOfDataToSign: Buffer): Buffer {
    const sign = createSign("sha256");
    sign.update(hashOfDataToSign);
    sign.end();
    return sign.sign(this.privateKey);
  }

  verifySignature(hashOfDataToSign: Buffer, signature: Buffer): boolean {
    const verify = createVerify("sha256");
    verify.update(hashOfDataToSign);
    verify.end();
    return verify.verify(this.publicKey, signature);
  }
}
