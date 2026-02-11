import { ServerRegion } from "@/prisma/generated/enums";
import z from "zod";

export const getMarketPricesSchema = z.object({
	server: z.nativeEnum(ServerRegion),
});
