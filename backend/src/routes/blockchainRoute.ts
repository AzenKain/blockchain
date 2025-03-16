import { Router } from 'express';
import { validateDto } from '../middlewares';
import { CreateBlockDto, CreateTransactionDto } from '../dtos';
import { blockController } from '../controllers';

export const blockRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBlockDto:
 *       type: object
 *       required:
 *         - transactions
 *         - miner
 *         - blockNumber
 *         - createdDate
 *         - blockHash
 *       properties:
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateTransactionDto'
 *         miner:
 *           type: string
 *           example: "Miner123"
 *         blockNumber:
 *           type: integer
 *           example: 1
 *         createdDate:
 *           type: string
 *           format: date-time
 *           example: "2024-03-16T10:00:00Z"
 *         blockHash:
 *           type: string
 *           example: "abc123hash"
 *         previousBlockHash:
 *           type: string
 *           nullable: true
 *           example: "prevHash456"
 *
 *     CreateTransactionDto:
 *       type: object
 *       required:
 *         - claimNumber
 *         - settlementAmount
 *         - settlementDate
 *         - carRegistration
 *         - mileage
 *         - claimType
 *       properties:
 *         claimNumber:
 *           type: string
 *           example: "CLM123456"
 *         settlementAmount:
 *           type: number
 *           example: 5000
 *         settlementDate:
 *           type: string
 *           format: date-time
 *           example: "2024-03-16T10:00:00Z"
 *         carRegistration:
 *           type: string
 *           example: "ABC1234"
 *         mileage:
 *           type: integer
 *           example: 12000
 *         claimType:
 *           type: integer
 *           enum: [0]
 *           example: 0
 */

/**
 * @swagger
 * /api/block/create:
 *   post:
 *     summary: Create a new block
 *     description: Adds a block to the blockchain.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBlockDto'
 *     responses:
 *       200:
 *         description: Block created successfully
 *       400:
 *         description: Validation failed
 */
blockRouter.post('/block/create', validateDto(CreateBlockDto), blockController.createBlock);

/**
 * @swagger
 * /api/block/get-all:
 *   get:
 *     summary: Get all blocks
 *     description: Retrieves all blocks from the blockchain.
 *     responses:
 *       200:
 *         description: Successfully retrieved all blocks
 */
blockRouter.get('/block/get-all', blockController.getAllBlocks);


/**
 * @swagger
 * /api/block/get-tmp-block:
 *   get:
 *     summary: Get tmp blocks
 *     description: Retrieves tmp blocks from the blockchain.
 *     responses:
 *       200:
 *         description: Successfully retrieved tmp blocks
 */
blockRouter.get('/block/get-tmp-block', blockController.getTmpBlocks);
/**
 * @swagger
 * /api/transaction/create:
 *   post:
 *     summary: Create a transaction
 *     description: Adds a new transaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionDto'
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation failed
 */
blockRouter.post('/transaction/create', validateDto(CreateTransactionDto), blockController.createTransaction);
