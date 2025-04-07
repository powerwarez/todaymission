import { supabase } from "./server";
import { redirect } from "react-router";

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("세션 확인 중 오류:", error.message);
      return null;
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

    return session;
  } catch (error) {
    if (error instanceof Response) {
      throw error; // redirect 응답은 그대로 전달
    }
    console.error("인증 확인 중 오류:", error);
    throw redirect("/login");
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return redirect("/login");
}

// OAuth 해시 파라미터에서 세션 설정 (클라이언트용)
export async function setSessionFromHash(hash: string) {
  if (!hash || !hash.includes("access_token")) {
    return { success: false, error: "유효한 인증 토큰이 없습니다." };
  }

  try {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token") || "";
    const provider = params.get("provider") || "kakao";

    if (!accessToken) {
      return { success: false, error: "액세스 토큰이 없습니다." };
    }

    // Supabase 세션 설정
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("세션 설정 중 오류:", error.message);
      return { success: false, error: error.message };
    }

    if (!data.session) {
      return {
        success: false,
        error: "세션 설정에 성공했으나 세션이 없습니다.",
      };
    }

    return { success: true, session: data.session };
  } catch (err) {
    console.error("세션 설정 중 예외 발생:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
