import { IBlock, ITransaction } from "@/lib/transactions";

export type BlockServiceResponse = {
    status: boolean;
    block: IBlock | null;
}

export type TransactionServiceResponse = {
    status: boolean;
    trans: ITransaction | null;
}