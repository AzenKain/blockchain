
import { IBlock, ITransaction } from '@/lib/transactions';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


type InitialState = {
    listBlock: IBlock[];
    listTrans: ITransaction[];
}

const initialState: InitialState = {
    listBlock: [],
    listTrans: []
}

export const BlockRedux = createSlice({
    name: 'BlockRedux',
    initialState,
    reducers: {
        AddListBlock: (state, action: PayloadAction<IBlock[]>) => {
            state.listBlock = action.payload
        },
        AddABlock: (state, action: PayloadAction<IBlock>) => {
            state.listBlock.push(action.payload)
        },
        AddListTrans: (state, action: PayloadAction<ITransaction[]>) => {
            state.listTrans = action.payload
        },
        AddATrans: (state, action: PayloadAction<ITransaction>) => {
            state.listTrans.push(action.payload)
        },
    }
})

export const { AddListBlock, AddListTrans, AddATrans, AddABlock } = BlockRedux.actions;

export default BlockRedux.reducer;