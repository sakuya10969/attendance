import { RequireAuth } from "~/shared/session/ui/require-auth";
import { AuthenticatedAppShell } from "~/widgets/app-shell/ui/authenticated-app-shell";

export default function ProtectedLayout() {
  return (
    <RequireAuth>
      <AuthenticatedAppShell />
    </RequireAuth>
  );
}
