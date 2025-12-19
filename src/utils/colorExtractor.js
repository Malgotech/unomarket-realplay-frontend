import ColorThief from 'colorthief';

/**
 * Convert RGB array to hex color code
 * @param {Array} rgb - RGB array [r, g, b]
 * @returns {String} Hex color code
 */
const rgbToHex = (rgb) => {
  return '#' + rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Extracts dominant colors from an image
 * @param {String} imageUrl - URL of the image
 * @returns {Promise<{primary: String, secondary: String}>} Primary and secondary colors in hex format
 */
export const extractColors = (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve({ primary: '#d4162c', secondary: '#ffdb58' }); // Default colors if no image
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img, 4); // Get 4 dominant colors
        
        // First color is usually the most dominant
        const primary = rgbToHex(palette[0]);
        
        // Find a good contrasting secondary color
        // We'll use the second most dominant color that has enough contrast
        let secondary;
        for (let i = 1; i < palette.length; i++) {
          secondary = rgbToHex(palette[i]);
          // If we have enough color difference, use it
          if (colorDifference(palette[0], palette[i]) > 75) {
            break;
          }
        }

        resolve({ primary, secondary });
      } catch (error) {
        console.error("Error extracting colors:", error);
        resolve({ primary: '#d4162c', secondary: '#ffdb58' }); // Fallback to defaults
      }
    };

    img.onerror = () => {
      console.error("Failed to load image for color extraction");
      resolve({ primary: '#d4162c', secondary: '#ffdb58' }); // Fallback to defaults
    };
  });
};

/**
 * Calculate color difference to ensure good contrast
 * @param {Array} rgb1 - First RGB color array
 * @param {Array} rgb2 - Second RGB color array
 * @returns {Number} Color difference value
 */
const colorDifference = (rgb1, rgb2) => {
  return Math.abs(rgb1[0] - rgb2[0]) + Math.abs(rgb1[1] - rgb2[1]) + Math.abs(rgb1[2] - rgb2[2]);
};

/**
 * Check if a color is dark
 * @param {String} hexColor - Hex color code
 * @returns {Boolean} True if color is dark
 */
export const isDarkColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate perceived brightness (YIQ equation)
  // https://www.w3.org/TR/AERT/#color-contrast
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return brightness < 128; // Less than 128 is considered dark
};