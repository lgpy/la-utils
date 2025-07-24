"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			toastOptions={{
				style: {
					background: "var(--ctp-surface1)",
					color: "var(--foreground)",
				},
				classNames: {
					toast: "!border-ctp-surface2",
					description: "!text-muted-foreground",
					actionButton: "!bg-primary !text-primary-foreground",
					success: "!text-ctp-green",
					error: "!text-ctp-red",
					warning: "!text-ctp-yellow",
					info: "!text-ctp-blue",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
