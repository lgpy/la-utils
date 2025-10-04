"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Class, Difficulty } from "@/generated/prisma";
import { separateSupportAndDps } from "@/lib/chars";
import ClassIcon from "@/components/class-icons/ClassIcon";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { translateToUsableData } from "./FriendRaids.utils";

type FriendRaidsUsableData = ReturnType<typeof translateToUsableData>;

type UserChars =
	FriendRaidsUsableData[string]["difficulties"][Difficulty][number]["characters"];

function getCharsToClassMap(dps: UserChars, support: UserChars) {
	const dpsMap = new Map<Class, UserChars>();
	const supportMap = new Map<Class, UserChars>();

	for (const char of dps) {
		const mapEntry = dpsMap.get(char.class);
		if (!mapEntry) {
			dpsMap.set(char.class, [char]);
		} else {
			mapEntry.push(char);
		}
	}
	for (const char of support) {
		const mapEntry = supportMap.get(char.class);
		if (!mapEntry) {
			supportMap.set(char.class, [char]);
		} else {
			mapEntry.push(char);
		}
	}

	return {
		dpsMap,
		supportMap,
	};
}

function getUniqueCharacterClassesV2(chars: UserChars): {
	uniqueClasses: Class[];
	dpsCount: number;
	supportCount: number;
} {
	const separatedByClassType = separateSupportAndDps(chars);
	const { dpsMap, supportMap } = getCharsToClassMap(
		separatedByClassType.dps,
		separatedByClassType.support
	);

	const totalDps = Array.from(dpsMap.values()).flat().length;
	const totalSupport = Array.from(supportMap.values()).flat().length;

	const CLASS_LIMIT = 6;
	const separatedUniqueClasses: Class[] = [];
	let supportCount = 0;
	let dpsCount = 0;

	const dpsClasses = Array.from(dpsMap.keys());
	const supportClasses = Array.from(supportMap.keys());

	const supportDefficient = supportMap.size < CLASS_LIMIT / 2;
	const dpsDefficient = dpsMap.size < CLASS_LIMIT / 2;
	for (let i = 0; i < CLASS_LIMIT; i++) {
		if (dpsCount === supportMap.size && supportCount === dpsMap.size) {
			break;
		}

		if (
			dpsCount < dpsMap.size &&
			(supportDefficient || dpsCount < CLASS_LIMIT / 2)
		) {
			separatedUniqueClasses.push(dpsClasses[dpsCount]);
			dpsCount++;
		} else if (
			supportCount < supportMap.size &&
			(dpsDefficient || supportCount < CLASS_LIMIT / 2)
		) {
			separatedUniqueClasses.push(supportClasses[supportCount]);
			supportCount++;
		}
	}

	return {
		uniqueClasses: separatedUniqueClasses,
		dpsCount: totalDps,
		supportCount: totalSupport,
	};
}

interface Props {
	data: FriendRaidsUsableData;
}

export default function FriendRaids({ data }: Props) {
	return (
		<div className="flex flex-col gap-4">
			{Object.entries(data).map(([raidId, raidData]) => {
				if (Object.keys(raidData.difficulties).length === 0) return null;
				return (
					<div key={raidId} className="border rounded-lg p-4">
						<div className="font-bold text-lg text-primary mb-4 flex items-center justify-between">
							<span>{raidData.name}</span>
						</div>
						<div className="flex flex-col gap-4">
							<Accordion type="multiple" className="flex flex-col gap-1">
								{Object.entries(raidData.difficulties).map(
									([difficulty, users]) => {
										if (users.length === 0) return null;
										return (
											<AccordionItem
												value={raidId + difficulty}
												key={raidId + difficulty}
												className="bg-muted/60 border-0 rounded-base"
											>
												<AccordionTrigger className="items-center flex text-md py-2 px-4 data-[state=open]:rounded-b-none hover:no-underline bg-muted cursor-pointer hover:text-ctp-text/80">
													<span className="min-w-[60px]">{difficulty}</span>
													<div className="*:data-[slot=avatar]:ring-ctp-surface1/50 flex -space-x-2 *:data-[slot=avatar]:ring-2">
														{users.map((user) => {
															return (
																<Avatar
																	key={`${raidId}-${difficulty}-${user.id}`}
																>
																	<AvatarImage
																		src={user.image ?? undefined}
																		alt={user.name}
																	/>
																	<AvatarFallback>
																		{user.name.charAt(0).toUpperCase()}
																	</AvatarFallback>
																</Avatar>
															);
														})}
													</div>
												</AccordionTrigger>
												<AccordionContent className="grid grid-cols-1 lg:grid-cols-3 justify-around p-2 gap-2">
													{users.map((user) => {
														const { dpsCount, supportCount, uniqueClasses } =
															getUniqueCharacterClassesV2(user.characters);

														return (
															<div
																key={`${raidId}-${difficulty}-${user.id}`}
																className="flex justify-between items-center p-2 gap-4 w-full bg-ctp-base rounded-md"
															>
																<div className="flex items-center gap-2 min-w-0">
																	<Avatar className="shrink-0 size-10">
																		<AvatarImage
																			src={user.image ?? undefined}
																			alt={user.name}
																		/>
																		<AvatarFallback>
																			{user.name.charAt(0).toUpperCase()}
																		</AvatarFallback>
																	</Avatar>
																	<div className="flex flex-col min-w-0">
																		<span className="font-medium truncate">
																			{user.name}{" "}
																			<span className="text-xs text-muted-foreground">
																				({user.topCharacter})
																			</span>
																		</span>
																		<span className="text-xs text-muted-foreground flex items-center gap-1">
																			{uniqueClasses.map((c, i) => (
																				<ClassIcon
																					c={c as Class}
																					key={`${c}-${i}`}
																					className="size-5"
																				/>
																			))}
																			{user.characters.length >
																				uniqueClasses.length && (
																				<span className="font-semibold">
																					+
																					{user.characters.length -
																						uniqueClasses.length}{" "}
																				</span>
																			)}
																		</span>
																	</div>
																</div>

																<div className="flex flex-col justify-around gap-0.5 text-end shrink-0">
																	{dpsCount > 0 && (
																		<span className="text-xs text-muted-foreground">
																			{dpsCount} DPS
																		</span>
																	)}
																	{supportCount > 0 && (
																		<span className="text-xs text-muted-foreground">
																			{supportCount} SUP
																		</span>
																	)}
																</div>
															</div>
														);
													})}
												</AccordionContent>
											</AccordionItem>
										);
									}
								)}
							</Accordion>
						</div>
					</div>
				);
			})}
		</div>
	);
}
