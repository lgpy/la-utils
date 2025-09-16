import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Lost Ark Utils",
		short_name: "LoA Utils",
		start_url: "/",
		description: "A set of utilities for Lost Ark",
		display: "fullscreen",
		background_color: "#1e2030",
		theme_color: "#181928",
		icons: [
			{
				src: "/favicon_144x144.png",
				sizes: "144x144",
				type: "image/png",
			},
		],
	};
}
