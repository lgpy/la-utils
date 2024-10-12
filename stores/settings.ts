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
});

export type SettingsState = z.infer<typeof zodSettings>;

export type SettingsActions = {
  setServer: (server: SettingsState["server"]) => void;
  setRosterGoldTotal: (
    rosterGoldTotal: SettingsState["rosterGoldTotal"],
  ) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

export const createSettingsStore = () =>
  createStore<SettingsStore>()(
    persist(
      (set) => ({
        server: undefined,
        rosterGoldTotal: "total",
        setServer(server) {
          set({ server });
        },
        setRosterGoldTotal(rosterGoldTotal) {
          set({ rosterGoldTotal });
        },
      }),
      {
        name: "settings",
        version: 1,
        migrate: (persistedState: any, version) => {
          if (version <= 0) {
            persistedState.rosterGoldTotal = "total";
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
