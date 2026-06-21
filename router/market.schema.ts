import { ServerRegion } from "@/prisma/generated/enums";
import * as v from 'valibot';

export const getMarketPricesSchema = v.object({
	server: v.enum(ServerRegion),
});
