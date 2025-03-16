import crypto from "crypto";
import { DigitalSignature } from "./lib/blockchain";

// Tạo instance DigitalSignature
const ds = new DigitalSignature();

// Giả sử đây là dữ liệu cần ký
const data = "Hello Blockchain!";
const hash = crypto.createHash("sha256").update(data).digest();

// Ký dữ liệu
const signature = ds.signData(hash);
console.log("Signature:", signature.toString("hex"));

// Xác minh chữ ký
const isValid = ds.verifySignature(hash, signature);
console.log("Is signature valid?", isValid);
