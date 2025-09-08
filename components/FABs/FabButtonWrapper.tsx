"use client";

import { motion } from "motion/react";

export function FabButtonWrapper({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{
				scale: 1,
				opacity: 1,
				transition: {
					type: "spring",
					stiffness: 260,
					damping: 20,
				},
			}}
		>
			{children}
		</motion.div>
	);
}
