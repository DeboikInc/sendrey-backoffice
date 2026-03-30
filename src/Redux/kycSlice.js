import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

export const getPendingKYC = createAsyncThunk(
    "kycAdmin/getPending",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("/kyc/pending");
            console.log("Fetched pending KYC:", response.data);
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
            const response = await api.get("/kyc/verified-runners");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch verified runners"
            );
        }
    }
);

const updateRunner = (runners, runnerId, patch) =>
    runners.map(r => (r._id === runnerId || r.id === runnerId) ? { ...r, ...patch } : r);

const kycAdminSlice = createSlice({
    name: "kycAdmin",
    initialState: {
        status: "idle",
        error: "",
        pendingRunners: [],
        totalPending: 0,
        verifiedRunners: [],
        selectedRunner: null,
    },
    reducers: {
        clearSelectedRunner(state) {
            state.selectedRunner = null;
        },
    },
    extraReducers: (builder) => {
        const pending = (state) => { state.status = "loading"; state.error = ""; };
        const rejected = (state, action) => {
            state.status = "failed";
            state.error = action.payload || action.error?.message || "Something went wrong";
        };

        builder
            .addCase(getPendingKYC.pending, pending)
            .addCase(getPendingKYC.fulfilled, (state, action) => {
                console.log('payload in reducer:', action.payload);
                state.status = "succeeded";
                //const data = action.payload?.data || action.payload;
                state.pendingRunners = (action.payload.runners ?? []).map(r => ({
        ...r,
        _id: r._id || r.id,
    }));
                state.totalPending = state.pendingRunners.length;
                console.log('pendingRunners saved:', state.pendingRunners);
            })
            .addCase(getPendingKYC.rejected, rejected)

            .addCase(getRunnerKYCDetails.pending, pending)
            .addCase(getRunnerKYCDetails.fulfilled, (state, action) => {
                state.status = "succeeded";
                const runner = action.payload.runner ?? action.payload.data ?? action.payload;
                  state.selectedRunner = { ...runner, _id: runner._id || runner.id };
            })
            .addCase(getRunnerKYCDetails.rejected, rejected)

            .addCase(approveDocument.pending, pending)
            .addCase(approveDocument.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { runnerId } = action.payload;
                state.pendingRunners = updateRunner(state.pendingRunners, runnerId, { documentStatus: "approved" });
                if (state.selectedRunner?._id === runnerId || state.selectedRunner?.id === runnerId) {
                    state.selectedRunner = { ...state.selectedRunner, documentStatus: "approved" };
                }
            })
            .addCase(approveDocument.rejected, rejected)

            .addCase(rejectDocument.pending, pending)
            .addCase(rejectDocument.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { runnerId } = action.payload;
                state.pendingRunners = updateRunner(state.pendingRunners, runnerId, { documentStatus: "rejected" });
                if (state.selectedRunner?._id === runnerId || state.selectedRunner?.id === runnerId) {
                    state.selectedRunner = { ...state.selectedRunner, documentStatus: "rejected" };
                }
            })
            .addCase(rejectDocument.rejected, rejected)

            .addCase(approveSelfie.pending, pending)
            .addCase(approveSelfie.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { runnerId } = action.payload;
                state.pendingRunners = updateRunner(state.pendingRunners, runnerId, { selfieStatus: "approved" });
                if (state.selectedRunner?._id === runnerId || state.selectedRunner?.id === runnerId) {
                    state.selectedRunner = { ...state.selectedRunner, selfieStatus: "approved" };
                }
            })
            .addCase(approveSelfie.rejected, rejected)

            .addCase(rejectSelfie.pending, pending)
            .addCase(rejectSelfie.fulfilled, (state, action) => {
                state.status = "succeeded";
                const { runnerId } = action.payload;
                state.pendingRunners = updateRunner(state.pendingRunners, runnerId, { selfieStatus: "rejected" });
                if (state.selectedRunner?._id === runnerId || state.selectedRunner?.id === runnerId) {
                    state.selectedRunner = { ...state.selectedRunner, selfieStatus: "rejected" };
                }
            })
            .addCase(rejectSelfie.rejected, rejected)

            .addCase(getVerifiedRunners.pending, pending)
            .addCase(getVerifiedRunners.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.verifiedRunners = (action.payload.runners ?? []).map(r => ({
                ...r,
                _id: r._id || r.id,
            }));
            })
            .addCase(getVerifiedRunners.rejected, rejected)
            
    },
});

export const kycAdminReducer = kycAdminSlice.reducer;
export const { clearSelectedRunner } = kycAdminSlice.actions;