import { cn } from "@/lib/utils";
import { TriangleAlertIcon } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

type Props = {
	tooltip: string;
} & React.HTMLAttributes<SVGElement>;

export default function WarningTooltipIcon(props: Props) {
	const { tooltip, className, ...rest } = props;
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>
					<TriangleAlertIcon
						className={cn("text-yellow", className)}
						{...rest}
					/>
				</TooltipTrigger>
				<TooltipContent>
					<p className="text-yellow font-semibold">{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
