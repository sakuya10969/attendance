import { Center, Loader } from "@mantine/core";
import { Navigate } from "react-router";

import { roleHomeMap } from "~/shared/auth/role";
import { useAuth } from "~/shared/auth/use-auth";

export default function IndexRoute() {
  const { appUser, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <Center mih="100vh">
        <Loader color="blue" />
      </Center>
    );
  }

  if (!isAuthenticated || !appUser) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHomeMap[appUser.role]} replace />;
}
