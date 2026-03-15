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
        return response.data; // Expecting updated dispute object
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const disputeSlice = createSlice({
    name: 'dispute',
    initialState: { list: [], currentDispute: null, loading: false },
    extraReducers: (builder) => {
        builder
            .addCase(getAllDisputes.fulfilled, (state, action) => { state.list = action.payload; })
            .addCase(getDispute.fulfilled, (state, action) => { state.currentDispute = action.payload; })
            .addCase(resolveDispute.fulfilled, (state, action) => {
                const index = state.list.findIndex(d => d.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            });
    }
});

export default disputeSlice.reducer;