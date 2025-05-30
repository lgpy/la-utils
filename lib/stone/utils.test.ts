import { expect, test } from "bun:test";
import { rgbToHsl } from "./utils";

test("rgbToHsl converts RGB to HSL", () => {
	expect(rgbToHsl(255, 0, 0)).toEqual([0, 100, 50]);
	expect(rgbToHsl(0, 255, 0)).toEqual([120, 100, 50]);
	expect(rgbToHsl(0, 0, 255)).toEqual([240, 100, 50]);
	expect(rgbToHsl(255, 255, 255)).toEqual([0, 0, 100]);
	expect(rgbToHsl(0, 0, 0)).toEqual([0, 0, 0]);
});
