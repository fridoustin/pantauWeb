"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/utils/supabase/admin";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  // Tambahkan name dan role
  const name = formData.get("name")?.toString();
  const role = formData.get("role")?.toString();
  const phone = formData.get("phone")?.toString();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/add-technician",
      "Email and password are required"
    );
  }

  const { error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role, phone },
  });
  if (authError) {
    console.error("Auth error:", authError);
    return { success: false, message: authError.message };
  }

  const { data: insertData, error: dbError } = await supabaseAdmin
    .from("technician")
    .upsert([{
      name,
      email,
      phone,
    }], {
      onConflict: 'email',      // gunakan kolom email sebagai unique key
    });
  if (dbError) {
    console.error("Insert error:", dbError);
    return { success: false, message: dbError.message };
  }
  console.log("Inserted technician:", insertData);

  return { success: true, message: "Technician created successfully." };
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  const {data: userData, error: userError} = await supabase.auth.getUser()
  if(userError || !userData.user){
    await supabase.auth.signOut();
    return encodedRedirect("error", "/sign-in", "Failed to fetch user data.");
  }
  const role = userData.user.user_metadata?.role;
  if (role !== "admin") {
    await supabase.auth.signOut();
    return encodedRedirect("error", "/sign-in", "Access denied. Only admin can login.");
  }
  return redirect("/dashboard");
}

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
