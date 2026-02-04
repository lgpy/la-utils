import { Class } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import type React from "react";
import { Suspense, lazy } from "react";

// Dynamically import all icons
const AeromancerIcon = lazy(() => import("./Aeromancer"));
const ArcanistIcon = lazy(() => import("./Arcanist"));
const ArtilleristIcon = lazy(() => import("./Artillerist"));
const ArtistIcon = lazy(() => import("./Artist"));
const BardIcon = lazy(() => import("./Bard"));
const BerserkerIcon = lazy(() => import("./Berserker"));
const BreakerIcon = lazy(() => import("./Breaker"));
const DeadeyeIcon = lazy(() => import("./Deadeye"));
const DeathbladeIcon = lazy(() => import("./Deathblade"));
const DestroyerIcon = lazy(() => import("./Destroyer"));
const GlavierIcon = lazy(() => import("./Glavier"));
const GunlancerIcon = lazy(() => import("./Gunlancer"));
const GunslingerIcon = lazy(() => import("./Gunslinger"));
const MachinistIcon = lazy(() => import("./Machinist"));
const PaladinIcon = lazy(() => import("./Paladin"));
const ReaperIcon = lazy(() => import("./Reaper"));
const ScrapperIcon = lazy(() => import("./Scrapper"));
const ShadowhunterIcon = lazy(() => import("./Shadowhunter"));
const SharpshooterIcon = lazy(() => import("./Sharpshooter"));
const SlayerIcon = lazy(() => import("./Slayer"));
const SorceressIcon = lazy(() => import("./Sorceress"));
const SouleaterIcon = lazy(() => import("./Souleater"));
const SoulfistIcon = lazy(() => import("./Soulfist"));
const StrikerIcon = lazy(() => import("./Striker"));
const SummonerIcon = lazy(() => import("./Summoner"));
const WardancerIcon = lazy(() => import("./Wardancer"));
const WildsoulIcon = lazy(() => import("./Wildsoul"));
const ValkyrieIcon = lazy(() => import("./Valkyrie"));
const GuardianKnightIcon = lazy(() => import("./GuardianKnight"));

const icons: {
	[key in Class]: React.LazyExoticComponent<
		React.ComponentType<React.SVGProps<SVGSVGElement>>
	>;
} = {
	[Class.Aeromancer]: AeromancerIcon,
	[Class.Arcanist]: ArcanistIcon,
	[Class.Artillerist]: ArtilleristIcon,
	[Class.Artist]: ArtistIcon,
	[Class.Bard]: BardIcon,
	[Class.Berserker]: BerserkerIcon,
	[Class.Breaker]: BreakerIcon,
	[Class.Deadeye]: DeadeyeIcon,
	[Class.Deathblade]: DeathbladeIcon,
	[Class.Destroyer]: DestroyerIcon,
	[Class.Glaivier]: GlavierIcon,
	[Class.Gunlancer]: GunlancerIcon,
	[Class.Gunslinger]: GunslingerIcon,
	[Class.Machinist]: MachinistIcon,
	[Class.Paladin]: PaladinIcon,
	[Class.Reaper]: ReaperIcon,
	[Class.Scrapper]: ScrapperIcon,
	[Class.Shadowhunter]: ShadowhunterIcon,
	[Class.Sharpshooter]: SharpshooterIcon,
	[Class.Slayer]: SlayerIcon,
	[Class.Sorceress]: SorceressIcon,
	[Class.Souleater]: SouleaterIcon,
	[Class.Soulfist]: SoulfistIcon,
	[Class.Striker]: StrikerIcon,
	[Class.Summoner]: SummonerIcon,
	[Class.Wardancer]: WardancerIcon,
	[Class.Wildsoul]: WildsoulIcon,
	[Class.Valkyrie]: ValkyrieIcon,
	[Class.GuardianKnight]: GuardianKnightIcon,
};

export default function ClassIcon(
	props: {
		c: Class;
	} & React.SVGProps<SVGSVGElement>
) {
	const { c, ...svgProps } = props;
	const IconComponent = icons[c];

	// TODO Provide a fallback for when the icon is loading
	// You can customize the fallback (e.g., a spinner or a placeholder icon)
	const fallback = (
		<Loader2Icon className={cn("animate-spin size-6", svgProps.className)} />
	);

	return (
		<Suspense fallback={fallback}>
			<IconComponent
				{...svgProps}
				className={cn("fill-current size-6", svgProps.className)}
			/>
		</Suspense>
	);
}
