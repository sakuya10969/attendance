import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import type { Route } from "./+types/root";
import { AuthProvider } from "./shared/session/model/auth-provider";
import { queryClient } from "./shared/lib/query-client";
import "./app.css";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, monospace',
  defaultRadius: "sm",
  white: "#ffffff",
  black: "#212529",
  colors: {
    blue: [
      "#e7f0ff",
      "#ccdcff",
      "#99b8ff",
      "#6694ff",
      "#3370ff",
      "#2665fd",
      "#1a54d4",
      "#1243ab",
      "#0a3282",
      "#042159",
    ],
  },
  headings: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "700",
  },
  components: {
    Button: {
      defaultProps: { radius: "sm" },
      styles: { root: { fontWeight: 600 } },
    },
    TextInput: { defaultProps: { radius: "sm" } },
    PasswordInput: { defaultProps: { radius: "sm" } },
    Select: { defaultProps: { radius: "sm" } },
    DatePickerInput: { defaultProps: { radius: "sm" } },
    Textarea: { defaultProps: { radius: "sm" } },
    Card: {
      defaultProps: { radius: "md", withBorder: true, shadow: "none", padding: "lg" },
    },
    Table: {
      defaultProps: { striped: true, highlightOnHover: true, verticalSpacing: "sm" },
    },
    Badge: {
      defaultProps: { radius: "sm", variant: "light" },
    },
    Modal: {
      defaultProps: { radius: "md", centered: true },
    },
    Notification: {
      defaultProps: { radius: "sm" },
    },
    Pagination: {
      defaultProps: { radius: "sm" },
    },
    Menu: {
      defaultProps: { radius: "sm", shadow: "md" },
    },
    Tabs: {
      defaultProps: { radius: "sm" },
    },
  },
});

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript forceColorScheme="light" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Notifications position="top-right" />
          <Outlet />
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "エラーが発生しました";
  let details = "しばらくしてから再度お試しください。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "ページが見つかりませんでした。"
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 440 }}>
        <h1>{message}</h1>
        <p>{details}</p>
        {stack ? (
          <pre style={{ overflow: "auto", fontSize: 12 }}>
            <code>{stack}</code>
          </pre>
        ) : null}
      </div>
    </main>
  );
}
