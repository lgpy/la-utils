import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import PiggyBankProgressBar from "./PiggyBankProgressBar";

type Props = {
  className?: string;
  goldInfo: Record<
    string,
    {
      thisWeek: {
        earnedGold: number;
        totalGold: number;
      };
      nextWeek: {
        earnableGold: number;
      };
    }
  >;
};

export default function GoldEarningTooltip(props: Props) {
  const { goldInfo, className } = props;

  const gold = Object.values(goldInfo).reduce(
    (acc, nfo) => {
      acc.thisWeek.earned += nfo.thisWeek.earnedGold;
      acc.thisWeek.total += nfo.thisWeek.totalGold;
      acc.nextWeek.earnable += nfo.nextWeek.earnableGold;
      return acc;
    },
    {
      thisWeek: { earned: 0, total: 0 },
      nextWeek: { earnable: 0 },
    },
  );

  const fmt = (gold: number) =>
    gold > 1000 ? `${(gold / 1000).toFixed(gold % 1000 === 0 ? 0 : 1)}k` : gold;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <PiggyBankProgressBar
            progress={(gold.thisWeek.earned / gold.thisWeek.total) * 100}
            className={cn("size-5 !m-0 absolute top-2 right-2", className)}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="grid grid-cols-[auto_auto] gap-1">
            <span className="font-extralight">This Week:</span>
            <span>
              {fmt(gold.thisWeek.earned)}/{fmt(gold.thisWeek.total)}
            </span>
            <span className="font-extralight">Next Week:</span>
            <span>{fmt(gold.nextWeek.earnable)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
