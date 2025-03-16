import { MerkleHash } from "./merkleHash";

export class MerkleNode implements Iterable<MerkleNode> {
  hash!: MerkleHash;
  leftNode: MerkleNode | null = null;
  rightNode: MerkleNode | null = null;
  parent: MerkleNode | null = null;

  constructor(hashOrLeft?: MerkleHash | MerkleNode, right?: MerkleNode) {
    if (hashOrLeft instanceof MerkleHash) {
      this.hash = hashOrLeft;
    } else if (hashOrLeft instanceof MerkleNode) {
      this.leftNode = hashOrLeft;
      this.rightNode = right || null;
      this.leftNode.parent = this;
      if (this.rightNode) this.rightNode.parent = this;
      this.computeHash();
    } else {
      throw new Error("MerkleNode requires either a hash or child nodes.");
    }
  }

  get isLeaf(): boolean {
    return !this.leftNode && !this.rightNode;
  }

  computeHash(): void {
    if (this.leftNode) {
      this.hash = this.rightNode
        ? MerkleHash.createFromHashes(this.leftNode.hash, this.rightNode.hash)
        : this.leftNode.hash;
      this.parent?.computeHash();
    }
  }

  verifyHash(): boolean {
    if (!this.leftNode) return true;
    if (!this.rightNode) return this.hash.equals(this.leftNode.hash);
    return this.hash.equals(
      MerkleHash.createFromHashes(this.leftNode.hash, this.rightNode.hash)
    );
  }

  equals(node: MerkleNode): boolean {
    return this.hash.equals(node.hash);
  }

  *[Symbol.iterator](): Iterator<MerkleNode> {
    yield* this.iterate(this);
  }

  private *iterate(node: MerkleNode): Iterable<MerkleNode> {
    if (node.leftNode) yield* this.iterate(node.leftNode);
    if (node.rightNode) yield* this.iterate(node.rightNode);
    yield node;
  }

  leaves(): MerkleNode[] {
    return Array.from(this).filter((n) => n.isLeaf);
  }

  setLeftNode(node: MerkleNode): void {
    if (!node.hash) throw new Error("Node hash must be initialized.");
    this.leftNode = node;
    this.leftNode.parent = this;
    this.computeHash();
  }

  setRightNode(node: MerkleNode): void {
    if (!node.hash) throw new Error("Node hash must be initialized.");
    this.rightNode = node;
    this.rightNode.parent = this;
    if (this.leftNode) this.computeHash();
  }

  canVerifyHash(): boolean {
    return !!this.leftNode;
  }
}
