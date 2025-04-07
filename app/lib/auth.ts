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
  const session = await getSession();

  if (!session) {
    throw redirect("/login");
  }

  return session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return redirect("/login");
}
