import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getSubscriptions = createAsyncThunk('subscriptions/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await axios.get('/api/subscriptions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const addSubscription = createAsyncThunk('subscriptions/add', async (data, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await axios.post('/api/subscriptions', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateSubscription = createAsyncThunk('subscriptions/update', async ({ id, data }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await axios.put(`/api/subscriptions/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteSubscription = createAsyncThunk('subscriptions/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await axios.delete(`/api/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState: {
    subscriptions: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: ''
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubscriptions.pending, (state) => { state.isLoading = true; })
      .addCase(getSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscriptions = action.payload;
      })
      .addCase(getSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addSubscription.fulfilled, (state, action) => {
        state.subscriptions.push(action.payload);
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.subscriptions = state.subscriptions.filter(sub => sub._id !== action.payload.id);
      });
  }
});

export const { reset } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
