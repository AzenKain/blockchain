import { IBlock, ITransaction } from "@/lib/transactions";

export type BlockServiceResponse = {
    status: Status;
    block: IBlock | null;
}

export type TransactionServiceResponse = {
    status: Status;
    trans: ITransaction | null;
}

export type GetAllBlockServiceResponse = {
    status: Status;
    blocks: IBlock[];
    wrongBlocks: IBlock[];
}
export enum Status {
    Ok = 0,
    WrongBlock = 1,
    CanNotAddBlock = 2,
    CanNotAddTrans = 3,
    NotExistTempBlock = 4,
    NotExistCurrentBlock = 5,
    NotEnoughTrans = 6,
    OtherProblem = 7
}