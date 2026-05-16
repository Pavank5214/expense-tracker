import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const LENDING_URL = '/api/lending/';

const initialState = {
  transactions: [],
  totalPages: 1,
  totalTransactions: 0,
  people: [],
  selectedPersonDetails: null, // For single user view
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

const getAuthAxios = (token) => axios.create({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getLendingTransactions = createAsyncThunk('lending/getTransactions', async (page = 1, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).get(`${LENDING_URL}?page=${page}&limit=10`);
    return { ...response.data, page };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getPeople = createAsyncThunk('lending/getPeople', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).get(LENDING_URL + 'people');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getPersonDetails = createAsyncThunk('lending/getPersonDetails', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).get(`${LENDING_URL}people/${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addPerson = createAsyncThunk('lending/addPerson', async (personData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).post(LENDING_URL + 'people', personData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addLendingTransaction = createAsyncThunk('lending/addTransaction', async (txData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).post(LENDING_URL, txData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateLendingTransaction = createAsyncThunk('lending/updateTransaction', async ({id, data}, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).put(`${LENDING_URL}${id}`, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteLendingTransaction = createAsyncThunk('lending/deleteTransaction', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).delete(`${LENDING_URL}${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updatePerson = createAsyncThunk('lending/updatePerson', async ({id, data}, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).put(`${LENDING_URL}people/${id}`, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deletePerson = createAsyncThunk('lending/deletePerson', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).delete(`${LENDING_URL}people/${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const lendingSlice = createSlice({
  name: 'lending',
  initialState,
  reducers: {
    resetLending: (state) => initialState,
    clearSelectedPerson: (state) => { state.selectedPersonDetails = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLendingTransactions.pending, (state) => { state.isLoading = true; })
      .addCase(getLendingTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.transactions = action.payload.transactions;
        } else {
          state.transactions = [...state.transactions, ...action.payload.transactions];
        }
        state.totalPages = action.payload.totalPages;
        state.totalTransactions = action.payload.total;
      })
      .addCase(getPeople.fulfilled, (state, action) => {
        state.people = action.payload;
      })
      .addCase(getPersonDetails.fulfilled, (state, action) => {
        state.selectedPersonDetails = action.payload;
      })
      .addCase(addPerson.fulfilled, (state, action) => {
        state.people.push(action.payload);
      })
      .addCase(addLendingTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })
      .addCase(updateLendingTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.map((tx) => 
          tx._id === action.payload._id ? action.payload : tx
        );
      })
      .addCase(deleteLendingTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter((tx) => tx._id !== action.payload.id);
      })
      .addCase(updatePerson.fulfilled, (state, action) => {
        state.people = state.people.map((p) => p._id === action.payload._id ? action.payload : p);
        if (state.selectedPersonDetails?.person?._id === action.payload._id) {
          state.selectedPersonDetails.person = action.payload;
        }
      })
      .addCase(deletePerson.fulfilled, (state, action) => {
        state.people = state.people.filter((p) => p._id !== action.payload.id);
        state.selectedPersonDetails = null;
      });
  },
});

export const { resetLending, clearSelectedPerson } = lendingSlice.actions;
export default lendingSlice.reducer;
