import { MerkleException } from "./merkleException";
import { MerkleHash } from "./merkleHash";
import { MerkleNode } from "./merkleNode";
import { MerkleProofHash, Branch } from "./merkleProofHash";

export class MerkleTree {
    public rootNode: MerkleNode | null = null;
    protected nodes: MerkleNode[] = [];
    protected leaves: MerkleNode[] = [];

    static contract(action: () => boolean, msg: string): void {
        if (!action()) {
            throw new MerkleException(msg);
        }
    }

    appendLeaf(node: MerkleNode): MerkleNode {
        this.nodes.push(node);
        this.leaves.push(node);
        return node;
    }

    appendLeaves(nodes: MerkleNode[]): void {
        nodes.forEach(n => this.appendLeaf(n));
    }

    appendLeafFromHash(hash: MerkleHash): MerkleNode {
        const node = new MerkleNode(hash);
        this.nodes.push(node);
        this.leaves.push(node);
        return node;
    }

    appendLeavesFromHashes(hashes: MerkleHash[]): MerkleNode[] {
        return hashes.map(h => this.appendLeafFromHash(h));
    }

    addTree(tree: MerkleTree): MerkleHash {
        MerkleTree.contract(() => this.leaves.length > 0, "Cannot add to a tree with no leaves.");
        tree.leaves.forEach(l => this.appendLeaf(l));
        return this.buildTree();
    }

    public fixOddNumberLeaves(): void {
        if (this.leaves.length % 2 === 1) {
            const lastLeaf = this.leaves[this.leaves.length - 1];
            if (lastLeaf.hash) {
                this.appendLeafFromHash(lastLeaf.hash);
            }
        }
    }

    public buildTree(): MerkleHash {
        MerkleTree.contract(() => this.leaves.length > 0, "Cannot build a tree with no leaves.");
        this.buildTreeNodes(this.leaves);
        if (!this.rootNode) {
            throw new Error("Root node is not defined.");
        }
        return this.rootNode.hash;
    }

    auditProof(leafHash: MerkleHash): MerkleProofHash[] {
        const auditTrail: MerkleProofHash[] = [];
        const leafNode = this.findLeaf(leafHash);

        if (leafNode) {
            MerkleTree.contract(() => !!leafNode.parent, "Expected leaf to have a parent.");
            this.buildAuditTrail(auditTrail, leafNode.parent!, leafNode);
        }

        return auditTrail;
    }

    consistencyProof(m: number): MerkleProofHash[] {
        const hashNodes: MerkleProofHash[] = [];
        let idx = Math.floor(Math.log2(m));
        let node: MerkleNode = this.leaves[0];

        while (idx > 0) {
            node = node.parent!;
            --idx;
        }

        let k = node.leaves().length;
        hashNodes.push(new MerkleProofHash(node.hash, Branch.OldRoot));

        if (m !== k) {
            let sn = node.parent!.rightNode;

            while (true) {
                MerkleTree.contract(() => !!sn, "Sibling node must exist because m != k");
                const snCount = sn!.leaves().length;

                if (m - k === snCount) {
                    hashNodes.push(new MerkleProofHash(sn!.hash, Branch.OldRoot));
                    break;
                }

                if (m - k > snCount) {
                    hashNodes.push(new MerkleProofHash(sn!.hash, Branch.OldRoot));
                    sn = sn!.parent!.rightNode;
                    k += snCount;
                } else {
                    sn = sn!.leftNode;
                }
            }
        }
        return hashNodes;
    }

    consistencyAuditProof(nodeHash: MerkleHash): MerkleProofHash[] {
        const auditTrail: MerkleProofHash[] = [];
        const node = this.findNodeByHash(nodeHash);
        if (node) {
            this.buildAuditTrail(auditTrail, node.parent ?? null, node);
        }
        return auditTrail;
    }

    protected findNodeByHash(hash: MerkleHash): MerkleNode | undefined {
        return this.nodes.find(node => node.hash.equals(hash));
    }

    static computeHash(left: MerkleHash, right: MerkleHash): MerkleHash {
        return MerkleHash.create(Buffer.concat([left.value, right.value]));
    }

    static verifyAudit(rootHash: MerkleHash, leafHash: MerkleHash, auditTrail: MerkleProofHash[]): boolean {
        if (auditTrail.length === 0) throw new Error("Audit trail cannot be empty.");

        let testHash = leafHash;
        for (const auditHash of auditTrail) {
            testHash = auditHash.direction === Branch.Left
                ? MerkleHash.create(Buffer.concat([testHash.value, auditHash.hash.value]))
                : MerkleHash.create(Buffer.concat([auditHash.hash.value, testHash.value]));
        }

        return rootHash.equals(testHash);
    }

    static auditHashPairs(leafHash: MerkleHash, auditTrail: MerkleProofHash[]): [MerkleHash, MerkleHash][] {
        if (auditTrail.length === 0) throw new Error("Audit trail cannot be empty.");

        const auditPairs: [MerkleHash, MerkleHash][] = [];
        let testHash = leafHash;

        for (const auditHash of auditTrail) {
            if (auditHash.direction === Branch.Left) {
                auditPairs.push([testHash, auditHash.hash]);
                testHash = MerkleHash.create(Buffer.concat([testHash.value, auditHash.hash.value]));
            } else {
                auditPairs.push([auditHash.hash, testHash]);
                testHash = MerkleHash.create(Buffer.concat([auditHash.hash.value, testHash.value]));
            }
        }

        return auditPairs;
    }

    static verifyConsistency(oldRootHash: MerkleHash, proof: MerkleProofHash[]): boolean {
        let hash: MerkleHash;

        if (proof.length > 1) {
            let hidx = proof.length - 1;
            let lhash = proof[hidx - 1].hash;
            const rhash = proof[hidx].hash;
            hash = this.computeHash(lhash, rhash);
            hidx -= 2;

            while (hidx >= 0) {
                lhash = proof[hidx].hash;
                hash = this.computeHash(lhash, hash);
                hidx--;
            }
        } else {
            hash = proof[0].hash;
        }

        return hash.equals(oldRootHash);
    }

    protected buildAuditTrail(auditTrail: MerkleProofHash[], parent: MerkleNode | null, child: MerkleNode): void {
        if (parent) {
            if (child.parent !== parent) {
                throw new Error("Parent of child is not expected parent.");
            }
            const nextChild = parent.leftNode === child ? parent.rightNode : parent.leftNode;
            const direction = parent.leftNode === child ? Branch.Left : Branch.Right;

            if (nextChild) {
                auditTrail.push(new MerkleProofHash(nextChild.hash, direction));
            }
            this.buildAuditTrail(auditTrail, child.parent.parent, child.parent);
        }
    }

    protected findLeaf(leafHash: MerkleHash): MerkleNode | undefined {
        return this.leaves.find(l => l.hash.equals(leafHash));
    }

    protected buildTreeNodes(nodes: MerkleNode[]): void {
        if (nodes.length === 0) {
            throw new Error("Node list not expected to be empty.");
        }
        if (nodes.length === 1) {
            this.rootNode = nodes[0];
        } else {
            const parents: MerkleNode[] = [];

            for (let i = 0; i < nodes.length; i += 2) {
                const right = i + 1 < nodes.length ? nodes[i + 1] : null;
                const parent = this.createNode(nodes[i], right ?? undefined);
                parents.push(parent);
            }

            this.buildTreeNodes(parents);
        }
    }

    protected createNode(leftOrHash: MerkleNode | MerkleHash, right?: MerkleNode): MerkleNode {
        return new MerkleNode(leftOrHash, right);
    }
}