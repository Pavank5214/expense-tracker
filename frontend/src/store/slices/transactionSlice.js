import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const EXPENSE_URL = 'http://localhost:5000/api/expenses/';
const INCOME_URL = 'http://localhost:5000/api/income/';

const initialState = {
  expenses: [],
  expensePages: 1,
  expenseTotal: 0,
  incomes: [],
  incomePages: 1,
  incomeTotal: 0,
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

// Get expenses with pagination
export const getExpenses = createAsyncThunk('transactions/getExpenses', async (page = 1, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).get(`${EXPENSE_URL}?page=${page}&limit=10`);
    return { ...response.data, page };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Create expense
export const createExpense = createAsyncThunk('transactions/createExpense', async (expenseData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).post(EXPENSE_URL, expenseData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Get incomes with pagination
export const getIncomes = createAsyncThunk('transactions/getIncomes', async (page = 1, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).get(`${INCOME_URL}?page=${page}&limit=10`);
    return { ...response.data, page };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Create income
export const createIncome = createAsyncThunk('transactions/createIncome', async (incomeData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).post(INCOME_URL, incomeData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Delete expense
export const deleteExpense = createAsyncThunk('transactions/deleteExpense', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).delete(`${EXPENSE_URL}${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Update expense
export const updateExpense = createAsyncThunk('transactions/updateExpense', async ({id, data}, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).put(`${EXPENSE_URL}${id}`, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Delete income
export const deleteIncome = createAsyncThunk('transactions/deleteIncome', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).delete(`${INCOME_URL}${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Update income
export const updateIncome = createAsyncThunk('transactions/updateIncome', async ({id, data}, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await getAuthAxios(token).put(`${INCOME_URL}${id}`, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    resetTransactions: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExpenses.pending, (state) => { state.isLoading = true; })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.page === 1) {
          state.expenses = action.payload.expenses;
        } else {
          state.expenses = [...state.expenses, ...action.payload.expenses];
        }
        state.expensePages = action.payload.totalPages;
        state.expenseTotal = action.payload.total;
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((exp) => exp._id !== action.payload.id);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.map((exp) => 
          exp._id === action.payload._id ? action.payload : exp
        );
      })
      .addCase(getIncomes.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.incomes = action.payload.incomes;
        } else {
          state.incomes = [...state.incomes, ...action.payload.incomes];
        }
        state.incomePages = action.payload.totalPages;
        state.incomeTotal = action.payload.total;
      })
      .addCase(createIncome.fulfilled, (state, action) => {
        state.incomes.unshift(action.payload);
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.incomes = state.incomes.filter((inc) => inc._id !== action.payload.id);
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        state.incomes = state.incomes.map((inc) => 
          inc._id === action.payload._id ? action.payload : inc
        );
      });
  },
});

export const { resetTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;
