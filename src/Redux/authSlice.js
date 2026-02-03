import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const api = axios.create({
    baseURL: "http://localhost:4000/api/v1/auth",
    // baseURL: "https://sendrey-server-api.onrender.com/api/v1/auth",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true,
});

let store;
export const injectStore = (_store) => {
    store = _store;
};

api.interceptors.request.use((config) => {
    const token = store?.getState()?.auth?.token;
    // console.log('Interceptor token check:', token ? 'Token found' : 'No token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const registerAdmin = createAsyncThunk(
    "auth/register-admin",
    async (data, thunkAPI) => {
        const { role, email, firstName, lastName, phone, password } = data;
        try {
            const endpoint = '/register-admin'
            const payload = {
                phone,
                password,
                email,
                role,
                firstName,
                lastName
            };
            console.log('Registration payload:', payload);

            const response = await api.post(endpoint, payload);
            console.log('Registration response:', response.data)
            return response.data.data;

        } catch (error) {
            if (error.response?.data?.errors) {
                const firstError = error.response.data.errors[0];
                return thunkAPI.rejectWithValue(firstError.message);
            }
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Something went wrong"
            );
        }
    }
);


export const loginAdmin = createAsyncThunk(
    "auth/login-admin",
    async (credentials, { rejectWithValue }) => {
        const { email, password } = credentials;
        try {
            const endpoint = '/admin/login'
            const payload = {
                email,
                password,
            };
            const response = await api.post(endpoint, payload);
            console.log('Login response:', response.data)
            return response.data.data || response.data;
        } catch (error) {
            if (error.response?.data?.errors) {
                const firstError = error.response.data.errors[0];
                return rejectWithValue(firstError.message);
            }
            return rejectWithValue(
                error.response?.data?.message || "Something went wrong"
            );
        }
    }
);


export const resetPassword = createAsyncThunk("auth/reset-password", async ({ token, newPassword }, thunkAPI) => {
    try {
        const response = await api.post("/reset-password", { token, newPassword })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(
            error.response?.data?.message || "something went wrong, try again later"
        )
    }
});

export const changePassword = createAsyncThunk("auth/change-password", async ({ currentPassword, newPassword }, thunkAPI) => {
    try {
        const response = await api.post("/change-password", { currentPassword, newPassword })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(
            error.response?.data?.message || "something went wrong, try again later"
        )
    }
});


const authSlice = createSlice({
    name: "auth",
    initialState: {
        status: "idle",
        error: "",
        user: null,
        token: null,
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerAdmin.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(registerAdmin.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(registerAdmin.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to register";
            })
            .addCase(loginAdmin.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to login";
            })

            .addCase(resetPassword.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Only update token if provided (resetPassword might return token)
                if (action.payload.token) {
                    state.token = action.payload.token;
                }
                state.user = action.payload.user;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Reset password failed";
            })

            .addCase(changePassword.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.status = "succeeded";

                if (action.payload.token) {
                    state.token = action.payload.token;
                }
                state.user = action.payload.user;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Change password failed";
            })
    },
});

export default authSlice.reducer;
export const { logout: logoutAction } = authSlice.actions;