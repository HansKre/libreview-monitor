export class IconGenerator {

  static async updateBrowserIcon(value: number): Promise<void> {
    try {
      // Create simple colored icon based on glucose value
      const size = 32;
      const imageData = new ImageData(size, size);
      const data = imageData.data;

      // Determine color based on glucose range
      let r = 76, g = 175, b = 80; // Normal (green)
      
      if (value < 70) {
        r = 244; g = 67; b = 54; // Low (red)
      } else if (value > 180) {
        r = 255; g = 152; b = 0; // High (orange)
      }

      // Create a simple circular icon
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - 2;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          const pixelIndex = (y * size + x) * 4;

          if (distance <= radius) {
            // Inside circle - use glucose color
            data[pixelIndex] = r;     // Red
            data[pixelIndex + 1] = g; // Green
            data[pixelIndex + 2] = b; // Blue
            data[pixelIndex + 3] = 255; // Alpha
          } else {
            // Outside circle - transparent
            data[pixelIndex + 3] = 0;
          }
        }
      }

      // Update browser action icon
      if (chrome.action && chrome.action.setIcon) {
        await chrome.action.setIcon({ 
          imageData: {
            32: imageData
          }
        });
        console.log(`Updated browser icon for glucose value: ${value} mg/dL`);
      }

      // Update title with current value
      if (chrome.action && chrome.action.setTitle) {
        await chrome.action.setTitle({ 
          title: `Glucose: ${value} mg/dL` 
        });
        console.log(`Updated browser title for glucose value: ${value} mg/dL`);
      }
    } catch (error) {
      console.error('Failed to update browser icon:', error);
    }
  }
}