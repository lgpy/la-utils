import * as v from 'valibot';

const zPrices_v0_state = v.object({
  prices: v.map(v.unknown(), v.object({
    id: v.string(),
    price: v.pipe(v.number(), v.minValue(0)),
    updatedOn: v.string(),
  })),
  lastFetch: v.optional(v.string()),
});

const zPrices_v1_state = v.object({
  ...zPrices_v0_state.entries,
  prices: v.map(
    v.string(),
    v.object({
      price: v.pipe(v.number(), v.minValue(0)),
      updatedOn: v.string(),
    })
  ),
});

const zPrices_v2_state = v.object({
  ...zPrices_v1_state.entries,
  prices: v.map(
    v.string(),
    v.object({
      price: v.pipe(v.number(), v.minValue(0)),
      updatedOn: v.number(),
    })
  ),
  lastFetch: v.optional(v.number()),
});

export {
  zPrices_v0_state,
  zPrices_v1_state,
  zPrices_v2_state,
  zPrices_v2_state as zPrices_current_state,
}
