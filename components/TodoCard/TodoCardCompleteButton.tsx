import { toast } from "sonner";

import { raids } from "@/lib/raids";
import { type Character, useMainStore } from "@/providers/MainStoreProvider";
import { CheckIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type MouseEventHandler, useState } from "react";

interface Props {
	charId: string;
	raidId: string;
	assignedGates: Character["assignedRaids"][string];
}

export default function TodoCardCompleteButton({
	charId,
	raidId,
	assignedGates,
}: Props) {
	const mainStore = useMainStore();
	const raid = raids[raidId];
	const [increase, setIncrease] = useState(false);

	const completedlen = Object.values(assignedGates).reduce(
		(acc, ag) => (ag.completed ? acc + 1 : acc),
		0,
	);

	const isChecked = Object.keys(assignedGates).length === completedlen;

	if (!raid) return null;

	const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
		event.preventDefault();

		if (event.button === 0) {
			setIncrease(true);
			if (isChecked) return;
			try {
				mainStore.raidAction({
					charId,
					raidId,
					mode: event.shiftKey ? "all" : "last",
					type: "complete",
				});
			} catch (e) {
				toast.error(
					event.shiftKey
						? "Failed to complete all gates"
						: "Failed to complete last gate",
				);
			}
		} else if (event.button === 2) {
			setIncrease(false);
			if (completedlen === 0) return;
			try {
				mainStore.raidAction({
					charId,
					raidId,
					mode: event.shiftKey ? "all" : "last",
					type: "uncomplete",
				});
			} catch (e) {
				toast.error(
					event.shiftKey
						? "Failed to uncomplete all gates"
						: "Failed to uncomplete last gate",
				);
			}
		}
	};

	return (
		<div className="py-1.5">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className="shadow bg-primary/30 w-16 h-8 rounded-lg items-center relative overflow-hidden"
				onClick={handleClick}
				onContextMenu={handleClick}
			>
				<div
					className="absolute left-0 right-0 text-center z-10 text-primary-foreground h-full"
					style={{ fontFeatureSettings: "'tnum' 1" }}
				>
					<div className="flex flex-row justify-center h-full items-center">
						<AnimatePresence initial={false}>
							{isChecked ? (
								<motion.div
									key="checkmark-icon" // Changed key for clarity and stability
									style={{ position: "absolute" }} // Added position: "absolute"
									initial={{
										opacity: 0,
										scale: 0.5,
										rotate: -90,
									}}
									animate={{
										opacity: 1,
										scale: 1,
										rotate: 0,
									}}
									exit={{
										opacity: 0,
										scale: 0.5,
										rotate: -90,
									}}
									transition={{ type: "spring", stiffness: 300, damping: 15 }}
								>
									<CheckIcon />
								</motion.div>
							) : (
								<motion.div // New wrapper for numbers
									key="numbers-container"
									style={{ position: "absolute" }} // Added position: "absolute"
									className="flex flex-row items-center" // Layout for inner numbers
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
								>
									<motion.div
										key={`ap${completedlen}`} // Key depends on completedlen to trigger re-animation
										className="text-nowrap"
										initial={{
											opacity: 0,
											y: increase ? 10 : -10,
											scale: 0.9,
										}}
										animate={{
											opacity: 1,
											y: 0,
											scale: 1,
										}}
										exit={{
											opacity: 0,
											y: increase ? -10 : 10,
											scale: 0.9,
										}}
										transition={{ type: "spring", stiffness: 400, damping: 20 }}
									>
										{completedlen}
									</motion.div>
									<motion.div
										key="ap-total" // Static key for the total display
										className="text-nowrap"
										initial={{
											opacity: 0,
											scale: 0.95,
										}}
										animate={{
											opacity: 1,
											scale: 1,
										}}
										exit={{
											opacity: 0,
											scale: 0.9,
										}}
										transition={{ duration: 0.3, ease: "easeInOut" }}
									>
										/{Object.keys(assignedGates).length}
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
				<motion.div
					animate={{
						width: `${(completedlen / Object.keys(assignedGates).length) * 100}%`,
					}}
					initial={false}
					className="bg-primary h-full"
				/>
			</div>
		</div>
	);
}
