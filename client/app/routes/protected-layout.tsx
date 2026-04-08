import { AuthenticatedAppShell } from "~/shared/components/app-shell";
import { RequireAuth } from "~/shared/components/guard";

export default function ProtectedLayout() {
  return (
    <RequireAuth>
      <AuthenticatedAppShell />
    </RequireAuth>
  );
}
