import { configureStore } from '@reduxjs/toolkit';
import { injectStore } from '../utils/api'; 
import { adminAuthReducer } from '../Redux/authSlice';
import { kycAdminReducer } from '../Redux/kycSlice';


const store = configureStore({
  reducer: {
    auth: adminAuthReducer,
    adminKyc: kycAdminReducer,

  },
});

injectStore(store);

export default store;