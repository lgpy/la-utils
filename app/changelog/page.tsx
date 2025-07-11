import ChangelogContent from "@/components/Changelog/ChangelogContent";
import { client } from "@/lib/orpc";

export default async function ChangelogPage() {
	const changelogs = await client.changelog.paginatedChangelog({ cursor: 0, limit: 10 });

	return (
		<div className="container mx-auto py-6 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
					</div>
				</div>

				<ChangelogContent changelogs={changelogs} />
			</div>
		</div>
	);
}
