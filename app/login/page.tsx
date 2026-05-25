import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Log in · FORGE" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AuthForm mode="signin" initialError={error} />;
}
