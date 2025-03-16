import { Request, Response } from 'express';
import { createBlockService, createTransactionService, getAllBlocksService, getTmpBlocksService } from '../services';
import { stringify, parse} from "flatted";



export const blockController = {
    createBlock: async (req: Request, res: Response) => {
        const result = await createBlockService(req.body)
        res.json(result);
    },
    getAllBlocks: async (req: Request, res: Response) => {
        const result = await getAllBlocksService();
        res.json(result);
    },
    getTmpBlocks: async (req: Request, res: Response) => {
        const result = await getTmpBlocksService();

        res.json(result);
    },
    createTransaction: async (req: Request, res: Response) => {
        const result = await createTransactionService(req.body);
        res.json(result);
    },
};
