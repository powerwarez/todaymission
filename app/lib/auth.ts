import { supabase } from "./server";
import { redirect } from "react-router";

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("세션 확인 중 오류:", error.message);
      return null;
    }

    if (data?.session) {
      console.log("세션 확인 성공, 사용자 ID:", data.session.user?.id);
    } else {
      console.log("세션 없음");
    }

    return data.session;
  } catch (err) {
    console.error("세션 확인 중 예외 발생:", err);
    return null;
  }
}

export async function getUserId() {
  const session = await getSession();
  return session?.user?.id;
}

export async function requireAuth() {
  try {
    const session = await getSession();

    if (!session) {
      console.log("인증이 필요합니다. 로그인 페이지로 리다이렉트합니다.");
      throw redirect("/login");
    }

    // 세션이 있지만 추가 검증이 필요한 경우
    try {
      // 세션 토큰 유효성 재확인
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("세션 갱신 실패:", refreshError.message);
        throw redirect("/login");
      }

      if (!refreshData.session) {
        console.error("세션이 갱신되었으나 새 세션이 없음");
        throw redirect("/login");
      }

      return refreshData.session;
    } catch (refreshErr) {
      if (refreshErr instanceof Response) {
        throw refreshErr; // redirect 응답은 그대로 전달
      }
      console.error("세션 갱신 중 예외 발생:", refreshErr);
      throw redirect("/login");
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error; // redirect 응답은 그대로 전달
    }
    console.error("인증 확인 중 오류:", error);
    throw redirect("/login");
  }
}

export async function signOut() {
  try {
    // 로컬 스토리지의 세션 데이터도 삭제
    if (typeof window !== "undefined") {
      localStorage.removeItem("supabase.auth.token");
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    console.log("로그아웃 성공");
    return redirect("/login");
  } catch (err) {
    console.error("로그아웃 중 오류:", err);
    throw new Error(
      err instanceof Error ? err.message : "로그아웃 중 오류가 발생했습니다."
    );
  }
}

// 클라이언트측 세션 확인 도우미
export function getClientSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const tokenString = localStorage.getItem("supabase.auth.token");
    if (!tokenString) return null;

    const tokenData = JSON.parse(tokenString);
    if (!tokenData.currentSession) return null;

    // 만료 시간 확인
    const now = Math.floor(Date.now() / 1000);
    if (tokenData.expiresAt < now) {
      console.log("세션이 만료되었습니다.");
      localStorage.removeItem("supabase.auth.token");
      return null;
    }

    return tokenData.currentSession;
  } catch (err) {
    console.error("클라이언트 세션 확인 중 오류:", err);
    return null;
  }
}
