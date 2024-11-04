// Function to generate a random color in hex format
export function getRandomColor() {
    // Generate a random hue between 0 and 360 degrees
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70; // 70% saturation for vivid colors
    const lightness = 50;  // 50% lightness for balanced brightness

    // Convert HSL to RGB
    const rgb = hslToRgb(hue / 360, saturation / 100, lightness / 100);

    // Convert RGB to Hex
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

// Helper function to convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // Achromatic (gray)
    } else {
        const hue2rgb = function(p: number, q: number, t: number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Helper function to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}
