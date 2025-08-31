export class IconGenerator {
  // No need for DIGIT_PATTERNS anymore!

  static async updateBrowserIcon(value: number): Promise<void> {
    try {
      console.log(`Generating icon for glucose value: ${value} mg/dL`);

      const size = 32;
      const canvas = new OffscreenCanvas(size, size); // Use OffscreenCanvas for service workers
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

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // Set text properties
      ctx.font = "bold 20px Arial"; // Increased font size and made it bold for better visibility
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;

      // Draw the glucose value
      const displayValue = value.toString();
      ctx.fillText(displayValue, size / 2, size / 2 + 1); // +1 for slight vertical adjustment

      // Get ImageData from the canvas
      const imageData = ctx.getImageData(0, 0, size, size);

      // Update browser action icon
      if (chrome.action && chrome.action.setIcon) {
        await chrome.action.setIcon({
          imageData: {
            [size]: imageData, // Use [size] for dynamic key
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
