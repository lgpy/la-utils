import { ServerRegion } from "@/generated/prisma";
import z from "zod";

export const getMarketPricesSchema = z.object({
	server: z.nativeEnum(ServerRegion),
});
