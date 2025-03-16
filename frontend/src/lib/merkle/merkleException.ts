export class MerkleException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MerkleException";
    }
}
