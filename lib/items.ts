import { PricesStore } from "@/stores/prices";
import { DateTime } from "luxon";

export const isBadPriceItem = (
  item: PricesStore["prices"][number] | undefined,
) => {
  if (item === undefined) {
    return "This item does not exist";
  }

  if (item.price === 0) {
    return "This item has a price of 0";
  }

  const lastUpdated = DateTime.fromISO(item.updatedOn);

  if (lastUpdated.diffNow("days").days > 3) {
    return "This item has not been updated in over 3 days";
  }

  return null;
};
