import { redirect } from "react-router";
import { supabase } from "../lib/server";
import { setSessionFromHash } from "../lib/auth";
import { getBrowserClient } from "../lib/browser-client";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<string>("초기화 중");

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!window.location.hash) {
        setError("인증 응답이 없습니다.");
        return;
      }

      setProcessingState("인증 응답 처리 중");
      console.log(
        "Auth hash detected:",
        window.location.hash.substring(0, 20) + "..."
      );

      try {
        // 브라우저 기반 클라이언트 사용
        const browserClient = getBrowserClient();

        // URL 해시에 포함된 파라미터 추출
        setProcessingState("URL 해시 파라미터 추출 중");
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");

        if (!accessToken) {
          setError("URL에서 액세스 토큰을 찾을 수 없습니다.");
          return;
        }

        // 브라우저 클라이언트를 사용하여 세션 설정
        setProcessingState("브라우저 세션 설정 중");
        const { data, error: sessionError } =
          await browserClient.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });

        if (sessionError) {
          console.error("브라우저 세션 설정 오류:", sessionError.message);

          // 서버 클라이언트로 다시 시도
          setProcessingState("서버 세션 설정 시도 중");
          const result = await setSessionFromHash(window.location.hash);

          if (!result.success) {
            setError(`세션 설정 실패: ${result.error}`);

            // 마지막 세션 확인 시도
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              window.location.href = "/dashboard";
              return;
            }

            // 모든 시도 실패 시 로그인으로 이동
            setTimeout(() => {
              window.location.href = "/login";
            }, 3000);
            return;
          }
        }

        // 세션 설정 성공 확인
        setProcessingState("세션 확인 중");
        const { data: sessionData } = await browserClient.auth.getSession();

        if (sessionData?.session) {
          console.log("Session confirmed, redirecting to dashboard");
          setProcessingState("인증 성공, 대시보드로 이동 중");

          // 세션 저장 확인을 위해 약간 지연 후 이동
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        } else {
          console.error("No session found after setting");
          setError("세션 설정은 성공했으나 세션을 찾을 수 없습니다.");

          // 로그인으로 리디렉션
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        setError(
          `예기치 않은 오류가 발생했습니다: ${
            err instanceof Error ? err.message : String(err)
          }`
        );

        // 오류 발생 시 로그인 페이지로 지연 이동
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    };

    // 페이지 로드 시 인증 콜백 처리 실행
    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-500 mb-2 font-semibold">오류 발생</div>
            <div className="text-gray-700 mb-4">{error}</div>
            <div className="text-gray-500 text-sm">
              잠시 후 로그인 페이지로 이동합니다...
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium mb-2">로그인 처리 중...</p>
            <p className="text-gray-500 text-sm">{processingState}</p>
          </div>
        )}
      </div>
    </div>
  );
}
