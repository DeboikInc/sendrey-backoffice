import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const api = axios.create({
    baseURL: "http://localhost:4000/api/v1/kyc",
    // baseURL: "https://sendrey-server-api.onrender.com/api/v1/kyc",
    withCredentials: true,
});

let store;
export const injectStore = (_store) => {
    store = _store;
};

api.interceptors.request.use((config) => {
    const token = store?.getState()?.auth?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Get all pending KYC verifications
export const getPendingKYC = createAsyncThunk(
    "kyc/admin/getPendingKYC",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/admin/pending");
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch pending KYC"
            );
        }
    }
);

// Get specific runner details
export const getRunnerDetails = createAsyncThunk(
    "kyc/admin/getRunnerDetails",
    async (runnerId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/runner/${runnerId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch runner details"
            );
        }
    }
);

// Approve document
export const approveDocument = createAsyncThunk(
    "kyc/admin/approveDocument",
    async ({ runnerId, documentType }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/approve-document/${runnerId}`, {
                documentType,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to approve document"
            );
        }
    }
);

// Reject document
export const rejectDocument = createAsyncThunk(
    "kyc/admin/rejectDocument",
    async ({ runnerId, documentType, reason }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/reject-document/${runnerId}`, {
                documentType,
                reason,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to reject document"
            );
        }
    }
);

// Approve selfie
export const approveSelfie = createAsyncThunk(
    "kyc/admin/approveSelfie",
    async (runnerId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/approve-selfie/${runnerId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to approve selfie"
            );
        }
    }
);

// Reject selfie
export const rejectSelfie = createAsyncThunk(
    "kyc/admin/rejectSelfie",
    async ({ runnerId, reason }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/reject-selfie/${runnerId}`, {
                reason,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to reject selfie"
            );
        }
    }
);

const kycSlice = createSlice({
    name: "kyc",
    initialState: {
        status: "idle", 
        error: "",
        message: "",
        
        // Admin specific state
        pendingRunners: [],
        selectedRunner: null,
        totalPending: 0,
        
        // Action tracking
        actionStatus: "idle", 
        actionError: "",
        actionMessage: "",
    },
    reducers: {
        clearMessages: (state) => {
            state.message = "";
            state.error = "";
            state.actionMessage = "";
            state.actionError = "";
        },
        clearSelectedRunner: (state) => {
            state.selectedRunner = null;
        },
        resetActionStatus: (state) => {
            state.actionStatus = "idle";
            state.actionError = "";
            state.actionMessage = "";
        },
    },
    extraReducers: (builder) => {

        builder
            .addCase(getPendingKYC.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(getPendingKYC.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.pendingRunners = action.payload.data.runners;
                state.totalPending = action.payload.data.total;
            })
            .addCase(getPendingKYC.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });


        builder
            .addCase(getRunnerDetails.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(getRunnerDetails.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.selectedRunner = action.payload.data;
            })
            .addCase(getRunnerDetails.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });

        builder
            .addCase(approveDocument.pending, (state) => {
                state.actionStatus = "loading";
                state.actionError = "";
                state.actionMessage = "";
            })
            .addCase(approveDocument.fulfilled, (state, action) => {
                state.actionStatus = "succeeded";
                state.actionMessage = action.payload.message;
                
                // Update selectedRunner if present
                if (state.selectedRunner) {
                    state.selectedRunner.runnerStatus = action.payload.data.runnerStatus;
                }
            })
            .addCase(approveDocument.rejected, (state, action) => {
                state.actionStatus = "failed";
                state.actionError = action.payload;
            });

        builder
            .addCase(rejectDocument.pending, (state) => {
                state.actionStatus = "loading";
                state.actionError = "";
                state.actionMessage = "";
            })
            .addCase(rejectDocument.fulfilled, (state, action) => {
                state.actionStatus = "succeeded";
                state.actionMessage = action.payload.message;
                
                // Update selectedRunner if present
                if (state.selectedRunner) {
                    state.selectedRunner.runnerStatus = action.payload.data.runnerStatus;
                }
            })
            .addCase(rejectDocument.rejected, (state, action) => {
                state.actionStatus = "failed";
                state.actionError = action.payload;
            });


        builder
            .addCase(approveSelfie.pending, (state) => {
                state.actionStatus = "loading";
                state.actionError = "";
                state.actionMessage = "";
            })
            .addCase(approveSelfie.fulfilled, (state, action) => {
                state.actionStatus = "succeeded";
                state.actionMessage = action.payload.message;
                
                // Update selectedRunner if present
                if (state.selectedRunner) {
                    state.selectedRunner.runnerStatus = action.payload.data.runnerStatus;
                    state.selectedRunner.isVerified = action.payload.data.isVerified;
                }
            })
            .addCase(approveSelfie.rejected, (state, action) => {
                state.actionStatus = "failed";
                state.actionError = action.payload;
            });

        builder
            .addCase(rejectSelfie.pending, (state) => {
                state.actionStatus = "loading";
                state.actionError = "";
                state.actionMessage = "";
            })
            .addCase(rejectSelfie.fulfilled, (state, action) => {
                state.actionStatus = "succeeded";
                state.actionMessage = action.payload.message;
                
                // Update selectedRunner if present
                if (state.selectedRunner) {
                    state.selectedRunner.runnerStatus = action.payload.data.runnerStatus;
                }
            })
            .addCase(rejectSelfie.rejected, (state, action) => {
                state.actionStatus = "failed";
                state.actionError = action.payload;
            });
    },
});

export const {
    clearMessages,
    clearSelectedRunner,
    resetActionStatus,
} = kycSlice.actions;

export default kycSlice.reducer;