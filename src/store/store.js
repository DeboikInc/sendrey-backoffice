import { configureStore } from '@reduxjs/toolkit';
import authReducer, { injectStore as injectAuthStore } from '../Redux/authSlice';
import adminKycReducer, {injectStore as injectKycStore} from '../Redux/kycSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    adminKyc: adminKycReducer,

  },
});

// Inject the store so the axios interceptor can access it
injectAuthStore(store);
injectKycStore(store);

export default store;