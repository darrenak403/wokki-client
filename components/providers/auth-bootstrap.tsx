"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchMeAsync,
  logout,
  selectAuthToken,
  selectIsAuthenticated,
  selectUser,
} from "@/lib/redux/slices/authSlice";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || user || attempted.current) return;
    attempted.current = true;

    dispatch(fetchMeAsync())
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
