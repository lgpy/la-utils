import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Character } from "@/hooks/mainstore";
import { getGoldInfo } from "@/lib/chars";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import PiggyBankProgressBar from "./PiggyBankProgressBar";

type Props = {
  char: Character;
  className?: string;
};

export default function GoldEarningTooltip(props: Props) {
  const { char, className } = props;

  const gold = useMemo(() => getGoldInfo(char.raids), [char.raids]);

  const fmt = (gold: number) =>
    gold > 1000 ? `${(gold / 1000).toFixed(gold % 1000 === 0 ? 0 : 1)}k` : gold;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <PiggyBankProgressBar
            progress={(gold.earned / gold.total) * 100}
            className={cn("size-5 !m-0 absolute top-2 right-2", className)}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="grid grid-cols-[auto_auto] gap-1">
            <span>Total gold:</span>
            <span>{fmt(gold.total)}</span>
            <span>Earned:</span>
            <span>{fmt(gold.earned)}</span>
            <span>Remaining:</span>
            <span>{fmt(gold.total - gold.earned)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
