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
import {
  clearCachedOrganizationName,
  readCachedOrganizationName,
  writeCachedOrganizationName,
} from "@/lib/support/auth/org-name-storage";
import { clearCachedMyEmployeeId } from "@/lib/support/chat/my-employee-id";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";
import {
  isAppRole,
  isPlatformOperator,
  type AppRole,
  type SessionRole,
} from "@/lib/types/roles";
import type { RootState, AppDispatch } from "../store";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  organizationId: string | null;
  organizationName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  organizationId: null,
  organizationName: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function applySessionToState(
  state: AuthState,
  accessToken: string,
  refreshToken: string | null,
  user: AuthUser,
  organizationName?: string | null
) {
  state.token = accessToken;
  state.refreshToken = refreshToken;
  state.user = user;
  state.organizationId = user.organizationId ?? null;
  state.isAuthenticated = true;
  state.error = null;
  if (organizationName) {
    state.organizationName = organizationName;
  } else if (!state.organizationName) {
    state.organizationName = readCachedOrganizationName();
  }
}

function clearAuthState(state: AuthState) {
  state.user = null;
  state.token = null;
  state.refreshToken = null;
  state.organizationId = null;
  state.organizationName = null;
  state.isAuthenticated = false;
  state.error = null;
}

export const setupAutoRefresh = (token: string, dispatch: AppDispatch) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return;

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

      return { token: accessToken, refreshToken, user };
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(error));
    }
  }
);

export const registerAsync = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetchAuth.register(credentials);

      if (!response.success || !response.data?.accessToken) {
        return rejectWithValue(mapAuthResponseFailure(response) || "Đăng ký thất bại");
      }

      writeCachedOrganizationName(credentials.organizationName);

      const { accessToken, refreshToken } = response.data;
      const user = sessionUserFromAccessToken(accessToken);

      if (!user) {
        clearSessionCookies();
        return rejectWithValue("Token đăng ký không hợp lệ hoặc thiếu role.");
      }

      await persistSession(accessToken, refreshToken, user.role);
      setupAutoRefresh(accessToken, dispatch as AppDispatch);

      return {
        token: accessToken,
        refreshToken,
        user,
        organizationName: credentials.organizationName.trim(),
      };
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(error));
    }
  }
);

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

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  try {
    await fetchAuth.logout();
  } catch {
    // Still clear local session if API fails
  } finally {
    clearSessionCookies();
    clearAutoRefresh();
    clearCachedOrganizationName();
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
      attachAccessToken(action.payload.accessToken);
      const user = userFromToken(action.payload.accessToken);
      if (user) {
        applySessionToState(
          state,
          action.payload.accessToken,
          action.payload.refreshToken,
          user
        );
        syncRoleCookie(user.role);
      }
    },
    setOrganizationName: (state, action: PayloadAction<string>) => {
      state.organizationName = action.payload.trim();
      writeCachedOrganizationName(action.payload);
    },
    logout: (state) => {
      clearAuthState(state);
      clearSessionCookies();
      clearCachedMyEmployeeId();
      clearCachedOrganizationName();
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
        applySessionToState(
          state,
          action.payload.token,
          action.payload.refreshToken ?? null,
          action.payload.user
        );
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        applySessionToState(
          state,
          action.payload.token,
          action.payload.refreshToken ?? null,
          action.payload.user,
          action.payload.organizationName
        );
      })
      .addCase(registerAsync.rejected, (state, action) => {
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
        state.organizationId = action.payload.organizationId ?? null;
        state.isAuthenticated = true;
        state.error = null;
        if (!state.organizationName) {
          state.organizationName = readCachedOrganizationName();
        }
      })
      .addCase(hydrateUserFromTokenAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(logoutAsync.fulfilled, (state) => {
      clearAuthState(state);
      state.isLoading = false;
      clearCachedMyEmployeeId();
    });

    builder
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        applySessionToState(
          state,
          action.payload.token,
          action.payload.refreshToken,
          action.payload.user
        );
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        clearAuthState(state);
      });
  },
});

export const { setTokenWithRefresh, setOrganizationName, logout, clearError } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectOrganizationId = (state: RootState) => state.auth.organizationId;
export const selectOrganizationName = (state: RootState) => state.auth.organizationName;

export const selectUserRole = (state: RootState): SessionRole | null =>
  state.auth.user?.role ?? null;

export const selectAppRole = (state: RootState): AppRole | null => {
  const role = selectUserRole(state);
  return role && isAppRole(role) ? role : null;
};

export const selectIsPlatformOperator = (state: RootState): boolean =>
  isPlatformOperator(selectUserRole(state));

export const selectHasOrgContext = (state: RootState): boolean =>
  Boolean(state.auth.organizationId);

export default authSlice.reducer;
