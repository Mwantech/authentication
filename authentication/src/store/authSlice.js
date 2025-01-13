import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend server URL
  withCredentials: true, // Required for cookies/session
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  isRefreshing: false
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return rejectWithValue({ message });
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/refresh');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Token refresh failed';
      return rejectWithValue({ message });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/logout');
      return;
    } catch (error) {
      const message = error.response?.data?.message || 'Logout failed';
      return rejectWithValue({ message });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      localStorage.setItem('accessToken', payload.accessToken);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.error = null;
        localStorage.setItem('accessToken', payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || 'Login failed';
      })
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.isRefreshing = false;
        state.accessToken = payload.accessToken;
        state.error = null;
        localStorage.setItem('accessToken', payload.accessToken);
      })
      .addCase(refreshToken.rejected, (state, { payload }) => {
        state.isRefreshing = false;
        state.user = null;
        state.accessToken = null;
        state.error = payload?.message || 'Session expired';
        localStorage.removeItem('accessToken');
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.error = null;
        localStorage.removeItem('accessToken');
      })
      .addCase(logoutUser.rejected, (state, { payload }) => {
        state.error = payload?.message || 'Logout failed';
      });
  }
});

export const { setCredentials, clearCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;