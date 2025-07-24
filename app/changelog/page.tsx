import ChangelogContent from "@/components/Changelog/ChangelogContent";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth.server";
import { client } from "@/lib/orpc";
import { headers } from "next/headers";
import Link from "next/link";

export default async function ChangelogPage() {
	const changelogs = await client.changelog.paginatedChangelog({ cursor: 0, limit: 10 });

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	let hasPermission = false;

	if (session) {
		const ManagementPermission = await auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					changelog: ["manage"],
				},
			}
		})
		hasPermission = ManagementPermission.success;
	}

	return (
		<div className="container mx-auto py-6 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
					{hasPermission && (
						<Button>
							<Link href={"/changelog/new"}>New Changelog</Link>
						</Button>
					)}
				</div>

				<ChangelogContent changelogs={changelogs} showEditButton={hasPermission} />
			</div>
		</div>
	);
}
