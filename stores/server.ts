import { z } from "zod";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";

const zodServer = z.object({
  name: z
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

export type ServerState = z.infer<typeof zodServer>;

export type ServerActions = {
  setServer: (name: ServerState["name"]) => void;
};

export type ServerStore = ServerState & ServerActions;

export const createServerStore = () =>
  createStore<ServerStore>()(
    persist(
      (set) => ({
        name: undefined,
        setServer(name: ServerState["name"]) {
          set({ name });
        },
      }),
      {
        name: "server",
      },
    ),
  );

export type SetType = (
  partial:
    | ServerStore
    | Partial<ServerStore>
    | ((state: ServerStore) => ServerStore | Partial<ServerStore>),
  replace?: boolean | undefined,
) => void;
