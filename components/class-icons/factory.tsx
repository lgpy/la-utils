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
import IconWrapper from "./IconWrapper";
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

export default function getClassIcon(
  c: Class,
  {
    size,
    svgProps,
  }: {
    size: number;
    svgProps?: React.SVGProps<SVGSVGElement>;
  },
) {
  switch (c) {
    //Warriors
    case Class.Berserker:
      return (
        <IconWrapper
          size={size}
          svgElement={BerserkerIcon}
          svgProps={svgProps}
        />
      );
    case Class.Destroyer:
      return (
        <IconWrapper
          size={size}
          svgElement={DestroyerIcon}
          svgProps={svgProps}
        />
      );
    case Class.Gunlancer:
      return (
        <IconWrapper
          size={size}
          svgElement={GunlancerIcon}
          svgProps={svgProps}
        />
      );
    case Class.Paladin:
      return (
        <IconWrapper size={size} svgElement={PaladinIcon} svgProps={svgProps} />
      );
    case Class.Slayer:
      return (
        <IconWrapper size={size} svgElement={SlayerIcon} svgProps={svgProps} />
      );

    //Mages
    case Class.Arcanist:
      return (
        <IconWrapper
          size={size}
          svgElement={ArcanistIcon}
          svgProps={svgProps}
        />
      );
    case Class.Bard:
      return (
        <IconWrapper size={size} svgElement={BardIcon} svgProps={svgProps} />
      );
    case Class.Sorceress:
      return (
        <IconWrapper
          size={size}
          svgElement={SorceressIcon}
          svgProps={svgProps}
        />
      );
    case Class.Summoner:
      return (
        <IconWrapper
          size={size}
          svgElement={SummonerIcon}
          svgProps={svgProps}
        />
      );

    //Fighters
    case Class.Glaivier:
      return (
        <IconWrapper size={size} svgElement={GlavierIcon} svgProps={svgProps} />
      );
    case Class.Scrapper:
      return (
        <IconWrapper
          size={size}
          svgElement={ScrapperIcon}
          svgProps={svgProps}
        />
      );
    case Class.Soulfist:
      return (
        <IconWrapper
          size={size}
          svgElement={SoulfistIcon}
          svgProps={svgProps}
        />
      );
    case Class.Wardancer:
      return (
        <IconWrapper
          size={size}
          svgElement={WardancerIcon}
          svgProps={svgProps}
        />
      );
    case Class.Striker:
      return (
        <IconWrapper size={size} svgElement={StrikerIcon} svgProps={svgProps} />
      );
    case Class.Breaker:
      return (
        <IconWrapper size={size} svgElement={BreakerIcon} svgProps={svgProps} />
      );

    //Gunners
    case Class.Artillerist:
      return (
        <IconWrapper
          size={size}
          svgElement={ArtilleristIcon}
          svgProps={svgProps}
        />
      );
    case Class.Deadeye:
      return (
        <IconWrapper size={size} svgElement={DeadeyeIcon} svgProps={svgProps} />
      );
    case Class.Gunslinger:
      return (
        <IconWrapper
          size={size}
          svgElement={GunslingerIcon}
          svgProps={svgProps}
        />
      );
    case Class.Machinist:
      return (
        <IconWrapper
          size={size}
          svgElement={MachinistIcon}
          svgProps={svgProps}
        />
      );
    case Class.Sharpshooter:
      return (
        <IconWrapper
          size={size}
          svgElement={SharpshooterIcon}
          svgProps={svgProps}
        />
      );

    //Assassins
    case Class.Deathblade:
      return (
        <IconWrapper
          size={size}
          svgElement={DeathbladeIcon}
          svgProps={svgProps}
        />
      );
    case Class.Reaper:
      return (
        <IconWrapper size={size} svgElement={ReaperIcon} svgProps={svgProps} />
      );
    case Class.Shadowhunter:
      return (
        <IconWrapper
          size={size}
          svgElement={ShadowhunterIcon}
          svgProps={svgProps}
        />
      );
    case Class.Souleater:
      return (
        <IconWrapper
          size={size}
          svgElement={SouleaterIcon}
          svgProps={svgProps}
        />
      );

    //Specialists
    case Class.Aeromancer:
      return (
        <IconWrapper
          size={size}
          svgElement={AeromancerIcon}
          svgProps={svgProps}
        />
      );
    case Class.Artist:
      return (
        <IconWrapper size={size} svgElement={ArtistIcon} svgProps={svgProps} />
      );

    default:
      return undefined;
  }
}
