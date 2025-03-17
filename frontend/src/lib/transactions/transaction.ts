import { HashData } from "../blockchain";

export interface ITransaction {
  studentCode: string;
  subjectCode: string;
  mark: number;
  timestamp: Date;
  nMark: number;
  calculateTransactionHash(): string;
}


export class Transaction implements ITransaction {
  studentCode: string;
  mark: number;
  timestamp: Date;
  nMark: number;
  subjectCode: string;

  static fromJSON(data: ITransaction): Transaction {
    return new Transaction(
      data.studentCode,
      data.mark,
      new Date(data.timestamp),
      data.nMark,
      data.subjectCode
    );
  }

  constructor(
    studentCode: string,
    mark: number,
    timestamp: Date,
    nMark: number,
    subjectCode: string
  ) {
    this.studentCode = studentCode;
    this.mark = mark;
    this.timestamp = timestamp;
    this.nMark = nMark;
    this.subjectCode = subjectCode;
  }

  calculateTransactionHash(): string {
    const txnHash = `${this.studentCode}${this.subjectCode}${this.mark}${this.timestamp}${this.nMark}`;
    return Buffer.from(HashData.computeHashSha256(Buffer.from(txnHash, "utf-8"))).toString("base64");
  }
}