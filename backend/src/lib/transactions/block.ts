import { HashData } from "../blockchain";
import { MerkleHash, MerkleNode, MerkleTree } from "../merkle";
import { ClaimType, ITransaction, Transaction } from "./transaction";

export interface IBlock {
    transactions: ITransaction[];
    blockNumber: number;
    createdDate: Date;
    blockHash: string;
    previousBlockHash?: string |null;
    nextBlock?: IBlock;
    merkleTree?: MerkleTree 

    addTransaction(transaction: ITransaction): void;
    calculateBlockHash(previousBlockHash: string): string;
    setBlockHash(parent: IBlock): void;
    isValidChain(prevBlockHash: string | null, verbose: boolean): boolean;
    removeMerkleTree(): void;
}

export class Block implements IBlock {
    transactions: ITransaction[] = [];
    blockNumber: number;
    createdDate: Date;
    blockHash: string = "";
    previousBlockHash: string | null = null;
    nextBlock?: IBlock;
    merkleTree?: MerkleTree = new MerkleTree();

    constructor(blockNumber: number) {
        this.blockNumber = blockNumber;
        this.createdDate = new Date();
    }

    static fromJSON(data: IBlock): Block {
        const block = new Block(data.blockNumber);
        
        block.transactions = data.transactions.map(tx => Transaction.fromJSON(tx));
        block.createdDate = new Date(data.createdDate);
        block.blockHash = data.blockHash;
        block.previousBlockHash = data.previousBlockHash ?? null;

        if (data.nextBlock) {
            block.nextBlock = Block.fromJSON(data.nextBlock);
        }

        return block;
    }

    
    addTransaction(transaction: ITransaction): void {
        this.transactions.push(transaction);
    }

    addCoinBaseTransaction(miner: string): void {
        const coinbaseTx = new Transaction(
            "COINBASE",
            6.25, 
            new Date(),
            miner,
            0,
            ClaimType.TotalLoss 
        );

        this.transactions.push(coinbaseTx);
        this.buildMerkleTree();
        this.blockHash = this.calculateBlockHash(this.previousBlockHash);
    }

    calculateBlockHash(previousBlockHash: string | null): string {
        const blockHeader = `${this.blockNumber}${this.createdDate.toISOString()}${previousBlockHash || ""}`;
        const combined = `${this.merkleTree?.rootNode}${blockHeader}`;
        return Buffer.from(HashData.computeHashSha256(Buffer.from(combined, "utf-8"))).toString("base64");
    }

    setBlockHash(parent: IBlock | null): void {
        if (parent) {
            this.previousBlockHash = parent.blockHash;
            parent.nextBlock = this;
        }

        this.buildMerkleTree();
        this.blockHash = this.calculateBlockHash(this.previousBlockHash);
    }

    private buildMerkleTree(): void {
        this.merkleTree = new MerkleTree();
        this.transactions.forEach(txn => {
            const merkleHash = MerkleHash.create(txn.calculateTransactionHash());
            const merkleNode = new MerkleNode(merkleHash);
            this.merkleTree?.appendLeaf(merkleNode);
        });
        this.merkleTree.buildTree();
    }

    isValidChain(prevBlockHash: string | null, verbose: boolean): boolean {
        this.buildMerkleTree();
        const newBlockHash = this.calculateBlockHash(prevBlockHash);
        const isValid = newBlockHash === this.blockHash && this.previousBlockHash === prevBlockHash;
        
        if (verbose) {
            console.log(`Block Number ${this.blockNumber} : ${isValid ? "PASS" : "FAILED"} VERIFICATION`);
        }

        return this.nextBlock ? this.nextBlock.isValidChain(newBlockHash, verbose) : isValid;
    }

    removeMerkleTree(): void {
        this.merkleTree = undefined
        if (!this.nextBlock) {
            return
        }
        return this.nextBlock.removeMerkleTree()
    }
}