"use server";

import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  console.log("=== Server Action 登录 ===");
  console.log("用户名:", username);

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    console.log("✓ Server Action 登录成功");
  } catch (error: any) {
    console.error("❌ Server Action 登录失败:", error);
    return { success: false, error: "用户名或密码错误" };
  }

  redirect("/");
}
