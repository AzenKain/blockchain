import * as crypto from 'crypto';

/**
 * Class cung cấp các phương thức để mã hóa và giải mã dữ liệu từ/sang Buffer
 */
export class BufferCrypto {
  private algorithm: string;
  private key: Buffer;
  private iv: Buffer;

  /**
   * Khởi tạo một instance mới của BufferCrypto
   * @param algorithm thuật toán mã hóa (mặc định: 'aes-256-cbc')
   * @param key khóa mã hóa (tùy chọn)
   * @param iv vector khởi tạo (tùy chọn)
   */
  constructor(algorithm = 'aes-256-cbc', key?: string | Buffer, iv?: string | Buffer) {
    this.algorithm = algorithm;
    
    // Khởi tạo key nếu không được cung cấp
    if (!key) {
      this.key = crypto.randomBytes(32);
    } else {
      this.key = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
    }
  
    if (!iv) {
      this.iv = crypto.randomBytes(16);
    } else {
      this.iv = typeof iv === 'string' ? Buffer.from(iv, 'hex') : iv;
    }
  
    if (this.iv.length !== 16) {
      throw new Error(`Invalid IV length: ${this.iv.length}, expected 16 bytes`);
    }
  
  }

  /**
   * Lấy key hiện tại dưới dạng hex string
   */
  getKeyAsHex(): string {
    return this.key.toString('hex');
  }

  /**
   * Lấy IV hiện tại dưới dạng hex string
   */
  getIvAsHex(): string {
    return this.iv.toString('hex');
  }

  /**
   * Mã hóa dữ liệu sử dụng thuật toán được cấu hình
   * @param data dữ liệu cần mã hóa (Buffer hoặc string)
   * @returns Buffer chứa dữ liệu đã mã hóa
   */
  encrypt(data: Buffer | string): Buffer {
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    const encryptedData = Buffer.concat([
      cipher.update(dataBuffer),
      cipher.final()
    ]);
    
    return encryptedData;
  }

  /**
   * Giải mã dữ liệu đã được mã hóa
   * @param encryptedData dữ liệu đã mã hóa dưới dạng Buffer
   * @returns Buffer chứa dữ liệu đã giải mã
   */
  decrypt(encryptedData: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    const decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    
    return decryptedData;
  }

  /**
   * Mã hóa và trả về kết quả dưới dạng base64 string
   * @param data dữ liệu cần mã hóa
   * @returns chuỗi base64 của dữ liệu đã mã hóa
   */
  encryptToBase64(data: Buffer | string): string {
    return this.encrypt(data).toString('base64');
  }

  /**
   * Giải mã dữ liệu từ chuỗi base64
   * @param base64Data chuỗi base64 chứa dữ liệu đã mã hóa
   * @returns Buffer chứa dữ liệu đã giải mã
   */
  decryptFromBase64(base64Data: string): Buffer {
    const encryptedBuffer = Buffer.from(base64Data, 'base64');
    return this.decrypt(encryptedBuffer);
  }

  /**
   * Hash dữ liệu sử dụng thuật toán được chỉ định
   * @param data dữ liệu cần hash
   * @param hashAlgorithm thuật toán hash (mặc định: 'sha256')
   * @returns chuỗi hex của dữ liệu đã hash
   */
  hash(data: Buffer | string, hashAlgorithm = 'sha256'): string {
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return crypto.createHash(hashAlgorithm).update(dataBuffer).digest('hex');
  }

  /**
   * Tạo ra một HMAC cho dữ liệu
   * @param data dữ liệu cần tạo HMAC
   * @param hmacAlgorithm thuật toán HMAC (mặc định: 'sha256')
   * @returns chuỗi hex của HMAC
   */
  hmac(data: Buffer | string, hmacAlgorithm = 'sha256'): string {
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return crypto.createHmac(hmacAlgorithm, this.key).update(dataBuffer).digest('hex');
  }
}