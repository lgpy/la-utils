import { Class } from "@/lib/classes";
import AeromancerIcon from "./Aeromancer";
import ArcanistIcon from "./Arcanist";
import ArtilleristIcon from "./Artillerist";
import ArtistIcon from "./Artist";
import BardIcon from "./Bard";
import BerserkerIcon from "./Berserker";
import BreakerIcon from "./Breaker";
import DeadeyeIcon from "./Deadeye";
import DeathbladeIcon from "./Deathblade";
import DestroyerIcon from "./Destroyer";
import GlavierIcon from "./Glavier";
import GunlancerIcon from "./Gunlancer";
import GunslingerIcon from "./Gunslinger";
import MachinistIcon from "./Machinist";
import PaladinIcon from "./Paladin";
import ReaperIcon from "./Reaper";
import ScrapperIcon from "./Scrapper";
import ShadowhunterIcon from "./Shadowhunter";
import SharpshooterIcon from "./Sharpshooter";
import SlayerIcon from "./Slayer";
import SorceressIcon from "./Sorceress";
import SouleaterIcon from "./Souleater";
import SoulfistIcon from "./Soulfist";
import StrikerIcon from "./Striker";
import SummonerIcon from "./Summoner";
import WardancerIcon from "./Wardancer";
import { createElement } from "react";
import { cn } from "@/lib/utils";
import WildsoulIcon from "./Wildsoul";

const icons: {
  [key in Class]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
};

export default function ClassIcon(
  props: {
    c: Class;
  } & React.SVGProps<SVGSVGElement>,
) {
  const { c, ...svgProps } = props;
  const icon = icons[c];
  return createElement(icon, {
    ...svgProps,
    className: cn("fill-current size-6", svgProps.className),
  });
}
