"use client";

import { useEffect, useRef } from "react";
import { attachAccessToken } from "@/lib/support/auth/session-cookies";
import {
  hydrateUserFromTokenAsync,
  logout,
  selectAuthToken,
  selectUser,
} from "@/lib/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const user = useAppSelector(selectUser);
  const attempted = useRef(false);

  useEffect(() => {
    if (token) attachAccessToken(token);
  }, [token]);

  useEffect(() => {
    if (!token || user || attempted.current) return;
    attempted.current = true;

    dispatch(hydrateUserFromTokenAsync())
      .unwrap()
      .catch(() => {
        dispatch(logout());
      });
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!token) {
      attempted.current = false;
    }
  }, [token]);

  return <>{children}</>;
}
