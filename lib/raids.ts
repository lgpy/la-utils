export enum Difficulty {
	solo = "Solo",
	normal = "Normal",
	hard = "Hard",
}

export const shortenDifficulty = (difficulty: Difficulty) => {
	switch (difficulty) {
		case Difficulty.normal:
			return "NM";
		case Difficulty.hard:
			return "HM";
		case Difficulty.solo:
			return "SO";
	}
};

export const shortestDifficulty = (difficulty: Difficulty) => {
	switch (difficulty) {
		case Difficulty.normal:
			return "N";
		case Difficulty.hard:
			return "H";
		case Difficulty.solo:
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
						rewards: { gold: number };
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
					[Difficulty.solo]: { itemlevel: 1415, rewards: { gold: 240 } },
					[Difficulty.normal]: { itemlevel: 1415, rewards: { gold: 300 } },
					[Difficulty.hard]: { itemlevel: 1445, rewards: { gold: 400 } },
				},
			},
			G2: {
				bossName: ["Demon Beast Commander Valtan", "Ravaged Tyrant of Beasts"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1415, rewards: { gold: 360 } },
					[Difficulty.normal]: { itemlevel: 1415, rewards: { gold: 450 } },
					[Difficulty.hard]: { itemlevel: 1445, rewards: { gold: 700 } },
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
					[Difficulty.solo]: { itemlevel: 1430, rewards: { gold: 280 } },
					[Difficulty.normal]: { itemlevel: 1430, rewards: { gold: 350 } },
					[Difficulty.hard]: { itemlevel: 1460, rewards: { gold: 500 } },
				},
			},
			G2: {
				bossName: ["Covetous Legion Commander Vykas"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1430, rewards: { gold: 520 } },
					[Difficulty.normal]: { itemlevel: 1430, rewards: { gold: 650 } },
					[Difficulty.hard]: { itemlevel: 1460, rewards: { gold: 1000 } },
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
					[Difficulty.solo]: { itemlevel: 1475, rewards: { gold: 320 } },
					[Difficulty.normal]: { itemlevel: 1475, rewards: { gold: 400 } },
				},
			},
			G2: {
				bossName: ["Kakul"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1475, rewards: { gold: 480 } },
					[Difficulty.normal]: { itemlevel: 1475, rewards: { gold: 600 } },
				},
			},
			G3: {
				bossName: ["Kakul-Saydon", "Encore-Desiring Kakul-Saydon"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1475, rewards: { gold: 800 } },
					[Difficulty.normal]: { itemlevel: 1475, rewards: { gold: 1000 } },
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
					[Difficulty.solo]: { itemlevel: 1490, rewards: { gold: 800 } },
					[Difficulty.normal]: { itemlevel: 1490, rewards: { gold: 1000 } },
					[Difficulty.hard]: { itemlevel: 1540, rewards: { gold: 1200 } },
				},
			},
			G2: {
				bossName: ["Prokel", "Prokel's Spiritual Echo", "Ashtarot"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1490, rewards: { gold: 800 } },
					[Difficulty.normal]: { itemlevel: 1490, rewards: { gold: 1000 } },
					[Difficulty.hard]: { itemlevel: 1540, rewards: { gold: 1200 } },
				},
			},
			G3: {
				bossName: ["Primordial Nightmare"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1500, rewards: { gold: 800 } },
					[Difficulty.normal]: { itemlevel: 1500, rewards: { gold: 1000 } },
					[Difficulty.hard]: { itemlevel: 1550, rewards: { gold: 1200 } },
				},
			},
			G4: {
				bossName: ["Phantom Legion Commander Brelshaza"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1520, rewards: { gold: 1280 } },
					[Difficulty.normal]: { itemlevel: 1520, rewards: { gold: 1600 } },
					[Difficulty.hard]: { itemlevel: 1560, rewards: { gold: 2000 } },
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
					[Difficulty.solo]: { itemlevel: 1540, rewards: { gold: 640 } },
					[Difficulty.normal]: { itemlevel: 1540, rewards: { gold: 800 } },
					[Difficulty.hard]: { itemlevel: 1580, rewards: { gold: 1000 } },
				},
			},
			G2: {
				bossName: ["Prunya"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1540, rewards: { gold: 960 } },
					[Difficulty.normal]: { itemlevel: 1540, rewards: { gold: 1200 } },
					[Difficulty.hard]: { itemlevel: 1580, rewards: { gold: 1600 } },
				},
			},
			G3: {
				bossName: ["Lauriel"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1540, rewards: { gold: 1280 } },
					[Difficulty.normal]: { itemlevel: 1540, rewards: { gold: 1600 } },
					[Difficulty.hard]: { itemlevel: 1580, rewards: { gold: 2200 } },
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
					[Difficulty.solo]: { itemlevel: 1580, rewards: { gold: 800 } },
					[Difficulty.normal]: { itemlevel: 1580, rewards: { gold: 1000 } },
					[Difficulty.hard]: { itemlevel: 1600, rewards: { gold: 1500 } },
				},
			},
			G2: {
				bossName: ["Lord of Degradation Akkan"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1580, rewards: { gold: 1440 } },
					[Difficulty.normal]: { itemlevel: 1580, rewards: { gold: 1800 } },
					[Difficulty.hard]: { itemlevel: 1600, rewards: { gold: 2500 } },
				},
			},
			G3: {
				bossName: ["Plague Legion Commander Akkan", "Lord of Kartheon Akkan"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1580, rewards: { gold: 2080 } },
					[Difficulty.normal]: { itemlevel: 1580, rewards: { gold: 2600 } },
					[Difficulty.hard]: { itemlevel: 1600, rewards: { gold: 3500 } },
				},
			},
		},
	},
	voldis: {
		name: "Ivory Tower",
		gates: {
			G1: {
				bossName: ["Kaltaya, the Blooming Chaos"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1600, rewards: { gold: 1200 } },
					[Difficulty.normal]: { itemlevel: 1600, rewards: { gold: 1500 } },
					[Difficulty.hard]: { itemlevel: 1610, rewards: { gold: 2000 } },
				},
			},
			G2: {
				bossName: ["Rakathus, the Lurking Arrogance"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1600, rewards: { gold: 1600 } },
					[Difficulty.normal]: { itemlevel: 1600, rewards: { gold: 2000 } },
					[Difficulty.hard]: { itemlevel: 1610, rewards: { gold: 3000 } },
				},
			},
			G3: {
				bossName: ["Lazaram, the Trailblazer", "Subordinated Vertus", "Subordinated Calventus", "Subordinated Legoros", "Brand of Subordination"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1600, rewards: { gold: 2400 } },
					[Difficulty.normal]: { itemlevel: 1600, rewards: { gold: 3000 } },
					[Difficulty.hard]: { itemlevel: 1610, rewards: { gold: 5500 } },
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
					[Difficulty.solo]: { itemlevel: 1610, rewards: { gold: 2300 } },
					[Difficulty.normal]: { itemlevel: 1610, rewards: { gold: 2700 } },
					[Difficulty.hard]: { itemlevel: 1620, rewards: { gold: 4400 } },
				},
			},
			G2: {
				bossName: ["Valinak, Knight of Darkness", "Valinak, Taboo Usurper", "Valinak, Herald of the End"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1610, rewards: { gold: 2700 } },
					[Difficulty.normal]: { itemlevel: 1610, rewards: { gold: 3300 } },
					[Difficulty.hard]: { itemlevel: 1620, rewards: { gold: 5500 } },
				},
			},
			G3: {
				bossName: ["Thaemine the Lightqueller", "Dark Greatsword"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1610, rewards: { gold: 3800 } },
					[Difficulty.normal]: { itemlevel: 1610, rewards: { gold: 5000 } },
					[Difficulty.hard]: { itemlevel: 1620, rewards: { gold: 8900 } },
				},
			},
			G4: {
				bossName: ["Darkness Legion Commander Thaemine", "Thaemine Prokel", "Thaemine, Conqueror of Stars"],
				difficulties: {
					[Difficulty.hard]: { itemlevel: 1620, rewards: { gold: 9800 } },
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
					[Difficulty.solo]: { itemlevel: 1620, rewards: { gold: 4800 } },
					[Difficulty.normal]: { itemlevel: 1620, rewards: { gold: 6000 } },
					[Difficulty.hard]: { itemlevel: 1630, rewards: { gold: 7000 } },
				},
			},
			G2: {
				bossName: ["Echidna", "Covetous Master Echidna", "Desire in Full Bloom, Echidna", "Alcaone, the Twisted Venom", "Agris, the Devouring Bog"],
				difficulties: {
					[Difficulty.solo]: { itemlevel: 1620, rewards: { gold: 8000 } },
					[Difficulty.normal]: { itemlevel: 1620, rewards: { gold: 10000 } },
					[Difficulty.hard]: { itemlevel: 1630, rewards: { gold: 12500 } },
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
					[Difficulty.normal]: { itemlevel: 1620, rewards: { gold: 7000 } },
				},
			},
			G2: {
				bossName: ["Behemoth, Cruel Storm Slayer"],
				difficulties: {
					[Difficulty.normal]: { itemlevel: 1620, rewards: { gold: 11000 } },
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
					[Difficulty.normal]: { itemlevel: 1660, rewards: { gold: 7500 } },
					[Difficulty.hard]: { itemlevel: 1680, rewards: { gold: 10000 } },
				},
			},
			G2: {
				bossName: ["Aegir, the Oppressor", "Pulsating Giant's Heart"],
				difficulties: {
					[Difficulty.normal]: { itemlevel: 1660, rewards: { gold: 16500 } },
					[Difficulty.hard]: { itemlevel: 1680, rewards: { gold: 20000 } },
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
					[Difficulty.normal]: { itemlevel: 1670, rewards: { gold: 9000 } },
					[Difficulty.hard]: { itemlevel: 1690, rewards: { gold: 11000 } },
				},
			},
			G2: {
				bossName: ["Phantom Legion Commander Brelshaza", "Phantom Manifester Brelshaza"],
				difficulties: {
					[Difficulty.normal]: { itemlevel: 1670, rewards: { gold: 18500 } },
					[Difficulty.hard]: { itemlevel: 1690, rewards: { gold: 23000 } },
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
					[Difficulty.normal]: { itemlevel: 1680, rewards: { gold: 6000 } },
					[Difficulty.hard]: { itemlevel: 1700, rewards: { gold: 7000 } },
				},
			},
			G2: {
				bossName: ["Blossoming Fear, Naitreya"],
				difficulties: {
					[Difficulty.normal]: { itemlevel: 1680, rewards: { gold: 9500 } },
					[Difficulty.hard]: { itemlevel: 1700, rewards: { gold: 11000 } },
				},
			},
			G3: {
				bossName: ["Mordum, the Abyssal Punisher", "Mordum's Hammer", "Flash of Punishment"],
				difficulties: {
					[Difficulty.normal]: { itemlevel: 1680, rewards: { gold: 12500 } },
					[Difficulty.hard]: { itemlevel: 1700, rewards: { gold: 20000 } },
				},
			},
		},
	},
};
