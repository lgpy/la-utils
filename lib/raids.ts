import { Difficulty } from "@/generated/prisma";

export const shortenDifficulty = (difficulty: Difficulty) => {
	switch (difficulty) {
		case Difficulty.Normal:
			return "NM";
		case Difficulty.Hard:
			return "HM";
		case Difficulty.Solo:
			return "SO";
	}
};

export const shortestDifficulty = (difficulty: Difficulty) => {
	switch (difficulty) {
		case Difficulty.Normal:
			return "N";
		case Difficulty.Hard:
			return "H";
		case Difficulty.Solo:
			return "S";
	}
};

export const isGateCompleted = (
	dateRaidWasComplete: Date,
	latestReset: Date,
) => {
	return latestReset < dateRaidWasComplete;
};

// boss names: https://github.com/snoww/loa-logs/blob/master/src/lib/constants/encounters.ts
export const raids: Record<
	string,
	{
		name: string;
		gates: Record<
			string,
			{
				bossName: string[];
				difficulties: Partial<
					Record<Difficulty, {
						itemlevel: number;
						rewards: {
							gold: {
								bound: number;
								unbound: number;
							};
						};
					}>
				>;
				isBiWeekly?: "odd" | "even";
			}
		>;
	}
> = {
	valtan: {
		name: "Valtan",
		gates: {
			G1: {
				bossName: ["Dark Mountain Predator", "Destroyer Lucas", "Leader Lugaru"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1415, rewards: { gold: { bound: 240, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1415, rewards: { gold: { bound: 240, unbound: 60 } } },
					[Difficulty.Hard]: { itemlevel: 1445, rewards: { gold: { bound: 320, unbound: 80 } } },
				},
			},
			G2: {
				bossName: ["Demon Beast Commander Valtan", "Ravaged Tyrant of Beasts"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1415, rewards: { gold: { bound: 360, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1415, rewards: { gold: { bound: 360, unbound: 90 } } },
					[Difficulty.Hard]: { itemlevel: 1445, rewards: { gold: { bound: 560, unbound: 140 } } },
				},
			},
		},
	},
	vykas: {
		name: "Vykas",
		gates: {
			G1: {
				bossName: ["Covetous Devourer Vykas"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1430, rewards: { gold: { bound: 280, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1430, rewards: { gold: { bound: 280, unbound: 70 } } },
					[Difficulty.Hard]: { itemlevel: 1460, rewards: { gold: { bound: 400, unbound: 100 } } },
				},
			},
			G2: {
				bossName: ["Covetous Legion Commander Vykas"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1430, rewards: { gold: { bound: 520, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1430, rewards: { gold: { bound: 520, unbound: 130 } } },
					[Difficulty.Hard]: { itemlevel: 1460, rewards: { gold: { bound: 800, unbound: 200 } } },
				},
			},
		},
	},
	kakul: {
		name: "Kakul-Saydon",
		gates: {
			G1: {
				bossName: ["Saydon"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1475, rewards: { gold: { bound: 320, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1475, rewards: { gold: { bound: 320, unbound: 80 } } },
				},
			},
			G2: {
				bossName: ["Kakul"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1475, rewards: { gold: { bound: 480, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1475, rewards: { gold: { bound: 480, unbound: 120 } } },
				},
			},
			G3: {
				bossName: ["Kakul-Saydon", "Encore-Desiring Kakul-Saydon"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1475, rewards: { gold: { bound: 800, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1475, rewards: { gold: { bound: 800, unbound: 200 } } },
				},
			},
		},
	},
	brel: {
		name: "Brelshaza",
		gates: {
			G1: {
				bossName: ["Gehenna Helkasirs"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1490, rewards: { gold: { bound: 800, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1490, rewards: { gold: { bound: 800, unbound: 200 } } },
					[Difficulty.Hard]: { itemlevel: 1540, rewards: { gold: { bound: 960, unbound: 240 } } },
				},
			},
			G2: {
				bossName: ["Prokel", "Prokel's Spiritual Echo", "Ashtarot"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1490, rewards: { gold: { bound: 800, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1490, rewards: { gold: { bound: 800, unbound: 200 } } },
					[Difficulty.Hard]: { itemlevel: 1540, rewards: { gold: { bound: 960, unbound: 240 } } },
				},
			},
			G3: {
				bossName: ["Primordial Nightmare"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1500, rewards: { gold: { bound: 800, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1500, rewards: { gold: { bound: 800, unbound: 200 } } },
					[Difficulty.Hard]: { itemlevel: 1550, rewards: { gold: { bound: 960, unbound: 240 } } },
				},
			},
			G4: {
				bossName: ["Phantom Legion Commander Brelshaza"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1520, rewards: { gold: { bound: 1280, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1520, rewards: { gold: { bound: 1280, unbound: 320 } } },
					[Difficulty.Hard]: { itemlevel: 1560, rewards: { gold: { bound: 1600, unbound: 400 } } },
				},
				isBiWeekly: "even",
			}
		},
	},
	kayangel: {
		name: "Kayangel",
		gates: {
			G1: {
				bossName: ["Tienis"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1540, rewards: { gold: { bound: 640, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1540, rewards: { gold: { bound: 640, unbound: 160 } } },
					[Difficulty.Hard]: { itemlevel: 1580, rewards: { gold: { bound: 800, unbound: 200 } } },
				},
			},
			G2: {
				bossName: ["Prunya"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1540, rewards: { gold: { bound: 960, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1540, rewards: { gold: { bound: 960, unbound: 240 } } },
					[Difficulty.Hard]: { itemlevel: 1580, rewards: { gold: { bound: 1280, unbound: 320 } } },
				},
			},
			G3: {
				bossName: ["Lauriel"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1540, rewards: { gold: { bound: 1280, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1540, rewards: { gold: { bound: 1280, unbound: 320 } } },
					[Difficulty.Hard]: { itemlevel: 1580, rewards: { gold: { bound: 1760, unbound: 440 } } },
				},
			},
		},
	},
	akkan: {
		name: "Akkan",
		gates: {
			G1: {
				bossName: ["Griefbringer Maurug", "Evolved Maurug"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1580, rewards: { gold: { bound: 800, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1580, rewards: { gold: { bound: 800, unbound: 200 } } },
					[Difficulty.Hard]: { itemlevel: 1600, rewards: { gold: { bound: 1200, unbound: 300 } } },
				},
			},
			G2: {
				bossName: ["Lord of Degradation Akkan"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1580, rewards: { gold: { bound: 1440, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1580, rewards: { gold: { bound: 1440, unbound: 360 } } },
					[Difficulty.Hard]: { itemlevel: 1600, rewards: { gold: { bound: 2000, unbound: 500 } } },
				},
			},
			G3: {
				bossName: ["Plague Legion Commander Akkan", "Lord of Kartheon Akkan"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1580, rewards: { gold: { bound: 2080, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1580, rewards: { gold: { bound: 2080, unbound: 520 } } },
					[Difficulty.Hard]: { itemlevel: 1600, rewards: { gold: { bound: 2800, unbound: 700 } } },
				},
			},
		},
	},
	voldis: {
		name: "Ivory  Tower",
		gates: {
			G1: {
				bossName: ["Kaltaya, the Blooming Chaos"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1600, rewards: { gold: { bound: 1200, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1600, rewards: { gold: { bound: 1200, unbound: 300 } } },
					[Difficulty.Hard]: { itemlevel: 1610, rewards: { gold: { bound: 1600, unbound: 400 } } },
				},
			},
			G2: {
				bossName: ["Rakathus, the Lurking Arrogance"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1600, rewards: { gold: { bound: 1600, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1600, rewards: { gold: { bound: 1600, unbound: 400 } } },
					[Difficulty.Hard]: { itemlevel: 1610, rewards: { gold: { bound: 2400, unbound: 600 } } },
				},
			},
			G3: {
				bossName: ["Lazaram, the Trailblazer", "Subordinated Vertus", "Subordinated Calventus", "Subordinated Legoros", "Brand of Subordination"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1600, rewards: { gold: { bound: 2400, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1600, rewards: { gold: { bound: 2400, unbound: 600 } } },
					[Difficulty.Hard]: { itemlevel: 1610, rewards: { gold: { bound: 4400, unbound: 1100 } } },
				},
			},
		},
	},
	thaemine: {
		name: "Thaemine",
		gates: {
			G1: {
				bossName: ["Killineza the Dark Worshipper"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1610, rewards: { gold: { bound: 2300, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1610, rewards: { gold: { bound: 1300, unbound: 1400 } } },
					[Difficulty.Hard]: { itemlevel: 1620, rewards: { gold: { bound: 2000, unbound: 2400 } } },
				},
			},
			G2: {
				bossName: ["Valinak, Knight of Darkness", "Valinak, Taboo Usurper", "Valinak, Herald of the End"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1610, rewards: { gold: { bound: 2700, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1610, rewards: { gold: { bound: 1600, unbound: 1700 } } },
					[Difficulty.Hard]: { itemlevel: 1620, rewards: { gold: { bound: 2500, unbound: 3000 } } },
				},
			},
			G3: {
				bossName: ["Thaemine the Lightqueller", "Dark Greatsword"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1610, rewards: { gold: { bound: 3800, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1610, rewards: { gold: { bound: 2400, unbound: 2600 } } },
					[Difficulty.Hard]: { itemlevel: 1620, rewards: { gold: { bound: 4000, unbound: 4900 } } },
				},
			},
			G4: {
				bossName: ["Darkness Legion Commander Thaemine", "Thaemine Prokel", "Thaemine, Conqueror of Stars"],
				difficulties: {
					[Difficulty.Hard]: { itemlevel: 1620, rewards: { gold: { bound: 4000, unbound: 5800 } } },
				},
				isBiWeekly: "odd",
			},
		},
	},
	echidna: {
		name: "Overture: Echidna",
		gates: {
			G1: {
				bossName: ["Red Doom Narkiel", "Agris"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1620, rewards: { gold: { bound: 4800, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1620, rewards: { gold: { bound: 2000, unbound: 4000 } } },
					[Difficulty.Hard]: { itemlevel: 1630, rewards: { gold: { bound: 2500, unbound: 4500 } } },
				},
			},
			G2: {
				bossName: ["Echidna", "Covetous Master Echidna", "Desire in Full Bloom, Echidna", "Alcaone, the Twisted Venom", "Agris, the Devouring Bog"],
				difficulties: {
					[Difficulty.Solo]: { itemlevel: 1620, rewards: { gold: { bound: 8000, unbound: 0 } } },
					[Difficulty.Normal]: { itemlevel: 1620, rewards: { gold: { bound: 3000, unbound: 7000 } } },
					[Difficulty.Hard]: { itemlevel: 1630, rewards: { gold: { bound: 3500, unbound: 9000 } } },
				},
			},
		},
	},
	behemoth: {
		name: "Behemoth",
		gates: {
			G1: {
				bossName: ["Behemoth, the Storm Commander", "Despicable Skolakia", "Untrue Crimson Yoho", "Ruthless Lakadroff", "Vicious Argeos"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1620, rewards: { gold: { bound: 2500, unbound: 4500 } } },
				},
			},
			G2: {
				bossName: ["Behemoth, Cruel Storm Slayer"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1620, rewards: { gold: { bound: 4000, unbound: 7000 } } },
				},
			},
		},
	},
	aegir: {
		name: "Act 1: Aegir",
		gates: {
			G1: {
				bossName: ["Akkan, Lord of Death", "Abyss Monarch Aegir"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1660, rewards: { gold: { bound: 0, unbound: 7500 } } },
					[Difficulty.Hard]: { itemlevel: 1680, rewards: { gold: { bound: 0, unbound: 10000 } } },
				},
			},
			G2: {
				bossName: ["Aegir, the Oppressor", "Pulsating Giant's Heart"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1660, rewards: { gold: { bound: 0, unbound: 16500 } } },
					[Difficulty.Hard]: { itemlevel: 1680, rewards: { gold: { bound: 0, unbound: 20000 } } },
				},
			},
		},
	},
	brelshaza2: {
		name: "Act 2: Brelshaza",
		gates: {
			G1: {
				bossName: ["Narok the Butcher"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1670, rewards: { gold: { bound: 0, unbound: 9000 } } },
					[Difficulty.Hard]: { itemlevel: 1690, rewards: { gold: { bound: 0, unbound: 11000 } } },
				},
			},
			G2: {
				bossName: ["Phantom Legion Commander Brelshaza", "Phantom Manifester Brelshaza"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1670, rewards: { gold: { bound: 0, unbound: 18500 } } },
					[Difficulty.Hard]: { itemlevel: 1690, rewards: { gold: { bound: 0, unbound: 23000 } } },
				},
			},
		},
	},
	mordum: {
		name: "Act 3: Mordum",
		gates: {
			G1: {
				bossName: ["Thaemine, Master of Darkness", "Infernas"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1680, rewards: { gold: { bound: 0, unbound: 6000 } } },
					[Difficulty.Hard]: { itemlevel: 1700, rewards: { gold: { bound: 0, unbound: 7000 } } },
				},
			},
			G2: {
				bossName: ["Blossoming Fear, Naitreya"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1680, rewards: { gold: { bound: 0, unbound: 9500 } } },
					[Difficulty.Hard]: { itemlevel: 1700, rewards: { gold: { bound: 0, unbound: 11000 } } },
				},
			},
			G3: {
				bossName: ["Mordum, the Abyssal Punisher", "Mordum's Hammer", "Flash of Punishment"],
				difficulties: {
					[Difficulty.Normal]: { itemlevel: 1680, rewards: { gold: { bound: 0, unbound: 12500 } } },
					[Difficulty.Hard]: { itemlevel: 1700, rewards: { gold: { bound: 0, unbound: 20000 } } },
				},
			},
		},
	},
};
