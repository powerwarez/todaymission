import { redirect } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/server";

export async function loader() {
  // 서버 사이드에서는 바로 대시보드로 리디렉션
  return {};
}

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // OAuth 콜백 처리
    const handleAuthCallback = async () => {
      try {
        // URL 해시에서 데이터 추출
        const hashParams = window.location.hash
          ? new URLSearchParams(window.location.hash.substring(1))
          : new URLSearchParams(window.location.search);

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const errorMsg = hashParams.get("error_description");

        // 오류 있는지 확인
        if (errorMsg) {
          console.error("인증 오류:", decodeURIComponent(errorMsg));
          setError(decodeURIComponent(errorMsg));
          setTimeout(() => {
            window.location.href = "/login#error_description=" + errorMsg;
          }, 2000);
          return;
        }

        if (accessToken) {
          // 액세스 토큰이 있으면 세션 설정 시도
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            console.error("세션 설정 오류:", error.message);
            setError(error.message);
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            return;
          }

          if (data.session) {
            // 세션 설정 성공, 대시보드로 리디렉션
            window.location.href = "/dashboard";
            return;
          }
        }

        // 세션 확인
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          window.location.href = "/dashboard";
          return;
        }

        // 인증 정보가 없는 경우 로그인 페이지로 리디렉션
        console.error("인증 정보를 찾을 수 없습니다.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } catch (err) {
        console.error("콜백 처리 중 오류:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <div className="text-red-500 mb-2 font-semibold">인증 오류</div>
            <div className="text-gray-700 mb-4">{error}</div>
            <div className="text-gray-500 text-sm">
              로그인 페이지로 이동 중...
            </div>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">로그인 처리 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}
