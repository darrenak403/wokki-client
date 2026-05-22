/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { setCookie, deleteCookie } from "cookies-next";
import apiService from "@/lib/api/core";
import { fetchAuth } from "@/lib/api/services/fetchAuth";
import { decodeJwtPayload, userFromToken } from "@/lib/auth/jwt-roles";
import { mapAuthError, mapAuthFailureMessage } from "@/lib/auth/map-auth-error";
import { getAuthCookieConfig } from "@/utils/cookieConfig";
import type { AuthUser, LoginRequest } from "@/types/auth";
import type { AppRole } from "@/lib/types/roles";
import type { RootState, AppDispatch } from "../store";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const setupAutoRefresh = (token: string, dispatch: AppDispatch) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return;

  const refreshTime = payload.exp * 1000 - Date.now() - 2 * 60 * 1000;

  if (refreshTime <= 0) {
    dispatch(refreshTokenAsync());
    return;
  }

  refreshTimer = setTimeout(() => dispatch(refreshTokenAsync()), refreshTime);
};

export const clearAutoRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

async function persistSession(accessToken: string, refreshToken: string) {
  setCookie("authToken", accessToken, getAuthCookieConfig());
  apiService.setAuthToken(accessToken);
  return { accessToken, refreshToken };
}

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetchAuth.login(credentials);

      if (!response.isSuccess || !response.data?.accessToken) {
        return rejectWithValue(mapAuthFailureMessage(response.message) || "Đăng nhập thất bại");
      }

      const { accessToken, refreshToken } = response.data;
      await persistSession(accessToken, refreshToken);

      const meResponse = await fetchAuth.getMe();
      if (!meResponse.isSuccess || !meResponse.data) {
        return rejectWithValue(
          mapAuthFailureMessage(meResponse.message) || "Không lấy được thông tin tài khoản"
        );
      }

      setupAutoRefresh(accessToken, dispatch as AppDispatch);

      return {
        token: accessToken,
        refreshToken,
        user: meResponse.data,
      };
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(error));
    }
  }
);

export const fetchMeAsync = createAsyncThunk(
  "auth/fetchMe",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      if (!state.auth.token) {
        return rejectWithValue("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const meResponse = await fetchAuth.getMe();
      if (!meResponse.isSuccess || !meResponse.data) {
        return rejectWithValue(
          mapAuthFailureMessage(meResponse.message) || "Không lấy được thông tin tài khoản"
        );
      }

      return meResponse.data;
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(error));
    }
  }
);

export const logoutAsync = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await fetchAuth.logout();
  } catch {
    // Still clear local session if API fails
  } finally {
    deleteCookie("authToken", { path: "/" });
    apiService.setAuthToken(null);
    clearAutoRefresh();
  }
  return true;
});

export const refreshTokenAsync = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const { refreshToken } = state.auth;
      if (!refreshToken) {
        return rejectWithValue("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const response = await fetchAuth.refreshToken({ refreshToken });

      if (!response.isSuccess || !response.data?.accessToken) {
        return rejectWithValue("Làm mới phiên thất bại");
      }

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      await persistSession(accessToken, newRefreshToken);

      let user: AuthUser | null = state.auth.user;
      try {
        const meResponse = await fetchAuth.getMe();
        if (meResponse.isSuccess && meResponse.data) {
          user = meResponse.data;
        }
      } catch {
        user = userFromToken(accessToken);
      }

      setupAutoRefresh(accessToken, dispatch as AppDispatch);

      return { token: accessToken, refreshToken: newRefreshToken, user };
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokenWithRefresh: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      apiService.setAuthToken(action.payload.accessToken);
      const user = userFromToken(action.payload.accessToken);
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      deleteCookie("authToken", { path: "/" });
      apiService.setAuthToken(null);
      clearAutoRefresh();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMeAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchMeAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });

    builder
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setTokenWithRefresh, logout, clearError } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const selectUserRole = (state: RootState): AppRole | null =>
  state.auth.user?.role ?? null;

export default authSlice.reducer;
