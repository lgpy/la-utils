import { ItemId } from "../game-info";

export const itemSlugs: ItemId[] = [
	"abidos-wild-flower",
	"bright-wild-flower",
	"shy-wild-flower",
	"wild-flower",
	"abidos-timber",
	"sturdy-timber",
	"tender-timber",
	"timber",
	"abidos-iron-ore",
	"heavy-iron-ore",
	"iron-ore",
	"strong-iron-ore",
	"abidos-thick-raw-meat",
	"oreha-thick-meat",
	"thick-raw-meat",
	"treated-meat",
	"abidos-solar-carp",
	"fish",
	"oreha-solar-carp",
	"redflesh-fish",
	"abidos-relic",
	"ancient-relic",
	"oreha-relic",
	"rare-relic",

	"oreha-fusion-material",
	"superior-oreha-fusion-material",
	"prime-oreha-fusion-material",
	"abidos-fusion-material",

	"marvelous-honor-leapstone",
	"radiant-honor-leapstone",

	"honor-shard-pouch-s",
	"honor-shard-pouch-m",
	"honor-shard-pouch-l",

	"destiny-shard-pouch-s",
	"destiny-shard-pouch-m",

	"solar-grace",
	"solar-blessing",
	"solar-protection",
	"glaciers-breath",
	"lavas-breath",

	"natural-pearl",
	"tough-leather",
];

export function containsSlug(slug: string): boolean {
	return itemSlugs.includes(slug as ItemId);
}
