import axios from 'axios';
import { CreateBlockDto, CreateTransactionDto } from './dtos';
import { IBlock } from '../transactions/block';
import { BlockServiceResponse, GetAllBlockServiceResponse, TransactionServiceResponse } from '@/types';

const API_BASE_URL = 'http://localhost:3434/api';

export const createBlock = async (blockData: CreateBlockDto) => {
  const res = await axios.post(`${API_BASE_URL}/block/create`, blockData);
  return res.data as BlockServiceResponse;
};

export const getAllBlocks = async () => {
  const res = await axios.get(`${API_BASE_URL}/block/get-all`);
  return res.data as GetAllBlockServiceResponse;
};
export const getTmpBlocks = async () => {
    const res = await axios.get(`${API_BASE_URL}/block/get-tmp-block`);
    return res.data as IBlock;
  };
export const createTransaction = async (transactionData: CreateTransactionDto) => {
  const res = await axios.post(`${API_BASE_URL}/transaction/create`, transactionData);
  return res.data as TransactionServiceResponse;
};
