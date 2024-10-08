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
});

export type SettingsState = z.infer<typeof zodSettings>;

export type SettingsActions = {
  setServer: (server: SettingsState["server"]) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

export const createSettingsStore = () =>
  createStore<SettingsStore>()(
    persist(
      (set) => ({
        server: undefined,
        setServer(server) {
          set({ server });
        },
      }),
      {
        name: "settings",
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
