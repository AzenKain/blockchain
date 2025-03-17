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
    public wrongBlocks: IBlock[] = [];
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
    
        let previousHash: string | null = null;
        this.wrongBlocks = [];
    
        for (const block of this.blocks) {
            const { isValid, currentHash } = block.isValidChain(previousHash, true);
            if (!isValid) {
                this.wrongBlocks.push(block);
            }
          
            previousHash = currentHash;
        }
    
        console.log(this.wrongBlocks.length === 0 ? "Blockchain integrity intact." : "Blockchain integrity NOT intact.");
    }
    
}