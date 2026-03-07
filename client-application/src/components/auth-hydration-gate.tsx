import { useEffect, useState, type FC } from "react";
import { authRehydrated } from "@/stores/auth-store";

interface AuthHydrationGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthHydrationGate: FC<AuthHydrationGateProps> = ({
  children,
  fallback = null,
}) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authRehydrated.then(() => {
      if (!cancelled) setHydrated(true);
    });
    const t = setTimeout(() => {
      if (!cancelled) setHydrated(true);
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (!hydrated) return <>{fallback}</>;
  return <>{children}</>;
};
