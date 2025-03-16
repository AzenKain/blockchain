import { HashData } from "../blockchain";

export interface ITransaction {
  claimNumber: string;
  settlementAmount: number;
  settlementDate: Date;
  carRegistration: string;
  mileage: number;
  claimType: ClaimType;

  calculateTransactionHash(): string;
}

export enum ClaimType {
  TotalLoss = 0
}

export class Transaction implements ITransaction {
  claimNumber: string;
  settlementAmount: number;
  settlementDate: Date;
  carRegistration: string;
  mileage: number;
  claimType: ClaimType;

  static fromJSON(data: ITransaction): Transaction {
    return new Transaction(
      data.claimNumber,
      data.settlementAmount,
      new Date(data.settlementDate),
      data.carRegistration,
      data.mileage,
      data.claimType
    );
  }

  constructor(
    claimNumber: string,
    settlementAmount: number,
    settlementDate: Date,
    carRegistration: string,
    mileage: number,
    claimType: ClaimType
  ) {
    this.claimNumber = claimNumber;
    this.settlementAmount = settlementAmount;
    this.settlementDate = settlementDate;
    this.carRegistration = carRegistration;
    this.mileage = mileage;
    this.claimType = claimType;
  }

  calculateTransactionHash(): string {
    const txnHash = `${this.claimNumber}${this.settlementAmount}${this.settlementDate}${this.carRegistration}${this.mileage}${this.claimType}`;
    return Buffer.from(HashData.computeHashSha256(Buffer.from(txnHash, "utf-8"))).toString("base64");
  }
}