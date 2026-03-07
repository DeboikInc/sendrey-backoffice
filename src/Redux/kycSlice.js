import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

export const getPendingKYC = createAsyncThunk(
    "kycAdmin/getPending",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("/kyc/pending");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch pending KYC"
            );
        }
    }
);

export const getRunnerKYCDetails = createAsyncThunk(
    "kycAdmin/getRunnerDetails",
    async (runnerId, thunkAPI) => {
        try {
            const response = await api.get(`/kyc/runner/${runnerId}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch runner details"
            );
        }
    }
);

export const approveDocument = createAsyncThunk(
    "kycAdmin/approveDocument",
    async ({ runnerId, ...body }, thunkAPI) => {
        try {
            const response = await api.post(`/kyc/approve-document/${runnerId}`, body);
            return { runnerId, ...response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to approve document"
            );
        }
    }
);

export const rejectDocument = createAsyncThunk(
    "kycAdmin/rejectDocument",
    async ({ runnerId, reason }, thunkAPI) => {
        try {
            const response = await api.post(`/kyc/reject-document/${runnerId}`, { reason });
            return { runnerId, ...response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to reject document"
            );
        }
    }
);

export const approveSelfie = createAsyncThunk(
    "kycAdmin/approveSelfie",
    async ({ runnerId, ...body }, thunkAPI) => {
        try {
            const response = await api.post(`/kyc/approve-selfie/${runnerId}`, body);
            return { runnerId, ...response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to approve selfie"
            );
        }
    }
);

export const rejectSelfie = createAsyncThunk(
    "kycAdmin/rejectSelfie",
    async ({ runnerId, reason }, thunkAPI) => {
        try {
            const response = await api.post(`/kyc/reject-selfie/${runnerId}`, { reason });
            return { runnerId, ...response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to reject selfie"
            );
        }
    }
);

export const getVerifiedRunners = createAsyncThunk(
    "kycAdmin/getVerifiedRunners",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("    /kyc/verified-runners");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch verified runners"
            );
        }
    }
);


const kycAdminSlice = createSlice({
    name: "kycAdmin",
    initialState: {
        status: "idle",
        error: "",
        pendingKYC: [],
        verifiedRunners: [],
        selectedRunner: null,
    },
    reducers: {
        clearSelectedRunner(state) {
            state.selectedRunner = null;
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
                state.pendingKYC = action.payload.data || action.payload;
            })
            .addCase(getPendingKYC.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Failed to fetch pending KYC";
            })

            .addCase(getRunnerKYCDetails.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(getRunnerKYCDetails.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.selectedRunner = action.payload.data || action.payload;
            })
            .addCase(getRunnerKYCDetails.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Failed to fetch runner details";
            })

            .addCase(approveDocument.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(approveDocument.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { runnerId } = action.payload;
                state.pendingKYC = state.pendingKYC.map(r =>
                    (r._id === runnerId || r.id === runnerId)
                        ? { ...r, documentStatus: "approved" }
                        : r
                );
                if (state.selectedRunner?._id === runnerId || state.selectedRunner?.id === runnerId) {
                    state.selectedRunner = { ...state.selectedRunner, documentStatus: "approved" };
                }
            })
            .addCase(approveDocument.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Failed to approve document";
            })

            .addCase(rejectDocument.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(rejectDocument.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { runnerId } = action.payload;
                state.pendingKYC = state.pendingKYC.map(r =>
                    (r._id === runnerId || r.id === runnerId)
                        ? { ...r, documentStatus: "rejected" }
                        : r
                );
                if (state.selectedRunner?._id === runnerId || state.selectedRunner?.id === runnerId) {
                    state.selectedRunner = { ...state.selectedRunner, documentStatus: "rejected" };
                }
            })
            .addCase(rejectDocument.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Failed to reject document";
            })

            .addCase(approveSelfie.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(approveSelfie.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { runnerId } = action.payload;
                state.pendingKYC = state.pendingKYC.map(r =>
                    (r._id === runnerId || r.id === runnerId)
                        ? { ...r, selfieStatus: "approved" }
                        : r
                );
                if (state.selectedRunner?._id === runnerId || state.selectedRunner?.id === runnerId) {
                    state.selectedRunner = { ...state.selectedRunner, selfieStatus: "approved" };
                }
            })
            .addCase(approveSelfie.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Failed to approve selfie";
            })

            .addCase(rejectSelfie.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(rejectSelfie.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { runnerId } = action.payload;
                state.pendingKYC = state.pendingKYC.map(r =>
                    (r._id === runnerId || r.id === runnerId)
                        ? { ...r, selfieStatus: "rejected" }
                        : r
                );
                if (state.selectedRunner?._id === runnerId || state.selectedRunner?.id === runnerId) {
                    state.selectedRunner = { ...state.selectedRunner, selfieStatus: "rejected" };
                }
            })
            .addCase(rejectSelfie.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Failed to reject selfie";
            })

            .addCase(getVerifiedRunners.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(getVerifiedRunners.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.verifiedRunners = action.payload.data || action.payload;
            })
            .addCase(getVerifiedRunners.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.error?.message || "Failed to fetch verified runners";
            });
    },
});

export const kycAdminReducer = kycAdminSlice.reducer;
export const { clearSelectedRunner } = kycAdminSlice.actions;