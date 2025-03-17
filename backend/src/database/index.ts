import * as fs from "fs";
import * as path from "path";
import { Block, BlockChain, IBlock, Transaction } from "../lib/transactions";


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

class DatabaseSingleton {
    private static instance: DatabaseSingleton;
    private filePath: string;
    private fileTmpPath: string;
    private chain: BlockChain;
    private tmpBlock?: Block;
    private currentBlock?: Block;

    private constructor() {
        this.filePath = path.join(process.cwd(), "data", "data.json");
        this.fileTmpPath = path.join(process.cwd(), "data", "tmp.json");
        this.chain = new BlockChain();
    }

    static getInstance(): DatabaseSingleton {
        if (!DatabaseSingleton.instance) {
            DatabaseSingleton.instance = new DatabaseSingleton();
        }
        return DatabaseSingleton.instance;
    }

    async loadDatabase(): Promise<Block[]> {
        try {
            if (!fs.existsSync(this.filePath)) {
                console.error(`File not found: ${this.filePath}`);
                return [];
            }
            const data = await fs.promises.readFile(this.filePath, "utf-8");
            const parsedData = JSON.parse(data);
            const blocks = parsedData.map((block: any) => Block.fromJSON(block));

            return blocks;
        } catch (error) {
            console.error("Error reading or parsing JSON:", error);
            return [];
        }
    }

    async loadTmpBlock() {
        try {
            if (!fs.existsSync(this.fileTmpPath)) {
                console.error(`File not found: ${this.fileTmpPath}, creating new block.`);
                const newBlock = new Block(this.chain.nextBlockNumber);
                this.tmpBlock = newBlock;
                await this.saveTmpBlock();
                return;
            }

            const data = await fs.promises.readFile(this.fileTmpPath, "utf-8");
            const parsedData = JSON.parse(data);

            const block = Block.fromJSON(parsedData);
            this.tmpBlock = block;
            return;
        } catch (error) {
            console.error("Error reading or parsing JSON:", error);
            const newBlock = new Block(this.chain.nextBlockNumber);
            this.tmpBlock = newBlock;
            await this.saveTmpBlock();
            return;
        }
    }

    async saveTmpBlock(): Promise<void> {
        try {
            if (!this.tmpBlock || !(this.tmpBlock instanceof Block)) return;
            let deepCopy = structuredClone(this.tmpBlock);
            deepCopy = Block.fromJSON(deepCopy)
            deepCopy.removeMerkleTree()
            const data = JSON.stringify(deepCopy, null, 2);
            await fs.promises.writeFile(this.fileTmpPath, data, "utf-8");
            console.log(`Temporary block saved successfully to ${this.fileTmpPath}`);
        } catch (error) {
            console.error("Error saving temporary block:", error);
        }
    }

    async saveDatabase(): Promise<void> {
        try {
            const newResult = this.chain.blocks.map(v => Block.fromJSON(v))
            newResult.forEach(it => it.removeMerkleTree())
            newResult.forEach(it => it.nextBlock = null)
            const data = JSON.stringify(newResult, null, 2);
            await fs.promises.writeFile(this.filePath, data, "utf-8");
            console.log(`Database saved successfully to ${this.filePath}`);
        } catch (error) {
            console.error("Error saving database:", error);
        }
    }

    async initialize() {
        const blocks = await this.loadDatabase();
        if (blocks.length === 0) {
            const newBlock = new Block(0);
            newBlock.addCoinBaseTransaction("Me");
            blocks.push(newBlock);
        }

        this.currentBlock = blocks[blocks.length - 1]

        for (let i = 0; i < blocks.length-1; i++) {
            blocks[i].nextBlock = blocks[i+1]
        }

        blocks.forEach((block) => this.chain.acceptBlock(block));

        try {
            this.chain.verifyChain();
        } catch (error) {
            console.error("Error verifying chain:", error);
        }
        await this.saveDatabase()
        await this.loadTmpBlock()
    }

    getBlockChain(): BlockChain {
        return this.chain;
    }

    getBlocks(): {status : Status, blocks : IBlock[], wrongBlocks: IBlock[]}{
        return {
            status: this.chain.wrongBlocks.length === 0 ? Status.Ok : Status.WrongBlock, 
            blocks: this.chain.blocks, 
            wrongBlocks: this.chain.wrongBlocks
        }
    }

    async getTmpBlocks(): Promise<Block>  {
        if (!this.tmpBlock) {
            await this.loadTmpBlock()
        }
        if (!this.tmpBlock) {
            throw new Error("Temporary block is not loaded");
        }
        return this.tmpBlock;
    }

    async addTransactions(tran: Transaction): Promise<{status : Status, trans : Transaction | null}> {
        if (this.tmpBlock === undefined) {
            return {status: Status.NotExistTempBlock, trans: null}
        }
        if (this.chain.wrongBlocks.length !== 0) {
            return {status: Status.WrongBlock, trans: null}
        }
        this.tmpBlock.addTransaction(tran)
        await this.saveTmpBlock();
        return {status: Status.Ok, trans: tran}
    }

    async addBlock(block: Block): Promise<{status : Status, block : Block | null}> {

        if (this.tmpBlock === undefined) {
            return {status: Status.NotExistTempBlock, block: null}
        }
        if (this.tmpBlock.transactions.length < 4 ) {
            return {status: Status.NotEnoughTrans, block: null}
        }
        if (!this.currentBlock) {
            return {status: Status.NotExistCurrentBlock, block: null}
        }
        if (this.chain.wrongBlocks.length !== 0) {
            return {status: Status.WrongBlock, block: null}
        }

        block.setBlockHash(this.currentBlock)
        this.tmpBlock.createdDate = block.createdDate;
        this.tmpBlock.setBlockHash(this.currentBlock)
   
        if (!block.isValidChain(this.currentBlock?.blockHash, true)
            || !this.tmpBlock?.isValidChain(this.currentBlock?.blockHash, true)
        ) {
            return {status: Status.CanNotAddBlock, block: null}
        }

        const nBlock = new Block(this.chain.nextBlockNumber)
        block.transactions.forEach(v => nBlock.addTransaction(v))
        nBlock.setBlockHash(this.currentBlock)
        this.chain.acceptBlock(nBlock)
        this.chain.verifyChain()

        this.tmpBlock = new Block(this.chain.nextBlockNumber)
        this.currentBlock = nBlock

        await this.saveDatabase()
        await this.saveTmpBlock()
        
        return {status: Status.Ok, block: nBlock}
        
    }
}

export default DatabaseSingleton.getInstance();
