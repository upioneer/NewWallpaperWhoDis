// Core utility for determining standard aspect ratios and orientations

export type Orientation = "Landscape" | "Portrait" | "Square" | "Panoramic" | "Ultra-Wide";
export type AspectRatioBucket = "16:9" | "16:10" | "4:3" | "21:9" | "32:9" | "1:1" | "Mobile (19.5:9)" | "Mobile (18:9)" | "Custom";

export interface DimensionsData {
    width: number;
    height: number;
    orientation: Orientation;
    aspectRatioBucket: AspectRatioBucket;
}

export function categorizeDimensions(width: number, height: number): DimensionsData {
    const ratio = width / height;
    let orientation: Orientation = "Square";

    if (ratio > 1.2) {
        if (ratio > 2.5) {
            orientation = "Ultra-Wide"; // e.g. multi-monitor
        } else if (ratio > 2.0) {
            orientation = "Panoramic"; // e.g. 21:9 movies
        } else {
            orientation = "Landscape";
        }
    } else if (ratio < 0.8) {
        orientation = "Portrait";
    }

    // Define target standard ratios to bucket into.
    // Using an array of known standards to test against (Landscape ratios)
    // For portrait images, we flip the ratio to test against standard monitor ratios
    const testRatio = width > height ? ratio : height / width;

    const standards = [
        { name: "16:9", value: 16 / 9 },        // 1.777...
        { name: "16:10", value: 16 / 10 },      // 1.6
        { name: "4:3", value: 4 / 3 },          // 1.333...
        { name: "21:9", value: 21 / 9 },        // 2.333...
        { name: "32:9", value: 32 / 9 },        // 3.555...
        { name: "1:1", value: 1 / 1 },          // 1.0
        { name: "Mobile (19.5:9)", value: 19.5 / 9 }, // 2.166... (Modern iPhones)
        { name: "Mobile (18:9)", value: 18 / 9 }      // 2.0 (Generic modern mobile)
    ];

    const TOLERANCE = 0.05; // 5% tolerance
    let bucket: AspectRatioBucket = "Custom";

    for (const std of standards) {
        // Check if the actual ratio is within 5% of the standard ratio
        if (Math.abs(testRatio - std.value) / std.value <= TOLERANCE) {
            bucket = std.name as AspectRatioBucket;
            break;
        }
    }

    if (orientation === "Square") bucket = "1:1";

    return {
        width,
        height,
        orientation,
        aspectRatioBucket: bucket,
    };
}

// Master Palette for categorizing raw hex codes into human-readable buckets
export const COLOR_BUCKETS = [
    { name: "Red", hex: "#FF0000" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Amber", hex: "#FFBF00" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Lime", hex: "#80FF00" },
    { name: "Green", hex: "#008000" },
    { name: "Cyan", hex: "#00FFFF" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Indigo", hex: "#4B0082" },
    { name: "Violet", hex: "#EE82EE" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Slate", hex: "#708090" }
];

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Calculates raw 3D Euclidean distance between two RGB colors
export function categorizeColor(hexColor: string): string {
    const target = hexToRgb(hexColor);
    let closestBucket = COLOR_BUCKETS[0].name;
    let minDistance = Infinity;

    for (const bucket of COLOR_BUCKETS) {
        const rgb = hexToRgb(bucket.hex);
        // Simple Euclidean Distance formula
        const distance = Math.sqrt(
            Math.pow(target.r - rgb.r, 2) +
            Math.pow(target.g - rgb.g, 2) +
            Math.pow(target.b - rgb.b, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestBucket = bucket.name;
        }
    }

    return closestBucket;
}

// Calculates standard relative luminance (0 to 1) and thresholds it at 0.5
export function determineLuminosity(rMean: number, gMean: number, bMean: number): "Light" | "Dark" {
    // Relative luminance formula follows WCAG standards
    const luminance = (0.2126 * rMean + 0.7152 * gMean + 0.0722 * bMean) / 255;
    return luminance > 0.5 ? "Light" : "Dark";
}
