import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const getRunners = createAsyncThunk('runners/getRunners', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/runners');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const searchRunners = createAsyncThunk('runners/search', async (query, { rejectWithValue }) => {
    try {
        const response = await api.get(`/runners/search?q=${query}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const getRunnerStats = createAsyncThunk('runners/getStats', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/runners/stats');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const updateRunnerStatus = createAsyncThunk(
    'runners/updateStatus',
    async ({ runnerId, status }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/runners/${runnerId}/status`, { status });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const deleteRunner = createAsyncThunk('runners/delete', async (runnerId, { rejectWithValue }) => {
    try {
        await api.delete(`/runners/${runnerId}`);
        return runnerId; // Raw ID returned manually — no unwrap needed
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const banRunner = createAsyncThunk(
    'runners/ban',
    async (runnerId, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/runners/${runnerId}/status`, { status: 'banned' });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const unbanRunner = createAsyncThunk(
    'runners/unban',
    async (runnerId, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/runners/${runnerId}/status`, { status: 'pending_verification' });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const resetStrikeCount = createAsyncThunk(
    'runners/resetStrikes',
    async (runnerId, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/runners/${runnerId}/reset-strikes`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const runnersSlice = createSlice({
    name: 'runners',
    initialState: {
        list: [],
        count: 0,
        stats: {
            total: 0,
            active: 0,
            suspended: 0
        },
        loading: false,
        error: null,
    },
    reducers: {
        clearRunnersError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRunners.pending, (state) => { state.loading = true; })
            .addCase(getRunners.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.runners;  // ✅ unwrap { runners: [], count: 0 }
                state.count = action.payload.count;
            })
            .addCase(getRunners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(searchRunners.fulfilled, (state, action) => {
                state.list = action.payload.runners;  // ✅ unwrap
            })
            .addCase(getRunnerStats.fulfilled, (state, action) => {
                state.stats = action.payload.stats ?? action.payload; // ✅ unwrap if nested, fallback to direct
            })
            .addCase(updateRunnerStatus.fulfilled, (state, action) => {
                const updated = action.payload.runner; // ✅ unwrap { runner: {} }
                // ✅ MongoDB uses _id, not id
                const index = state.list.findIndex(r => r._id === updated._id);
                if (index !== -1) state.list[index] = updated;
            })
            .addCase(deleteRunner.fulfilled, (state, action) => {
                // action.payload is the raw runnerId string — no unwrap needed
                // ✅ MongoDB uses _id, not id
                state.list = state.list.filter(r => r._id !== action.payload);
            })

            .addCase(banRunner.fulfilled, (state, action) => {
                const updated = action.payload.runner;
                const index = state.list.findIndex(r => r._id === updated._id);
                if (index !== -1) state.list[index] = updated;
            })
            .addCase(unbanRunner.fulfilled, (state, action) => {
                const updated = action.payload.runner;
                const index = state.list.findIndex(r => r._id === updated._id);
                if (index !== -1) state.list[index] = updated;
            })
            .addCase(resetStrikeCount.fulfilled, (state, action) => {
                const updated = action.payload.runner;
                const index = state.list.findIndex(r => r._id === updated._id);
                if (index !== -1) state.list[index] = updated;
            });
    }
});

export const { clearRunnersError } = runnersSlice.actions;
export default runnersSlice.reducer;