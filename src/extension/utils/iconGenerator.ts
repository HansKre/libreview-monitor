export class IconGenerator {
  static async updateBrowserIcon(value: number): Promise<void> {
    try {
      console.log(`Generating icon for glucose value: ${value} mg/dL`);

      const size = 32;
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error(
          "Failed to get 2D rendering context for OffscreenCanvas."
        );
        return;
      }

      // Determine colors based on glucose range
      let bgColor = "";
      let textColor = "";
      let status = "";

      if (value < 70) {
        bgColor = "#8B0000"; // Very low (<70) - Dark Red
        textColor = "#FFFFFF";
        status = "VERY LOW";
      } else if (value < 100) {
        bgColor = "#F44336"; // Low (70-99) - Red
        textColor = "#FFFFFF";
        status = "LOW";
      } else if (value >= 250) {
        bgColor = "#8B0000"; // Very high (250+) - Dark Red
        textColor = "#FFFFFF";
        status = "VERY HIGH";
      } else if (value >= 190) {
        bgColor = "#F44336"; // High (190-249) - Red
        textColor = "#FFFFFF";
        status = "HIGH";
      } else if (value >= 156) {
        bgColor = "#FF9800"; // Elevated (156-189) - Orange
        textColor = "#000000"; // Black text on orange for better visibility
        status = "ELEVATED";
      } else {
        bgColor = "#4CAF50"; // Normal (100-155) - Green
        textColor = "#FFFFFF";
        status = "Normal";
      }

      // Fill the entire canvas with the background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size); // Fills the entire 32x32 area

      // Set text properties
      let fontSize = 20; // Start with a desired font size
      const displayValue = value.toString();
      const textPadding = 1; // Desired padding from the icon border

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;

      // Dynamically adjust font size to ensure it fits with padding
      do {
        ctx.font = `bold ${fontSize}px Arial`;
        const textMetrics = ctx.measureText(displayValue);
        // Check if text width with padding exceeds canvas width
        if (textMetrics.width + 2 * textPadding <= size) {
          break; // Text fits, exit loop
        }
        fontSize--; // Reduce font size
      } while (fontSize > 10); // Don't go below a reasonable minimum font size

      // Draw the glucose value centered within the entire icon
      ctx.fillText(displayValue, size / 2, size / 2 + 1); // +1 for slight vertical adjustment

      // Get ImageData from the canvas
      const imageData = ctx.getImageData(0, 0, size, size);

      // Update browser action icon
      if (chrome.action && chrome.action.setIcon) {
        await chrome.action.setIcon({
          imageData: {
            [size]: imageData,
          },
        });
        console.log(
          `✓ Updated browser icon showing "${displayValue}" (bg: ${bgColor}, text: ${textColor})`
        );
      }

      // Update title with current value and status
      if (chrome.action && chrome.action.setTitle) {
        await chrome.action.setTitle({
          title: `Glucose: ${value} mg/dL (${status})`,
        });
        console.log(
          `✓ Updated browser title: Glucose: ${value} mg/dL (${status})`
        );
      }
    } catch (error) {
      console.error("Failed to update browser icon:", error);
      // Fallback: Update title even if icon fails
      if (chrome.action && chrome.action.setTitle) {
        await chrome.action.setTitle({
          title: `Glucose: ${value} mg/dL`,
        });
      }
    }
  }
}
