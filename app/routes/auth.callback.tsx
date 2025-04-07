import { redirect } from "react-router";
import { supabase } from "../lib/server";
import { useEffect, useState } from "react";

// 서버 측의 리디렉션 로더
export async function loader() {
  // 서버 측에서는 단순히 클라이언트로 로직을 위임
  return { message: "Supabase OAuth 콜백 처리 중..." };
}

export default function AuthCallback() {
  const [status, setStatus] = useState("처리 중...");
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  // 세션이 성공적으로 설정되어 리디렉션이 진행 중인지 추적
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        setStatus("인증 정보 확인 중...");
        console.log("AUTH CALLBACK: 인증 정보 처리 시작");

        // 디버깅용 URL 정보 수집
        const url = window.location.href;
        const hash = window.location.hash;
        const search = window.location.search;

        setDebugInfo((prev) => ({
          ...prev,
          url,
          hash,
          search,
          time: new Date().toISOString(),
        }));

        console.log("URL 정보:", { url, hash, search });

        // 해시에서 토큰 추출 시도 (#access_token=xxx&refresh_token=yyy 형식)
        let accessToken = null;
        let refreshToken = null;

        if (hash && hash.length > 1) {
          const hashParams = new URLSearchParams(hash.substring(1));
          accessToken = hashParams.get("access_token");
          refreshToken = hashParams.get("refresh_token");

          // URL에 오류가 있는지 확인
          const errorMsg = hashParams.get("error_description");
          if (errorMsg) {
            setError(decodeURIComponent(errorMsg));
            setStatus("오류 발생");
            setDebugInfo((prev) => ({ ...prev, error: errorMsg }));
            console.error("URL에서 오류 발견:", errorMsg);

            // 3초 후 로그인 페이지로 리디렉션
            setTimeout(() => {
              window.location.href = "/login";
            }, 3000);
            return;
          }
        }

        // 검색 파라미터에서 코드 추출 시도 (?code=xxx 형식)
        const urlParams = new URLSearchParams(search);
        const code = urlParams.get("code");

        setDebugInfo((prev) => ({
          ...prev,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasCode: !!code,
        }));

        console.log("토큰 확인:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasCode: !!code,
        });

        // 액세스 토큰이 있으면 세션 설정
        if (accessToken) {
          console.log("액세스 토큰으로 세션 설정 시도");
          setStatus("세션 설정 중...");

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (sessionError) {
            console.error("세션 설정 오류:", sessionError);
            setError(`세션 설정 실패: ${sessionError.message}`);
            setStatus("인증 실패");
            setDebugInfo((prev) => ({
              ...prev,
              sessionError: sessionError.message,
            }));

            // 3초 후 로그인 페이지로 리디렉션
            setTimeout(() => {
              window.location.href = "/login";
            }, 3000);
            return;
          }

          if (data.session) {
            console.log("세션 설정 성공, 대시보드로 리디렉션");
            setStatus("인증 성공, 리디렉션 중...");
            setRedirecting(true);

            // 세션 설정 성공 후 대시보드로 이동
            setTimeout(() => {
              // URL에 직접 이동하는 대신 history.pushState 사용
              window.location.href = "/dashboard";
            }, 1000);
            return;
          }
        }

        // 코드가 있지만 토큰이 없는 경우 (PKCE 흐름)
        if (code && !accessToken) {
          console.log("코드 교환 흐름 감지됨");
          setStatus("코드 교환 중...");

          // 이 부분은 필요에 따라 추가 구현
          // PKCE 흐름은 임시적으로 지원하지 않음
          setDebugInfo((prev) => ({ ...prev, flowDetected: "code (PKCE)" }));

          // 로그인 페이지로 리디렉션
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
          return;
        }

        // 처리할 인증 정보가 없으면 로그인 페이지로 리디렉션
        console.log("처리할 인증 정보 없음, 로그인 페이지로 리디렉션");
        setStatus("인증 정보 없음");

        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } catch (err) {
        console.error("인증 콜백 처리 중 오류:", err);
        setError(
          `인증 처리 중 오류 발생: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("처리 오류");
        setDebugInfo((prev) => ({ ...prev, error: String(err) }));

        // 오류 발생 시 로그인 페이지로 리디렉션
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    }

    if (!redirecting) {
      handleAuthCallback();
    }
  }, [redirecting]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-primary-100 to-primary-200 p-4">
      <div className="bg-white rounded-3xl p-8 shadow-soft max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-2">인증 처리 중</h1>
          <p className="text-gray-600">{status}</p>

          <div className="mt-4">
            <div className="w-10 h-10 mx-auto rounded-full border-4 border-primary-300 border-t-transparent animate-spin"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 mt-4">
            <p className="font-medium mb-1">인증 중 오류가 발생했습니다</p>
            <p>{error}</p>
            <p className="mt-2">잠시 후 로그인 페이지로 이동합니다...</p>
          </div>
        )}

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 rounded-lg bg-gray-100 text-xs font-mono text-gray-700 overflow-auto max-h-40">
            <p className="font-semibold mb-1">디버그 정보:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
