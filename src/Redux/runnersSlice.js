import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// 1. Get all runners
export const getRunners = createAsyncThunk('runners/getRunners', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/runners');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

// 2. Search runners
export const searchRunners = createAsyncThunk('runners/search', async (query, { rejectWithValue }) => {
    try {
        const response = await api.get(`/runners/search?q=${query}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

// 3. Get runner statistics (for the cards at the top of the page)
export const getRunnerStats = createAsyncThunk('runners/getStats', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/runners/stats');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

// 4. Update runner status (Suspend/Activate)
export const updateRunnerStatus = createAsyncThunk(
    'runners/updateStatus',
    async ({ runnerId, status }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/runners/${runnerId}/status`, { status });
            return response.data; // Assuming this returns the updated runner object
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

// 5. Delete a runner
export const deleteRunner = createAsyncThunk('runners/delete', async (runnerId, { rejectWithValue }) => {
    try {
        await api.delete(`/runners/${runnerId}`);
        return runnerId; // Return the ID to remove it from the state
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const runnersSlice = createSlice({
    name: 'runners',
    initialState: {
        list: [],
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
            // Fetch All
            .addCase(getRunners.pending, (state) => { state.loading = true; })
            .addCase(getRunners.fulfilled, (state, action) => {
                console.log("getRunners Payload check",action.payload)
                state.loading = false;
                state.list = action.payload.runners ?? action.payload;
            })
            .addCase(getRunners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Search
            .addCase(searchRunners.fulfilled, (state, action) => {
                state.list = action.payload.runners ?? action.payload;
            })
            // Stats
            .addCase(getRunnerStats.fulfilled, (state, action) => {
                state.stats = action.payload.stats ?? action.payload;
            })
            // Update Status
            .addCase(updateRunnerStatus.fulfilled, (state, action) => {
                const updated = action.payload.runner ?? action.payload;
                const index = state.list.findIndex(r => r._id === updated._id);
                if (index !== -1) state.list[index] = updated;
            })
            // Delete
            .addCase(deleteRunner.fulfilled, (state, action) => {
                state.list = state.list.filter(r => r._id !== action.payload);
            });
    }
});

export const { clearRunnersError } = runnersSlice.actions;
export default runnersSlice.reducer;