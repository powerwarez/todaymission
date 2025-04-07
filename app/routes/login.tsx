import { redirect } from "react-router";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/server";
import { getSession } from "../lib/auth";
import { useEffect, useState } from "react";

export async function loader() {
  const session = await getSession();

  if (session) {
    return redirect("/dashboard");
  }

  return {};
}

export default function Login() {
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드에서만 window 객체에 접근
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setRedirectUrl(`${window.location.origin}/dashboard`);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-100 to-primary-200 p-4">
      <div className="bg-white rounded-3xl p-8 shadow-soft max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">
            오늘의 미션
          </h1>
          <p className="text-gray-600">매일매일 습관을 만들어가요!</p>
        </div>

        {isClient && redirectUrl && (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#ec4899",
                    brandAccent: "#db2777",
                    inputBackground: "white",
                    inputText: "black",
                    inputBorder: "#f9a8d4",
                    inputBorderFocus: "#f472b6",
                    inputBorderHover: "#f472b6",
                  },
                },
              },
              style: {
                button: {
                  borderRadius: "9999px",
                  fontWeight: "600",
                },
                input: {
                  borderRadius: "9999px",
                },
                message: {
                  borderRadius: "16px",
                },
                container: {
                  fontFamily: "Nunito, sans-serif",
                },
              },
            }}
            providers={["kakao"]}
            redirectTo={redirectUrl}
          />
        )}
      </div>
    </div>
  );
}
