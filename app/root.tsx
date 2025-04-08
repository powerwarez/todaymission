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
import { getServerClient } from "./lib/server";
import { createSupabaseBrowserClient } from "./lib/createSupabaseBrowserClient";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

import { ThemeProvider } from './lib/theme-context';
import type { Route } from "./+types/root";
import "./app.css";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
} | null;

type LoaderData = {
  env: Env;
  session: Session | null;
};

export const loader = async ({ request }: { request: Request }) => {
  console.log("ROOT LOADER: Received request", { url: request.url });
  let env: Env = null;
  let session: Session | null = null;
  let headers = new Headers();
  let status = 500;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("ROOT LOADER: Error - Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)");
      throw new Error("Missing Supabase environment variables");
    }
    env = { SUPABASE_URL: supabaseUrl, SUPABASE_ANON_KEY: supabaseAnonKey };
    console.log("ROOT LOADER: Environment variables loaded");

    const { supabase: serverSupabase, headers: clientHeaders } = getServerClient(request);
    headers = clientHeaders;
    console.log("ROOT LOADER: Server client created, fetching session...");

    if (!serverSupabase) {
      console.error("ROOT LOADER: Failed to create server Supabase client (likely missing env vars in getServerClient)");
      throw new Error("Failed to create server Supabase client");
    }

    const { data, error: sessionError } = await serverSupabase.auth.getSession();

    if (sessionError) {
      console.error("ROOT LOADER: Error fetching session:", sessionError);
      status = 200;
    } else {
      session = data.session;
      status = 200;
      console.log("ROOT LOADER: Session fetched successfully", { hasSession: !!session });
    }

  } catch (err) {
    console.error("ROOT LOADER: Critical error in loader:", err);
    status = 500;
  }

  const loaderData: LoaderData = { env, session };

  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json');

  console.log(`ROOT LOADER: Returning response with status ${status}`);
  return new Response(JSON.stringify(loaderData), {
    status: status,
    headers: responseHeaders,
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
  const env = loaderData?.env ?? null;
  const session = loaderData?.session ?? null;
  const revalidator = useRevalidator();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (env && env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      console.log("Layout Effect: Env found, creating browser client");
      const browserClient = createSupabaseBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      setSupabase(browserClient);

      console.log("Layout Effect: Setting up auth state change listener");
      const { data: { subscription } } = browserClient.auth.onAuthStateChange((event, newSession) => {
        console.log("Layout Effect: Auth state changed", { event, hasNewSession: !!newSession, currentAccessToken: session?.access_token, newAccessToken: newSession?.access_token });
        if (newSession?.access_token !== session?.access_token) {
          console.log("Layout Effect: Access token changed, revalidating...");
          revalidator.revalidate();
        }
      });

      return () => {
        console.log("Layout Effect: Unsubscribing from auth state changes");
        subscription.unsubscribe();
      };
    } else {
      console.warn("Layout Effect: Supabase env variables not found or invalid in loader data.");
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
          <Outlet context={{ supabase }} />
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
  console.error("ErrorBoundary caught an error:", error);
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
    details = error.message.includes("environment variables") 
              ? "Server configuration error: Missing Supabase credentials." 
              : error.message;
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
