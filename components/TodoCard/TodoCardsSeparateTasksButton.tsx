"use client";

import { useMainStore } from "@/stores/main-store/provider";
import { Toggle } from "../ui/toggle";
import { ClipboardListIcon, MoveIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useState } from "react";

interface Props {
	showTasks: boolean;
	setShowTasks: (value: boolean) => void;
	position: { x: number; y: number };
	setPosition: (pos: { x: number; y: number }) => void;
}

export default function TodoCardsSeparateTasksButton({
	showTasks,
	setShowTasks,
	position,
	setPosition,
}: Props) {
	// Used to force re-render on window resize
	const [windowSize, setWindowSize] = useState({
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0,
	});

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({ width: window.innerWidth, height: window.innerHeight });
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const mainStore = useMainStore();

	const tasks = mainStore.characters.flatMap((char) => char.tasks);
	const tasksByType = {
		daily: tasks.filter((task) => task.type === "daily"),
		weekly: tasks.filter((task) => task.type === "weekly"),
		rested: tasks.filter((task) => task.type === "rested"),
	};
	const dailyTasks = tasksByType.daily.filter((task) => !task.completed);
	const weeklyTasks = tasksByType.weekly.filter((task) => !task.completed);
	const restedTasks = tasksByType.rested.filter((task) => !task.completed);

	// Drag logic
	const dragging = useRef(false);
	const offset = useRef({ x: 0, y: 0 });

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		dragging.current = true;
		offset.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		};
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!dragging.current) return;
		let newX = e.clientX - offset.current.x;
		let newY = e.clientY - offset.current.y;

		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const elemWidth = 144;
		const elemHeight = 120;
		newX = Math.max(0, Math.min(newX, vw - elemWidth));
		newY = Math.max(0, Math.min(newY, vh - elemHeight));

		setPosition({ x: newX, y: newY });
	};

	const handleMouseUp = () => {
		dragging.current = false;
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	};

	return (
		<div
			className={cn(
				"hidden md:flex flex-col items-center gap-2 w-36 bg-ctp-base rounded-base relative border-2 border-border p-2",
				"fixed select-none z-50"
			)}
			style={{
				left: Math.max(0, Math.min(position.x, windowSize.width - 144)),
				top: Math.max(0, Math.min(position.y, windowSize.height - 120 - 16)),
			}}
		>
			<Toggle
				aria-label="Toggle italic"
				pressed={showTasks}
				onPressedChange={setShowTasks}
			>
				<ClipboardListIcon />
				Show Tasks
			</Toggle>
			<div className="grid grid-cols-[max-content_1fr] gap-1 text-xs text-muted-foreground">
				{tasksByType.daily.length > 0 && (
					<>
						<span className="text-end">{dailyTasks.length}</span>
						<span>Daily</span>
					</>
				)}
				{tasksByType.rested.length > 0 && (
					<>
						<span className="text-end">{restedTasks.length}</span>
						<span>Rested</span>
					</>
				)}
				{tasksByType.weekly.length > 0 && (
					<>
						<span className="text-end">{weeklyTasks.length}</span>
						<span>Weekly</span>
					</>
				)}
			</div>
			<div
				className="absolute bottom-1 right-1 cursor-move"
				onMouseDown={handleMouseDown}
			>
				<MoveIcon className="size-4 text-muted-foreground" />
			</div>
		</div>
	);
}
