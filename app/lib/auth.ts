import { supabase } from "./server";
import { redirect } from "react-router";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
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
