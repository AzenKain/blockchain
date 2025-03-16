import database from "../database";
import { CreateBlockDto, CreateTransactionDto } from "../dtos";
import { Block, Transaction } from "../lib/transactions";

export const createBlockService = async (dto: CreateBlockDto) => {
    const block = fromDtoToBlock(dto)
    const value = await database.addBlock(block, dto.miner)

    return { status: value !== null ? true : false, block: value};
};

export const getAllBlocksService = async () => {
    const data = database.getBlocks();
    const newResult = data.map(v => Block.fromJSON(v))
    newResult[0].removeMerkleTree()
    return newResult
};

export const getTmpBlocksService = async () => {
    const value = await database.getTmpBlocks()
    if (value) {
        value.merkleTree = undefined;
    }
    return value;
};

export const createTransactionService = async (dto: CreateTransactionDto) => {
    const trans = fromDtoToTransaction(dto)
    const value = await database.addTransactions(trans)
    return { status: value !== null ? true : false, trans: value }
};

export function fromDtoToBlock(dto: CreateBlockDto): Block {
    const block = new Block(dto.blockNumber);
    block.transactions = dto.transactions.map(tx => fromDtoToTransaction(tx));
    block.createdDate = new Date(dto.createdDate);
    block.blockHash = dto.blockHash;
    block.previousBlockHash = dto.previousBlockHash ?? null;
    return block;
}

export function fromDtoToTransaction(dto: CreateTransactionDto): Transaction {
    return new Transaction(
        dto.claimNumber,
        dto.settlementAmount,
        new Date(dto.settlementDate),
        dto.carRegistration,
        dto.mileage,
        dto.claimType
    );
}
