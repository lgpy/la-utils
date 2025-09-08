"use client";

import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

export type SelectItem = {
	label: string;
	value: string;
};

interface FancyMultiSelectProps {
	data: SelectItem[];
	selected: SelectItem[];
	setSelected: Dispatch<SetStateAction<SelectItem[]>>;
	placeholder?: string;
	className?: string;
}

export default function FancyMultiSelect({
	data,
	selected,
	setSelected,
	placeholder = "Select items...",
	className,
}: FancyMultiSelectProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");

	const handleUnselect = React.useCallback(
		(item: SelectItem) => {
			setSelected((prev) => prev.filter((i) => i.value !== item.value));
		},
		[setSelected]
	);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const input = inputRef.current;
			if (input) {
				if (e.key === "Delete" || e.key === "Backspace") {
					if (input.value === "") {
						setSelected((prev) => {
							const newSelected = [...prev];
							newSelected.pop();
							return newSelected;
						});
					}
				}
				// This is not a default behaviour of the <input /> field
				if (e.key === "Escape") {
					input.blur();
				}
			}
		},
		[setSelected]
	);

	const selectables = data.filter(
		(item) => !selected.find((i) => i.value === item.value)
	);

	return (
		<Command
			onKeyDown={handleKeyDown}
			className={cn("overflow-visible bg-transparent", className)}
		>
			<div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
				<div className="flex flex-wrap gap-1">
					{selected.map((item) => {
						return (
							<Badge key={item.value} variant="secondary">
								{item.label}
								<button
									className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleUnselect(item);
										}
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onClick={() => handleUnselect(item)}
								>
									<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
								</button>
							</Badge>
						);
					})}
					{/* Avoid having the "Search" Icon */}
					<CommandPrimitive.Input
						ref={inputRef}
						value={inputValue}
						onValueChange={setInputValue}
						onBlur={() => setOpen(false)}
						onFocus={() => setOpen(true)}
						placeholder={selected.length === 0 ? placeholder : ""}
						className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
					/>
				</div>
			</div>
			<div className="relative">
				<CommandList>
					{open && selectables.length > 0 ? (
						<div className="absolute top-2 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
							<CommandGroup className="h-full overflow-auto">
								{selectables.map((item) => {
									return (
										<CommandItem
											key={item.value}
											onMouseDown={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											onSelect={() => {
												setInputValue("");
												setSelected((prev) => [...prev, item]);
											}}
											className={"cursor-pointer"}
										>
											{item.label}
										</CommandItem>
									);
								})}
							</CommandGroup>
						</div>
					) : null}
				</CommandList>
			</div>
		</Command>
	);
}
