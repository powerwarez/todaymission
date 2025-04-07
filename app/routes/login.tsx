import { redirect } from "react-router";
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
  const [isLoading, setIsLoading] = useState(true);

  // 클라이언트 사이드에서만 window 객체 접근
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setRedirectUrl(`${window.location.origin}/dashboard`);
    }
    setIsLoading(false);
  }, []);

  const handlekakaoLogin = async () => {
    if (!redirectUrl) return;

    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-100 to-primary-200 p-4">
      <div className="bg-white rounded-3xl p-8 shadow-soft max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-2">오늘의 미션</h1>
          <p className="text-gray-600">매일매일 습관을 만들어가요!</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          isClient && (
            <div className="flex flex-col space-y-4">
              <button
                onClick={handlekakaoLogin}
                className="w-full bg-[#FEE500] border border-gray-300 text-[#3A1D1D] py-3 px-4 rounded-full font-semibold flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 4C7.58172 4 4 6.69624 4 10C4 11.8917 5.10154 13.5731 6.85125 14.6264L5.87045 18.2819C5.78958 18.5606 6.10792 18.7857 6.35526 18.6445L10.6139 16.1953C11.0661 16.2618 11.5275 16.2963 12 16.2963C16.4183 16.2963 20 13.6001 20 10.2963C20 6.99254 16.4183 4 12 4Z"
                    fill="#3A1D1D"
                  />
                </svg>
                <span>카카오계정으로 로그인</span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
