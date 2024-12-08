import { z } from "zod";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";

const zodSettings = z.object({
  server: z
    .enum([
      "Thaemine",
      "Brelshaza",
      "Luterra",
      "Balthorr",
      "Nineveh",
      "Inanna",
      "Vairgrys",
      "Ortuus",
      "Elpon",
      "Ratik",
      "Arcturus",
      "Gienah",
    ])
    .optional(),
  rosterGoldTotal: z.enum(["total", "remaining"]),
  experiments: z.object({
    buttonV2: z.boolean(),
    ignoreThaemineIfNoG4: z.boolean(),
    compactRaidCard: z.boolean(),
  }),
});

export type SettingsState = z.infer<typeof zodSettings>;

export type SettingsActions = {
  setServer: (server: SettingsState["server"]) => void;
  setRosterGoldTotal: (
    rosterGoldTotal: SettingsState["rosterGoldTotal"],
  ) => void;
  toggleExperiments: (
    key: keyof SettingsState["experiments"],
    value: boolean,
  ) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

export const createSettingsStore = () =>
  createStore<SettingsStore>()(
    persist(
      (set) => ({
        server: undefined,
        rosterGoldTotal: "total",
        experiments: {
          buttonV2: false,
          ignoreThaemineIfNoG4: false,
          compactRaidCard: false,
        },
        setServer(server) {
          set({ server });
        },
        setRosterGoldTotal(rosterGoldTotal) {
          set({ rosterGoldTotal });
        },
        toggleExperiments(key, value) {
          set((state) => ({
            experiments: {
              ...state.experiments,
              [key]: value,
            },
          }));
        },
      }),
      {
        name: "settings",
        version: 4,
        migrate: (ps: any, version) => {
          if (version <= 0) ps.rosterGoldTotal = "total";
          if (ps.experiments === undefined) ps.experiments = {};
          if (version <= 1) ps.experiments.buttonV2 = false;
          if (version <= 2) ps.experiments.ignoreThaemineIfNoG4 = false;
          if (version <= 3) ps.experiments.compactRaidCard = false;
          return ps;
        },
      },
    ),
  );

export type SetType = (
  partial:
    | SettingsStore
    | Partial<SettingsStore>
    | ((state: SettingsStore) => SettingsStore | Partial<SettingsStore>),
  replace?: boolean | undefined,
) => void;
