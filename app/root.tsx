import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "react-router";
import { useEffect, useState } from "react";
import { createSupabaseServerClient } from "./lib/createSupabaseServerClient";
import { createSupabaseBrowserClient } from "./lib/createSupabaseBrowserClient";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

import { ThemeProvider } from './lib/theme-context';
import type { Route } from "./+types/root";
import "./app.css";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

type LoaderData = {
  env: Env;
  session: Session | null;
};

export const loader = async ({ request }: { request: Request }) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const response = new Response();
  const supabase = createSupabaseServerClient(request as any, response as any);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const loaderData: LoaderData = { env, session };

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('Content-Type', 'application/json');

  return new Response(JSON.stringify(loaderData), {
    status: 200,
    headers: responseHeaders
  });
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as LoaderData | undefined;
  const env = loaderData?.env;
  const session = loaderData?.session;
  const revalidator = useRevalidator();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (env) {
      const browserClient = createSupabaseBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      setSupabase(browserClient);

      const { data: { subscription } } = browserClient.auth.onAuthStateChange((event, newSession) => {
        if (newSession?.access_token !== session?.access_token) {
          console.log("Auth state changed on client, revalidating...");
          revalidator.revalidate();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      console.warn("Supabase env variables not found in loader data.");
    }
  }, [env, session, revalidator]);

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ec4899" />
        <Meta />
        <Links />
        <title>오늘의 미션</title>
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
