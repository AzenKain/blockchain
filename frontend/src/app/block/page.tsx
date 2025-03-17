"use client";
import { createBlock, createTransaction, getAllBlocks, getTmpBlocks } from '@/lib/api';
import { CreateBlockDto, CreateTransactionDto } from '@/lib/api/dtos';
import { Block, BlockChain, IBlock, Transaction } from '@/lib/transactions';
import { AddABlock, AddATrans, AddListBlock, AddListTrans, AddWrongBlock } from '@/redux/features/block/block.redux';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Status } from '@/types';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const BlockchainDemo = () => {
  const dispatch = useAppDispatch()
  const listBlock = useAppSelector((state) => state.BlockRedux.listBlock);
  const listTrans = useAppSelector((state) => state.BlockRedux.listTrans);
  const [chain, setChain] = useState(new BlockChain());
  const [tmpBlock, setTmpBlock] = useState<Block | null>(null);
  const [studentCode, setStudentCode] = useState<string>("");
  const [subjectCode, setSubjectCode] = useState<string>("");
  const [mark, setMark] = useState<number | "">("");
  const [nMark, setNMark] = useState<number | "">("");
  const [displayBlock, setDisplayBlock] = useState<IBlock | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllBlocks()

      dispatch(AddListBlock(res.blocks))
      dispatch(AddWrongBlock(res.wrongBlocks))
      const tmpBlock: IBlock = await getTmpBlocks()
      setTmpBlock(Block.fromJSON(tmpBlock))
      dispatch(AddListTrans(tmpBlock.transactions))
    }
    fetchData();
  }, [dispatch])

  useEffect(() => {
    if (listBlock.length === 0) return;

    const newChain = new BlockChain();
    const clonedBlocks = listBlock.map(v => Block.fromJSON({ ...v }));
    for (let i = 0; i < clonedBlocks.length - 1; i++) {
      clonedBlocks[i].nextBlock = clonedBlocks[i + 1];
    }

    clonedBlocks.forEach(v => newChain.acceptBlock(v));
    newChain.verifyChain();

    setDisplayBlock(newChain.blocks[0]);
    setChain(newChain);

    if (tmpBlock == null) {
      setTmpBlock(new Block(newChain.nextBlockNumber));
    }
  }, [listBlock]);


  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handlerAddTransaction = async () => {
    if (!studentCode || !mark || !nMark) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newTransaction: CreateTransactionDto = {
      studentCode,
      mark: Number(mark),
      nMark: Number(nMark),
      timestamp: new Date(),
      subjectCode: subjectCode
    };

    const res = await createTransaction(newTransaction)
    if (res.status == Status.Ok && res.trans != null) {
      dispatch(AddATrans(res.trans))
      tmpBlock?.addTransaction(Transaction.fromJSON(res.trans))
      toast.success("Giao dịch thành công!");
    } else {
      toast.success("Giao dịch thất bại!");
    }

    // setstudentCode("");
    // setmark("");
    // setCarRegistration("");
    // setnMark("");
  };

  const handlerCreateBlock = async () => {
    if (listTrans.length < 4) {
      toast.error("Số lượng transaction không đủ!");
      return;
    }
    if (!tmpBlock) {
      toast.error("Tmp Block không tồn tại!");
      return;
    }

    tmpBlock.setBlockHash(chain.blocks[chain.blocks.length - 1])
    const trans = listTrans.map(tx => ({
      studentCode: tx.studentCode,
      mark: tx.mark,
      timestamp: tx.timestamp,
      nMark: tx.nMark,
      subjectCode: tx.subjectCode
    } as CreateTransactionDto))

    const newBlock: CreateBlockDto = {
      transactions: trans,
      blockNumber: tmpBlock.blockNumber,
      createdDate: new Date(),
      blockHash: tmpBlock.blockHash,
      previousBlockHash: tmpBlock.previousBlockHash,
    };

    const res = await createBlock(newBlock)
    if (res.status == Status.Ok && res.block != null) {
      dispatch(AddABlock(res.block))
      chain?.acceptBlock(Block.fromJSON(res.block))
      chain.verifyChain()
      dispatch(AddListTrans([]))
      setTmpBlock(new Block(chain.nextBlockNumber))
      toast.success("Tạo block thành công!");
    } else {
      toast.success("Tạo block thất bại!");
    }


  }


  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Demo Blockchain</h1>

      {/* Phần thêm transaction - ở trên cùng */}
      <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Thêm Transaction</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1">Student Code:</label>
            <input
              type="text"
              className="w-full p-1.5 text-sm border rounded"
              placeholder="VD: CL-2023-001"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Subject Code:</label>
            <input
              type="text"
              className="w-full p-1.5 text-sm border rounded"
              placeholder="VD: CS250"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Mark:</label>
            <input
              type="number"
              className="w-full p-1.5 text-sm border rounded"
              placeholder="VD: 5000000"
              value={mark}
              onChange={(e) =>
                setMark(e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">N Mark:</label>
            <input
              type="number"
              className="w-full p-1.5 text-sm border rounded"
              placeholder="VD: 15000"
              value={nMark}
              onChange={(e) =>
                setNMark(e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>
        </div>

        <button onClick={async () => await handlerAddTransaction()} className="mt-3 bg-blue-500 text-white py-1.5 px-4 rounded hover:bg-blue-600 text-sm font-medium">
          Thêm Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Phần danh sách transaction và add block - bên dưới trái */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Transactions Đang Chờ {tmpBlock ? tmpBlock.transactions.length : 0}</h2>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 min-h-64">
              {(!tmpBlock || tmpBlock.transactions.length == 0) ?? (
                <div className="text-center text-gray-500 py-2 text-sm">
                  Chưa có transaction nào đang chờ
                </div>
              )}

              {/* Mẫu transaction */}
              {tmpBlock?.transactions.map((trans, index) => (
                <ul key={trans.calculateTransactionHash() + index.toString()} className="text-sm">
                  <li className="mb-2 pb-2 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-medium break-all overflow-hidden">{trans.studentCode}</span>
                      <span className="break-all overflow-hidden">{trans.mark}</span>
                    </div>
                    <div className="text-xs text-gray-500 break-all overflow-hidden">
                      Hash: {trans.calculateTransactionHash()}
                    </div>
                  </li>
                </ul>
              ))}

            </div>

            <button
              className="mt-4 w-full py-2 px-4 rounded bg-amber-500 text-white btn text-sm"
              onClick={async () => await handlerCreateBlock()}
            >
              Tạo Block Mới
            </button>
          </div>
        </div>

        {/* Hiển thị blockchain - bên phải */}
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Blockchain</h2>
              <div className="px-3 py-1 rounded text-white bg-green-500 text-sm">
                Danh sách Blockchain
              </div>
            </div>

            {/* Hiển thị danh sách block */}
            <div className="flex flex-nowrap overflow-x-auto space-x-3 pb-4 mt-2">

              {chain.blocks.map((block, index) => (
                <div
                  onClick={() => setDisplayBlock(block)}
                  key={block.blockHash + index.toString()}
                  className="cursor-pointer min-w-48 p-3 rounded-lg border shadow flex-shrink-0 bg-white border-gray-200">
                  <div className="font-bold mb-1 text-sm">Block #{block.blockNumber} {block.blockNumber === 0 ? "(Genesis)" : ""}</div>
                  <div className="text-xs mb-2">
                    <div>Hash: {block.blockHash}</div>
                    <div>Prev: {block.previousBlockHash ? block.previousBlockHash : "N\A"}</div>
                    <div>Merkle: {block.getMerklehash()}</div>
                    <div>Date: {block.createdDate.toUTCString()}</div>
                    <div>Transactions: {block.transactions.length}</div>
                  </div>
                </div>
              ))}

            </div>

            <div className="flex justify-between items-center mt-4">
              <h2 className="text-xl font-semibold">Blockchain</h2>
              <div className="px-3 py-1 rounded text-white bg-red-500 text-sm">
                Danh sách Blockchain bị lỗi
              </div>
            </div>

            <div className="flex flex-nowrap overflow-x-auto space-x-3 pb-4 mt-2">

              {chain.wrongBlocks.map((block, index) => (
                <div
                  onClick={() => setDisplayBlock(block)}
                  key={block.blockHash + index.toString()}
                  className="cursor-pointer min-w-48 p-3 rounded-lg border shadow flex-shrink-0 bg-white border-gray-200">
                  <div className="font-bold mb-1 text-sm">Block #{block.blockNumber} {block.blockNumber === 0 ? "(Genesis)" : ""}</div>
                  <div className="text-xs mb-2">
                    <div>Hash: {block.blockHash}</div>
                    <div>Prev: {block.previousBlockHash ? block.previousBlockHash : "N\A"}</div>
                    <div>Merkle: {block.getMerklehash()}</div>
                    <div>Date: {block.createdDate.toUTCString()}</div>
                    <div>Transactions: {block.transactions.length}</div>
                  </div>
                </div>
              ))}

            </div>



            {/* Chi tiết của block được chọn */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium mb-2">Chi tiết Block #{displayBlock?.blockNumber} {displayBlock?.blockNumber === 0 ? "(Genesis)" : ""}</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="mb-1"><strong>Block Hash:</strong>
                    <div className="break-all overflow-hidden">{displayBlock?.blockHash}</div>
                  </div>
                  <div className="mb-1"><strong>Previous Hash:</strong>
                    <div className="break-all overflow-hidden">{displayBlock?.previousBlockHash ? displayBlock?.previousBlockHash : "N/A"}</div>
                  </div>
                  <div className="mb-1"><strong>Timestamp:</strong>
                    <div className="break-all overflow-hidden">{displayBlock?.createdDate.toUTCString()}</div>
                  </div>
                  <div className="mb-1"><strong>Merkle:</strong>
                    <span className="break-all overflow-hidden">{displayBlock?.getMerklehash()}</span>
                  </div>
                </div>


                <div className="mt-3">
                  <strong className="text-sm">Transactions:</strong>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {displayBlock?.transactions.map((txNum, index) => (
                      <div key={txNum.calculateTransactionHash() + index.toString()} className="bg-white border rounded p-2 text-sm">
                        <div className='break-all overflow-hidden'><strong >Student code #:</strong> {txNum.studentCode}</div>
                        <div className='break-all overflow-hidden'><strong>Mark:</strong> {txNum.mark}</div>
                        <div className='break-all overflow-hidden'><strong>NMark:</strong> {txNum.nMark}</div>
                        <div className='break-all overflow-hidden'><strong>Timestamp:</strong> {txNum.timestamp.toUTCString()}</div>
                        <div className="text-xs text-gray-500 break-all overflow-hidden">
                          <strong>Hash:</strong> {txNum.calculateTransactionHash()}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainDemo;