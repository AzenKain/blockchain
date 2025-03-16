export type CreateBlockDto = {
    transactions: CreateTransactionDto[];
    miner: string;
    blockNumber: number;
    createdDate: Date;
    blockHash: string;
    previousBlockHash?: string | null;
}

export type CreateTransactionDto = {
    claimNumber: string;
    settlementAmount: number;
    settlementDate: Date;
    carRegistration: string;
    mileage: number;
    claimType: number;
}
