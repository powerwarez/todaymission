import { redirect } from "react-router";
import { supabase } from "../lib/server";
import { getSession } from "../lib/auth";
import { useEffect, useState } from "react";

export async function loader() {
  const session = await getSession();

  if (session) {
    return redirect("/dashboard");
  }

  // URL에서 오류 파라미터 확인 (OAuth 리디렉션 오류일 경우)
  const url = new URL(
    typeof window !== "undefined" ? window.location.href : "http://localhost"
  );
  const errorDescription = url.hash
    ? new URLSearchParams(url.hash.substring(1)).get("error_description")
    : null;

  return {
    error: errorDescription ? decodeURIComponent(errorDescription) : null,
  };
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL에서 오류 확인
  useEffect(() => {
    // 해시에서 오류 확인
    if (window.location.hash && window.location.hash.includes("error")) {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const errorMsg = hashParams.get("error_description");
        if (errorMsg) {
          setError(decodeURIComponent(errorMsg));
          // 오류 파라미터 제거를 위한 URL 수정
          window.history.replaceState(null, "", "/login");
        }
      } catch (err) {
        console.error("오류 파라미터 파싱 실패:", err);
      }
    }
  }, []);

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 현재 호스트 가져오기
      const host = window.location.origin;

      // auth/callback 리디렉션 URL 설정
      const redirectUrl = `${host}/auth/callback`;

      console.log("Kakao 로그인 시작, 리디렉션 URL:", redirectUrl);

      // Supabase OAuth 로그인 실행
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: redirectUrl,
          scopes: "profile_nickname,profile_image,account_email", // 필요한 스코프 추가
          queryParams: {
            // 카카오 로그인 추가 파라미터 설정
            prompt: "login", // 매번 로그인 화면 표시
          },
        },
      });

      if (signInError) {
        console.error("로그인 오류:", signInError.message);
        setError(`로그인을 시작할 수 없습니다: ${signInError.message}`);
        setIsLoading(false);
        return;
      }

      console.log("로그인 프로세스 시작됨, 리디렉션 대기 중...");
      // 성공적으로 호출되면 카카오 로그인 페이지로 리디렉션됨
      // 이 아래 코드는 실행되지 않음
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

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
            <p className="font-medium mb-1">로그인 중 오류가 발생했습니다</p>
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full bg-[#FEE500] border border-gray-300 text-[#3A1D1D] py-3 px-4 rounded-full font-semibold flex items-center justify-center shadow-sm hover:shadow-md transition-shadow disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 mr-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3A1D1D]"></div>
            </div>
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 4C7.58172 4 4 6.69624 4 10C4 11.8917 5.10154 13.5731 6.85125 14.6264L5.87045 18.2819C5.78958 18.5606 6.10792 18.7857 6.35526 18.6445L10.6139 16.1953C11.0661 16.2618 11.5275 16.2963 12 16.2963C16.4183 16.2963 20 13.6001 20 10.2963C20 6.99254 16.4183 4 12 4Z"
                fill="#3A1D1D"
              />
            </svg>
          )}
          <span>카카오계정으로 로그인</span>
        </button>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            로그인하면 서비스 이용약관과 개인정보처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
