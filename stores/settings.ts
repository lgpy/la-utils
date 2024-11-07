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
        },
        setServer(server) {
          set({ server });
        },
        setRosterGoldTotal(rosterGoldTotal) {
          set({ rosterGoldTotal });
        },
        toggleExperiments(key, value) {
          set({
            experiments: {
              [key]: value,
            },
          });
        },
      }),
      {
        name: "settings",
        version: 2,
        migrate: (persistedState: any, version) => {
          if (version <= 0) {
            persistedState.rosterGoldTotal = "total";
          }
          if (version <= 1) {
            persistedState.experiments = {
              buttonV2: false,
            };
          }
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
