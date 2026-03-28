import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const getSuggestions = createAsyncThunk('business/suggestions', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/business/suggestions');
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data);
    }
});

export const getBusinessStats = createAsyncThunk('business/stats', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/business/suggestions/stats');
        return res.data; 
    } catch (err) {
        return rejectWithValue(err.response?.data);
    }
});

export const getBusinessAccounts = createAsyncThunk('business/accounts', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/business/accounts');
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data);
    }
});

export const convertToBusiness = createAsyncThunk('business/convert', async (userId, { rejectWithValue }) => {
    try {
        const res = await api.patch(`/business/accounts/${userId}/convert`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data);
    }
});

export const revokeBusiness = createAsyncThunk('business/revoke', async (userId, { rejectWithValue }) => {
    try {
        const res = await api.patch(`/business/accounts/${userId}/revoke`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data);
    }
});

const businessSlice = createSlice({
    name: 'business',
    initialState: {
        suggestions: [],
        accounts: [],
        stats: null,
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSuggestions.fulfilled, (state, action) => {
                state.suggestions = action.payload.suggestions; // ✅ unwrap { suggestions: [], count: 0 }
            })
            .addCase(getBusinessAccounts.fulfilled, (state, action) => {
                state.accounts = action.payload.accounts; // ✅ unwrap { accounts: [], count: 0 }
            })
            .addCase(getBusinessStats.fulfilled, (state, action) => {
                state.stats = action.payload.stats ?? action.payload; // ✅ unwrap if nested, fallback to direct
            })
            .addCase(convertToBusiness.fulfilled, (state, action) => {
                const converted = action.payload.account ?? action.payload; 
                state.suggestions = state.suggestions.filter(s => s._id !== converted._id);
                state.accounts.push(converted);
            })
            .addCase(revokeBusiness.fulfilled, (state, action) => {
                // ✅ Remove from accounts when revoked; update in-place
                const updated = action.payload.account ?? action.payload; 
                const index = state.accounts.findIndex(a => a._id === updated._id);
                if (index !== -1) state.accounts.splice(index, 1);
            });
    }
});

export default businessSlice.reducer;