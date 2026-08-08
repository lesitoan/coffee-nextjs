import { AdminLoginScreen } from "@/screens/admin-login";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { error } = await searchParams;
  return <AdminLoginScreen error={error} />;
}
