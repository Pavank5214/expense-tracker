import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';
import lendingReducer from './slices/lendingSlice';
import subscriptionReducer from './slices/subscriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    lending: lendingReducer,
    subscriptions: subscriptionReducer,
  },
});
