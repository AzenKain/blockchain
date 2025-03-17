export type CreateBlockDto = {
    transactions: CreateTransactionDto[];
    blockNumber: number;
    createdDate: Date;
    blockHash: string;
    previousBlockHash?: string | null;
}

export type CreateTransactionDto = {
    studentCode: string;
    subjectCode: string;
    mark: number;
    timestamp: Date;
    nMark: number;
}
