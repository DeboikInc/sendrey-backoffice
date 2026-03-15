import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';;

// Suggestions & Stats
export const getSuggestions = createAsyncThunk('business/suggestions', async () => {
    const res = await api.get('/business/suggestions');
    return res.data;
});

export const getBusinessStats = createAsyncThunk('business/stats', async () => {
    const res = await api.get('/business/suggestions/stats');
    return res.data;
});

// Account Management
export const getBusinessAccounts = createAsyncThunk('business/accounts', async () => {
    const res = await api.get('/business/accounts');
    return res.data;
});

export const convertToBusiness = createAsyncThunk('business/convert', async (userId) => {
    const res = await api.patch(`/business/accounts/${userId}/convert`);
    return res.data;
});

export const revokeBusiness = createAsyncThunk('business/revoke', async (userId) => {
    const res = await api.patch(`/business/accounts/${userId}/revoke`);
    return res.data;
});

const businessSlice = createSlice({
    name: 'business',
    initialState: { suggestions: [], accounts: [], stats: null, loading: false },
    extraReducers: (builder) => {
        builder
            .addCase(getSuggestions.fulfilled, (state, action) => { state.suggestions = action.payload; })
            .addCase(getBusinessAccounts.fulfilled, (state, action) => { state.accounts = action.payload; })
            .addCase(getBusinessStats.fulfilled, (state, action) => { state.stats = action.payload; })
            .addCase(convertToBusiness.fulfilled, (state, action) => {
                // Remove from suggestions and add to accounts
                state.suggestions = state.suggestions.filter(s => s.userId !== action.payload.userId);
                state.accounts.push(action.payload);
            });
    }
});

export default businessSlice.reducer;