/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchAuth } from "@/lib/api/services/fetchAuth";
import { decodeJwtPayload, userFromToken } from "@/lib/support/auth/jwt-roles";
import { mapAuthError, mapAuthResponseFailure } from "@/lib/support/auth/map-auth-error";
import { sessionUserFromAccessToken } from "@/lib/support/auth/session-user";
import {
  attachAccessToken,
  clearSessionCookies,
  persistSession,
  syncRoleCookie,
} from "@/lib/support/auth/session-cookies";
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

  // Access token TTL 60 phút — refresh ~5 phút trước khi hết hạn (handoff §6)
  const refreshTime = payload.exp * 1000 - Date.now() - 5 * 60 * 1000;

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

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetchAuth.login(credentials);

      if (!response.success || !response.data?.accessToken) {
        return rejectWithValue(mapAuthResponseFailure(response) || "Đăng nhập thất bại");
      }

      const { accessToken, refreshToken } = response.data;
      const user = sessionUserFromAccessToken(accessToken);

      if (!user) {
        clearSessionCookies();
        return rejectWithValue("Token đăng nhập không hợp lệ hoặc thiếu role.");
      }

      await persistSession(accessToken, refreshToken, user.role);
      setupAutoRefresh(accessToken, dispatch as AppDispatch);

      return {
        token: accessToken,
        refreshToken,
        user,
      };
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(error));
    }
  }
);

/** Khôi phục user từ JWT đã lưu (rehydrate) — không gọi GET /auth/me. */
export const hydrateUserFromTokenAsync = createAsyncThunk(
  "auth/hydrateFromToken",
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) {
      return rejectWithValue("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    attachAccessToken(token);

    const user = sessionUserFromAccessToken(token);
    if (!user) {
      clearSessionCookies();
      return rejectWithValue("Token không hợp lệ hoặc đã hết hạn.");
    }

    syncRoleCookie(user.role);
    return user;
  }
);

export const logoutAsync = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await fetchAuth.logout();
  } catch {
    // Still clear local session if API fails
  } finally {
    clearSessionCookies();
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

      if (!response.success || !response.data?.accessToken) {
        return rejectWithValue(mapAuthResponseFailure(response) || "Làm mới phiên thất bại");
      }

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      const user = sessionUserFromAccessToken(accessToken) ?? state.auth.user;

      if (!user) {
        return rejectWithValue("Token làm mới không hợp lệ.");
      }

      await persistSession(accessToken, newRefreshToken, user.role);

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
      attachAccessToken(action.payload.accessToken);

      const user = userFromToken(action.payload.accessToken);
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
        syncRoleCookie(user.role);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearSessionCookies();
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
      .addCase(hydrateUserFromTokenAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(hydrateUserFromTokenAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(hydrateUserFromTokenAsync.rejected, (state, action) => {
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
