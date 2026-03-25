import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const getAllDisputes = createAsyncThunk('dispute/list', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/disputes');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const getDispute = createAsyncThunk('dispute/getOne', async (orderId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/dispute/${orderId}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const resolveDispute = createAsyncThunk('dispute/resolve', async ({ disputeId, resolutionData }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/dispute/${disputeId}/resolve`, resolutionData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const disputeSlice = createSlice({
    name: 'dispute',
    initialState: {
        list: [],
        count: 0,
        currentDispute: null,
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllDisputes.pending, (state) => { state.loading = true; })
            .addCase(getAllDisputes.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.disputes;  // ✅ unwrap { disputes: [], count: 0 }
                state.count = action.payload.count;
            })
            .addCase(getAllDisputes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getDispute.fulfilled, (state, action) => {
                state.currentDispute = action.payload.dispute; // ✅ unwrap { dispute: {} }
            })
            .addCase(resolveDispute.fulfilled, (state, action) => {
                const updated = action.payload.dispute; // ✅ unwrap
                // ✅ MongoDB uses _id, not id
                const index = state.list.findIndex(d => d._id === updated._id);
                if (index !== -1) state.list[index] = updated;
            });
    }
});

export default disputeSlice.reducer;