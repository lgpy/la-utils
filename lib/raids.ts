import { DateTime } from "luxon";

export enum Difficulty {
  normal = "Normal",
  hard = "Hard",
}

export const shortenDifficulty = (difficulty: Difficulty) => {
  switch (difficulty) {
    case Difficulty.normal:
      return "NM";
    case Difficulty.hard:
      return "HM";
  }
};

export const shortestDifficulty = (difficulty: Difficulty) => {
  switch (difficulty) {
    case Difficulty.normal:
      return "N";
    case Difficulty.hard:
      return "H";
  }
};

export const isGateCompleted = (
  dateRaidWasComplete: DateTime,
  latestReset: DateTime,
) => {
  return latestReset < dateRaidWasComplete;
};

export const raids: Record<
  string,
  {
    name: string;
    gates: Record<
      string,
      {
        difficulties: Partial<
          Record<Difficulty, { itemlevel: number; rewards: { gold: number } }>
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
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1415,
            rewards: { gold: 300 },
          },
          [Difficulty.hard]: {
            itemlevel: 1445,
            rewards: { gold: 400 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1415,
            rewards: { gold: 450 },
          },
          [Difficulty.hard]: {
            itemlevel: 1445,
            rewards: { gold: 700 },
          },
        },
      },
    },
  },
  vykas: {
    name: "Vykas",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1430,
            rewards: { gold: 350 },
          },
          [Difficulty.hard]: {
            itemlevel: 1460,
            rewards: { gold: 500 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1430,
            rewards: { gold: 650 },
          },
          [Difficulty.hard]: {
            itemlevel: 1460,
            rewards: { gold: 1000 },
          },
        },
      },
    },
  },
  kakul: {
    name: "Kakul-Saydon",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1475,
            rewards: { gold: 400 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1475,
            rewards: { gold: 600 },
          },
        },
      },
      G3: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1475,
            rewards: { gold: 1000 },
          },
        },
      },
    },
  },
  brel: {
    name: "Brelshaza",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1490,
            rewards: { gold: 1000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1540,
            rewards: { gold: 1200 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1490,
            rewards: { gold: 1000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1540,
            rewards: { gold: 1200 },
          },
        },
      },
      G3: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1500,
            rewards: { gold: 1000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1550,
            rewards: { gold: 1200 },
          },
        },
      },
      G4: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1520,
            rewards: { gold: 1600 },
          },
          [Difficulty.hard]: {
            itemlevel: 1560,
            rewards: { gold: 2000 },
          },
        },
        isBiWeekly: "even",
      },
    },
  },
  kayangel: {
    name: "Kayangel",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1540,
            rewards: { gold: 800 },
          },
          [Difficulty.hard]: {
            itemlevel: 1580,
            rewards: { gold: 1000 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1540,
            rewards: { gold: 1200 },
          },
          [Difficulty.hard]: {
            itemlevel: 1580,
            rewards: { gold: 1600 },
          },
        },
      },
      G3: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1540,
            rewards: { gold: 1600 },
          },
          [Difficulty.hard]: {
            itemlevel: 1580,
            rewards: { gold: 2200 },
          },
        },
      },
    },
  },
  akkan: {
    name: "Akkan",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1580,
            rewards: { gold: 1000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1600,
            rewards: { gold: 2250 }, //TODO: Check this value
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1580,
            rewards: { gold: 1800 },
          },
          [Difficulty.hard]: {
            itemlevel: 1600,
            rewards: { gold: 2750 }, //TODO: Check this value
          },
        },
      },
      G3: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1580,
            rewards: { gold: 2600 },
          },
          [Difficulty.hard]: {
            itemlevel: 1600,
            rewards: { gold: 6000 }, //TODO: Check this value
          },
        },
      },
    },
  },
  voldis: {
    name: "Voldis",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1600,
            rewards: { gold: 1500 },
          },
          [Difficulty.hard]: {
            itemlevel: 1610,
            rewards: { gold: 3000 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1600,
            rewards: { gold: 2000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1610,
            rewards: { gold: 4000 },
          },
        },
      },
      G3: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1600,
            rewards: { gold: 3000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1610,
            rewards: { gold: 6000 },
          },
        },
      },
    },
  },
  thaemine: {
    name: "Thaemine",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1610,
            rewards: { gold: 3500 },
          },
          [Difficulty.hard]: {
            itemlevel: 1620,
            rewards: { gold: 5000 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1610,
            rewards: { gold: 4000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1620,
            rewards: { gold: 6000 },
          },
        },
      },
      G3: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1610,
            rewards: { gold: 5500 },
          },
          [Difficulty.hard]: {
            itemlevel: 1620,
            rewards: { gold: 9000 },
          },
        },
      },
      G4: {
        difficulties: {
          [Difficulty.hard]: {
            itemlevel: 1620,
            rewards: { gold: 21000 },
          },
        },
        isBiWeekly: "odd",
      },
    },
  },
  echidna: {
    name: "Echidna",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1620,
            rewards: { gold: 6000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1630,
            rewards: { gold: 7000 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1620,
            rewards: { gold: 10000 },
          },
          [Difficulty.hard]: {
            itemlevel: 1630,
            rewards: { gold: 12500 },
          },
        },
      },
    },
  },
  behemoth: {
    name: "Behemoth",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1620,
            rewards: { gold: 6500 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1620,
            rewards: { gold: 11500 },
          },
        },
      },
    },
  },
  aegir: {
    name: "Aegir",
    gates: {
      G1: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1660,
            rewards: { gold: 7500 },
          },
          [Difficulty.hard]: {
            itemlevel: 1680,
            rewards: { gold: 9000 },
          },
        },
      },
      G2: {
        difficulties: {
          [Difficulty.normal]: {
            itemlevel: 1660,
            rewards: { gold: 15500 },
          },
          [Difficulty.hard]: {
            itemlevel: 1680,
            rewards: { gold: 18500 },
          },
        },
      },
    },
  },
};
