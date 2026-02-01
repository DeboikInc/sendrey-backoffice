import { configureStore } from '@reduxjs/toolkit';
import authReducer, { injectStore as injectAuthStore } from '../Redux/authSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,

  },
});

// Inject the store so the axios interceptor can access it
injectAuthStore(store);

export default store;