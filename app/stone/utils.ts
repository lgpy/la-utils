import { cn } from "@/lib/utils";

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation [h_degrees, s_0_to_1, l_0_to_1]
 */
export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    if (h === undefined) h = 0; // Should ideally not happen if max !== min
    h /= 6;
  }

  return [h * 360, s, l]; // Return H in degrees (0-360), S and L as 0-1
}

/**
 * Differentiates a pixel's color based on its RGB values.
 *
 * @param   Number  h       The hue component (0-360 degrees)
 * @param   Number  s       The saturation component (0-1)
 * @param   Number  l       The lightness component (0-1)
 * @return  String          The name of the color category
 */
export function classifyPixelColor(h: number, s: number, l: number) {

  // 1. Black (very low lightness, low saturation)
  if (s > 0.9 && l < 0.15) {
    return "black";
  }
  // 2. Grey (low saturation, not black, not overly light)
  else if (s < 0.20 && l >= 0.10 && l < 0.75) {
    return "grey";
  }
  // 3. Red (includes peachy/salmon tones)
  else if (((h >= 0 && h < 30) || (h >= 330 && h <= 360)) && s > 0.25 && l > 0.20) {
    return "red";
  }
  // 4. Turquoise/Light Blue (includes light teals)
  else if ((h >= 160 && h <= 220) && s > 0.30 && l >= 0.35) {
    return "blue";
  }
  // 5. Dark Blue (lower lightness blues)
  else if ((h >= 190 && h <= 260) && s > 0.35 && l < 0.35 && l > 0.05) {
    return "blue";
  }

  return null; // If none of the above categories match
}


export const getColorClasses = (status: string | undefined, isBlueLine: boolean) => ({
  background: cn("", {
    "bg-red": status === "success" && !isBlueLine,
    "bg-blue": status === "success" && isBlueLine,
    "bg-surface2": status === "failure",
  }),
});
