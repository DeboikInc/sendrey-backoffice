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

// get verified runners
export const getVerifiedRunners = createAsyncThunk(
    "kyc/admin/getVerifiedRunners",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/admin/verified-runners");
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch verified runners"
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

// helper function
const updateRunnerAndMoveIfVerified = (state, runnerId, updatedStatus) => {
    // Find runner in pendingRunners
    const pendingIndex = state.pendingRunners.findIndex(r => r.id === runnerId);

    if (pendingIndex !== -1) {
        const runner = state.pendingRunners[pendingIndex];

        // Update the runner's status
        runner.runnerStatus = updatedStatus;

        // Check if runner is fully approved
        const isFullyApproved = updatedStatus === 'approved_full' ||
            updatedStatus === 'approved_limited';

        if (isFullyApproved) {
            // Remove from pending and add to verified
            const [verifiedRunner] = state.pendingRunners.splice(pendingIndex, 1);
            state.verifiedRunners.push(verifiedRunner);
            state.totalPending = state.pendingRunners.length;
        }

        // Update selectedRunner if it's the same
        if (state.selectedRunner?.id === runnerId) {
            state.selectedRunner.runnerStatus = updatedStatus;
        }
    }
};

const adminKycSlice = createSlice({
    name: "adminKyc",
    initialState: {
        status: "idle",
        error: "",
        message: "",

        // Admin specific state
        pendingRunners: [],
        verifiedRunners: [],
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

                const { runnerId, updatedStatus } = action.payload.data;
                updateRunnerAndMoveIfVerified(state, runnerId, updatedStatus);
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

                const { runnerId, updatedStatus } = action.payload.data;
                updateRunnerAndMoveIfVerified(state, runnerId, updatedStatus);
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

                const { runnerId, updatedStatus } = action.payload.data;
                updateRunnerAndMoveIfVerified(state, runnerId, updatedStatus);
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

                const { runnerId, updatedStatus } = action.payload.data;
                updateRunnerAndMoveIfVerified(state, runnerId, updatedStatus);
            })
            .addCase(rejectSelfie.rejected, (state, action) => {
                state.actionStatus = "failed";
                state.actionError = action.payload;
            });


        builder
            .addCase(getVerifiedRunners.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(getVerifiedRunners.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.verifiedRunners = action.payload.data.runners || [];
            })
            .addCase(getVerifiedRunners.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const {
    clearMessages,
    clearSelectedRunner,
    resetActionStatus,
} = adminKycSlice.actions;

export default adminKycSlice.reducer;