import { IBlock } from "./block";

export interface IBlockChain {
    acceptBlock(block: IBlock): void;
    nextBlockNumber: number;
    verifyChain(): void;
}

export class BlockChain implements IBlockChain {
    private currentBlock: IBlock | null = null;
    private headBlock: IBlock | null = null;
    public blocks: IBlock[] = [];

    acceptBlock(block: IBlock): void {
        if (!this.headBlock) {
            this.headBlock = block;
            this.headBlock.previousBlockHash = null;
        }

        this.currentBlock = block;
        this.blocks.push(block);
    }

    get nextBlockNumber(): number {
        return this.headBlock ? this.currentBlock!.blockNumber + 1 : 0;
    }

    verifyChain(): void {
        if (!this.headBlock) {
            throw new Error("Genesis block not set.");
        }

        const isValid = this.headBlock.isValidChain(null, true);
        console.log(isValid ? "Blockchain integrity intact." : "Blockchain integrity NOT intact.");
    }
}