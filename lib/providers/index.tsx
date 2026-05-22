"use client";

import { ReactNode } from "react";
import { ReduxProvider } from "./reduxProvider";
import { QueryProvider } from "./queryProvider";
import { AuthBootstrap } from "@/components/providers/auth-bootstrap";
import { useAuthSyncAcrossTabs } from "@/hooks/useAuthSyncAcrossTabs";

function AuthSyncProvider({ children }: { children: ReactNode }) {
  useAuthSyncAcrossTabs();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <AuthSyncProvider>
          <AuthBootstrap>{children}</AuthBootstrap>
        </AuthSyncProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
