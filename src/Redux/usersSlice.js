import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const listUsers = createAsyncThunk('users/list', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const searchUsers = createAsyncThunk('users/search', async (query, { rejectWithValue }) => {
    try {
        const response = await api.get(`/api/admin/users/search?q=${query}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const getSingleUser = createAsyncThunk('users/getOne', async (userId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/api/admin/users/${userId}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const updateUserRole = createAsyncThunk('users/updateRole', async ({ userId, role }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/api/admin/users/${userId}/role`, { role });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const updateUserStatus = createAsyncThunk('users/updateStatus', async ({ userId, status }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/api/admin/users/${userId}/status`, { status });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const bulkUserAction = createAsyncThunk('users/bulkAction', async ({ userIds, action }, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/admin/users/bulk/action', { userIds, action });
        return { userIds, action, data: response.data };
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const deleteUser = createAsyncThunk('users/delete', async (userId, { rejectWithValue }) => {
    try {
        await api.delete(`/api/admin/users/${userId}`);
        return userId; 
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const exportUsers = createAsyncThunk('users/export', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/api/admin/users/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'users_export.csv');
        document.body.appendChild(link);
        link.click();
        return { success: true };
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const usersSlice = createSlice({
    name: 'users',
    initialState: {
        list: [],
        count: 0,
        selectedUser: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearSelectedUser: (state) => { state.selectedUser = null; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(listUsers.pending, (state) => { state.loading = true; })
            .addCase(listUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.users;   
                state.count = action.payload.count;
            })
            .addCase(listUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.list = action.payload.users;  
            })
            .addCase(getSingleUser.fulfilled, (state, action) => {
                state.selectedUser = action.payload.user; 
            })
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                
                const updated = action.payload.user;  
                
                const index = state.list.findIndex(u => u._id === updated._id);
                if (index !== -1) state.list[index] = updated;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                
                state.list = state.list.filter(u => u._id !== action.payload);
            });
    }
});

export const { clearSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;