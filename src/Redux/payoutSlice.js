import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';;

export const getPayoutReceipts = createAsyncThunk('payout/fetchReceipts', async () => {
    const res = await api.get('/payouts/receipts');
    return res.data;
});

export const getPayoutStats = createAsyncThunk('payout/fetchStats', async () => {
    const res = await api.get('/payouts/stats');
    return res.data;
});

export const reviewReceipt = createAsyncThunk('payout/review', async ({ payoutId, receiptId, status }) => {
    const res = await api.patch(`/payouts/${payoutId}/receipt/${receiptId}`, { status });
    return res.data; // Expecting updated payout/receipt object
});

const payoutSlice = createSlice({
    name: 'payout',
    initialState: { receipts: [], stats: null, loading: false },
    extraReducers: (builder) => {
        builder
            .addCase(getPayoutReceipts.fulfilled, (state, action) => { state.receipts = action.payload; })
            .addCase(getPayoutStats.fulfilled, (state, action) => { state.stats = action.payload; })
            .addCase(reviewReceipt.fulfilled, (state, action) => {
                const index = state.receipts.findIndex(r => r.id === action.payload.id);
                if (index !== -1) state.receipts[index] = action.payload;
            });
    }
});

export default payoutSlice.reducer;