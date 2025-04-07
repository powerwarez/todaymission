import { redirect } from "react-router";
import { supabase } from "../lib/server";
import { getSession } from "../lib/auth";
import { getBrowserClient } from "../lib/browser-client";
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
  const [error, setError] = useState<string | null>(null);

  // 클라이언트 사이드에서만 window 객체 접근
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      // 콜백 라우트로 리디렉션 설정
      setRedirectUrl(`${window.location.origin}/auth-callback`);
    }
    setIsLoading(false);
  }, []);

  const handlekakaoLogin = async () => {
    if (!redirectUrl) {
      setError(
        "리디렉션 URL이 설정되지 않았습니다. 페이지를 새로고침해 주세요."
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log("카카오 로그인 시도, 리디렉션 URL:", redirectUrl);

      // 브라우저 환경에서 Supabase 클라이언트 가져오기
      const browserClient = getBrowserClient();

      const { data, error: signInError } =
        await browserClient.auth.signInWithOAuth({
          provider: "kakao",
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: false, // 브라우저 리디렉션 확실히 적용
            queryParams: {
              // 카카오 로그인에 필요한 추가 파라미터 설정
              prompt: "login", // 매번 로그인 화면 표시 (선택적)
            },
          },
        });

      if (signInError) {
        console.error("로그인 시작 오류:", signInError.message);
        setError(`로그인을 시작할 수 없습니다: ${signInError.message}`);
        setIsLoading(false);
        return;
      }

      // signInWithOAuth는 리디렉션만 수행하므로 여기까지 코드가 실행되지 않을 수 있음
      console.log("카카오 인증 페이지로 리디렉션 중...");
    } catch (err) {
      console.error("로그인 처리 중 예외 발생:", err);
      setError(
        `로그인 처리 중 오류가 발생했습니다: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setIsLoading(false);
    }
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
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
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
