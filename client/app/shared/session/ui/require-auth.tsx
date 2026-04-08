import { Center, Loader } from "@mantine/core";
import { Navigate, useLocation } from "react-router";

import { canAccessPath, roleHomeMap } from "../model/role";
import type { AppRole } from "../model/types";
import { useAuth } from "../model/use-auth";

export function RequireAuth({
  roles,
  children,
}: {
  roles?: AppRole[];
  children?: React.ReactNode;
}) {
  const location = useLocation();
  const { appUser, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <Center mih="100vh">
        <Loader color="blue" />
      </Center>
    );
  }

  if (!isAuthenticated || !appUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(appUser.role)) {
    return <Navigate to={roleHomeMap[appUser.role]} replace />;
  }

  if (!canAccessPath(appUser.role, location.pathname)) {
    return <Navigate to={roleHomeMap[appUser.role]} replace />;
  }

  return <>{children}</>;
}
