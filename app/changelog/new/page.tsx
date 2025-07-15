import ChangelogForm from "@/components/Changelog/ChangelogForm";
import { auth } from "@/lib/auth.server";
import { headers } from "next/headers";
import { redirect } from 'next/navigation'

export default async function newChangelogPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/changelog');
  }

  const ManagementPermission = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        changelog: ["manage"],
      },
    }
  })

  if (!ManagementPermission.success) {
    redirect('/changelog');
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <h1 className="text-3xl font-bold tracking-tight">New Changelog</h1>
        <ChangelogForm />
      </div>
    </div>
  );
}
