import z from "zod";

const zPrices_v0_state = z.object({
  prices: z.map(z.unknown(), z.object({
    id: z.string(),
    price: z.number().nonnegative(),
    updatedOn: z.string(),
  })),
  lastFetch: z.string().optional(),
});

const zPrices_v1_state = zPrices_v0_state.extend({
  prices: z.map(
    z.string(),
    z.object({
      price: z.number().nonnegative(),
      updatedOn: z.string(),
    })
  ),
});

const zPrices_v2_state = zPrices_v1_state.extend({
  prices: z.map(
    z.string(),
    z.object({
      price: z.number().nonnegative(),
      updatedOn: z.number(),
    })
  ),
  lastFetch: z.number().optional(),
});

export {
  zPrices_v0_state,
  zPrices_v1_state,
  zPrices_v2_state,
  zPrices_v2_state as zPrices_current_state,
}
