import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatGold } from "@/lib/utils";
import PiggyBankProgressBar from "./PiggyBankProgressBar";

type Props = {
  className?: string;
  highest3ThisWeek: Record<
    string,
    {
      earnedGold: number;
      totalGold: number;
    }
  >;
  highest3NextWeek: Record<string, number>;
};

export default function PiggyBank(props: Props) {
  const { highest3ThisWeek, highest3NextWeek, className } = props;

  const thisWeek = Object.values(highest3ThisWeek).reduce(
    (acc, thisWeek) => {
      acc.earned += thisWeek.earnedGold;
      acc.total += thisWeek.totalGold;
      return acc;
    },
    { earned: 0, total: 0 },
  );

  const nextWeek = Object.values(highest3NextWeek).reduce(
    (acc, earnable) => acc + earnable,
    0,
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <PiggyBankProgressBar
            progress={(thisWeek.earned / thisWeek.total) * 100}
            className={cn("size-5 !m-0 absolute top-2 right-2", className)}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="grid grid-cols-[auto_auto] gap-1">
            <span className="font-extralight">This Week:</span>
            <span>
              {formatGold(thisWeek.earned)}/{formatGold(thisWeek.total)}
            </span>
            <span className="font-extralight">Next Week:</span>
            <span>{formatGold(nextWeek)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
