import database from "../database";
import { CreateBlockDto, CreateTransactionDto } from "../dtos";
import { Block, Transaction } from "../lib/transactions";

export const createBlockService = async (dto: CreateBlockDto) => {
    const block = fromDtoToBlock(dto)
    const value = await database.addBlock(block)
    if (value.block === null) {
        return value
    }
    const newBlock = Block.fromJSON(structuredClone(value.block))
    newBlock?.removeMerkleTree()
    return { status: value.status, block: newBlock};
};

export const getAllBlocksService = async () => {
    const data = database.getBlocks();
    const blocks = data.blocks.map(v => Block.fromJSON(v))
    blocks.forEach(it => it.nextBlock = null)
    blocks.forEach(it => it.removeMerkleTree())

    const wrongBlock = data.wrongBlocks.map(v => Block.fromJSON(v))
    wrongBlock.forEach(it => it.nextBlock = null)
    wrongBlock.forEach(it => it.removeMerkleTree())
    return {status: data.status, blocks: blocks, wrongBlock: wrongBlock}
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
    return value
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
        dto.studentCode,
        dto.mark,
        new Date(dto.timestamp),
        dto.nMark,
        dto.subjectCode
    );
}
