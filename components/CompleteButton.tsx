import { CheckIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type MouseEventHandler, useState } from "react";

interface Props {
	completed: number;
	total: number;
	onIncrease: (shiftKey: boolean) => void;
	onDecrease: (shiftKey: boolean) => void;
}

export default function CompleteButton({
	completed,
	total,
	onIncrease,
	onDecrease,
}: Props) {
	const [increase, setIncrease] = useState(false);

	const isChecked = completed === total;

	const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
		event.preventDefault();

		if (event.button === 0) {
			setIncrease(true);
			if (isChecked) return;
			onIncrease(event.shiftKey);
		} else if (event.button === 2) {
			setIncrease(false);
			if (completed === 0) return;
			onDecrease(event.shiftKey);
		}
	};

	return (
		<div
			className="shadow bg-primary/30 w-8 h-6 text-xs font-light rounded-lg items-center relative overflow-hidden shrink-0"
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
								<CheckIcon className="size-5" />
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
								{total > 1 && (
									<>
										<motion.div
											key={`ap${completed}`} // Key depends on completed to trigger re-animation
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
											transition={{
												type: "spring",
												stiffness: 400,
												damping: 20,
											}}
										>
											{completed}
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
											/{total}
										</motion.div>
									</>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
			<motion.div
				animate={{
					width: `${(completed / total) * 100}%`,
				}}
				initial={false}
				className="bg-primary h-full"
			/>
		</div>
	);
}
