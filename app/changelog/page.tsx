import ChangelogContent from "@/components/Changelog/ChangelogContent";
import { client } from "@/lib/orpc";


export default async function ChangelogPage() {
	const changelogs = await client.changelog.paginatedChangelog({ cursor: 0, limit: 10 });
	return <ChangelogContent changelogs={changelogs} />;
}
