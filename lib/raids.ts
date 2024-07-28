import { DateTime } from "luxon";

import { hasReset } from "./dates";

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

export const getRaidsFilteredByIlvl = (itemLevel: number) => {
  const filteredGates = raids.map((r) => {
    return {
      ...r,
      gates: Object.keys(r.gates).reduce((acc, key) => {
        const gate = r.gates[key];
        const itemLevels = gate.itemlevel.filter((il) => il !== null);

        if (itemLevels.length === 0) return acc;

        const filteredItemLevels = itemLevels.filter((il) => il! <= itemLevel);

        if (filteredItemLevels.length === 0) return acc;

        return {
          ...acc,
          [key]: {
            itemlevel: filteredItemLevels,
          },
        };
      }, {} as typeof r.gates),
    };
  });

  return filteredGates.filter((r) => Object.keys(r.gates).length > 0);
};

export const isGateCompleted = (
  raidId: string,
  gateId: string,
  date: DateTime,
) => {
  const r = raids.find((r) => r.id === raidId);
  if (!r) return false;
  const g = r.gates[gateId];
  return g.hasReset ? !g.hasReset(date) : !hasReset(date);
};

export const raids: {
  id: string;
  name: string;
  difficulties: Difficulty[];
  gates: {
    [key: string]: {
      itemlevel: (number | null)[];
      hasReset?: (date: DateTime) => boolean;
    };
  };
}[] = [
  {
    id: "valtan",
    name: "Valtan",
    difficulties: [Difficulty.normal, Difficulty.hard],
    gates: {
      G1: {
        itemlevel: [1415, 1445],
      },
      G2: {
        itemlevel: [1415, 1445],
      },
    },
  },
  {
    id: "vykas",
    name: "Vykas",
    difficulties: [Difficulty.normal, Difficulty.hard],
    gates: {
      G1: {
        itemlevel: [1430, 1460],
      },
      G2: {
        itemlevel: [1430, 1460],
      },
    },
  },
  {
    id: "kakul",
    name: "Kakul-Saydon",
    difficulties: [Difficulty.normal],
    gates: {
      G1: {
        itemlevel: [1475],
      },
      G2: {
        itemlevel: [1475],
      },
      G3: {
        itemlevel: [1475],
      },
    },
  },
  {
    id: "brel",
    name: "Brelshaza",
    difficulties: [Difficulty.normal, Difficulty.hard],
    gates: {
      G1: {
        itemlevel: [1490, 1540],
      },
      G2: {
        itemlevel: [1490, 1540],
      },
      G3: {
        itemlevel: [1500, 1550],
      },
      G4: {
        itemlevel: [1520, 1560],
        hasReset: (date) => hasReset(date, "even"),
      },
    },
  },
  {
    id: "kayangel",
    name: "Kayangel",
    difficulties: [Difficulty.normal, Difficulty.hard],
    gates: {
      G1: {
        itemlevel: [1540, 1580],
      },
      G2: {
        itemlevel: [1540, 1580],
      },
      G3: {
        itemlevel: [1540, 1580],
      },
    },
  },
  {
    id: "akkan",
    name: "Akkan",
    difficulties: [Difficulty.normal, Difficulty.hard],
    gates: {
      G1: {
        itemlevel: [1580, 1600],
      },
      G2: {
        itemlevel: [1580, 1600],
      },
      G3: {
        itemlevel: [1580, 1600],
      },
    },
  },
  {
    id: "voldis",
    name: "Voldis",
    difficulties: [Difficulty.normal, Difficulty.hard],
    gates: {
      G1: {
        itemlevel: [1600, 1620],
      },
      G2: {
        itemlevel: [1600, 1620],
      },
      G3: {
        itemlevel: [1600, 1620],
      },
    },
  },
  {
    id: "thaemine",
    name: "Thaemine",
    difficulties: [Difficulty.normal, Difficulty.hard],
    gates: {
      G1: {
        itemlevel: [1610, 1630],
      },
      G2: {
        itemlevel: [1610, 1630],
      },
      G3: {
        itemlevel: [1610, 1630],
      },
      G4: {
        itemlevel: [null, 1630],
        hasReset: (date) => hasReset(date, "odd"),
      },
    },
  },
  {
    id: "echidna",
    name: "Echidna",
    difficulties: [Difficulty.normal, Difficulty.hard],
    gates: {
      G1: {
        itemlevel: [1620, 1630],
      },
      G2: {
        itemlevel: [1620, 1630],
      },
    },
  },
];
