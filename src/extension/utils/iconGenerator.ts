export class IconGenerator {

  // 5x7 pixel font patterns for digits 0-9
  private static readonly DIGIT_PATTERNS: { [key: string]: number[][] } = {
    '0': [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0]
    ],
    '1': [
      [0,0,1,0,0],
      [0,1,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,1,1,1,0]
    ],
    '2': [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [0,0,0,0,1],
      [0,0,0,1,0],
      [0,0,1,0,0],
      [0,1,0,0,0],
      [1,1,1,1,1]
    ],
    '3': [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [0,0,0,0,1],
      [0,0,1,1,0],
      [0,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0]
    ],
    '4': [
      [0,0,0,1,0],
      [0,0,1,1,0],
      [0,1,0,1,0],
      [1,0,0,1,0],
      [1,1,1,1,1],
      [0,0,0,1,0],
      [0,0,0,1,0]
    ],
    '5': [
      [1,1,1,1,1],
      [1,0,0,0,0],
      [1,1,1,1,0],
      [0,0,0,0,1],
      [0,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0]
    ],
    '6': [
      [0,0,1,1,0],
      [0,1,0,0,0],
      [1,0,0,0,0],
      [1,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0]
    ],
    '7': [
      [1,1,1,1,1],
      [0,0,0,0,1],
      [0,0,0,1,0],
      [0,0,1,0,0],
      [0,1,0,0,0],
      [0,1,0,0,0],
      [0,1,0,0,0]
    ],
    '8': [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,0]
    ],
    '9': [
      [0,1,1,1,0],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [0,1,1,1,1],
      [0,0,0,0,1],
      [0,0,0,1,0],
      [0,1,1,0,0]
    ]
  };

  // Draw pixel-based numbers using the font patterns with scaling for better readability
  private static drawNumber(data: Uint8ClampedArray, size: number, text: string, centerX: number, centerY: number, textColor: [number, number, number]) {
    const baseDigitWidth = 5;
    const baseDigitHeight = 7;
    const baseDigitSpacing = 1;
    
    // Calculate maximum possible scale that fits in the icon with minimal borders
    const baseTotalWidth = text.length * baseDigitWidth + (text.length - 1) * baseDigitSpacing;
    const maxPossibleScale = Math.floor(size / baseTotalWidth);
    
    // Use maximum scale possible for each case, but ensure it fits
    let scale = maxPossibleScale;
    if (text.length === 1) {
      scale = Math.min(6, maxPossibleScale); // Even larger for single digit
    } else if (text.length === 2) {
      scale = Math.min(5, maxPossibleScale); // Very large for two digits  
    } else if (text.length === 3) {
      scale = Math.min(4, maxPossibleScale); // Large for three digits
    }
    
    // Ensure minimum scale of 2
    scale = Math.max(2, scale);
    
    const finalDigitWidth = baseDigitWidth * scale;
    const finalDigitHeight = baseDigitHeight * scale;
    const finalDigitSpacing = baseDigitSpacing * scale;
    const finalTotalWidth = text.length * finalDigitWidth + (text.length - 1) * finalDigitSpacing;
    
    // Starting position to center the text (creates natural visual borders)
    const startX = centerX - Math.floor(finalTotalWidth / 2);
    const startY = centerY - Math.floor(finalDigitHeight / 2);
    
    for (let i = 0; i < text.length; i++) {
      const digit = text[i];
      const pattern = this.DIGIT_PATTERNS[digit];
      
      if (pattern) {
        const digitStartX = startX + i * (finalDigitWidth + finalDigitSpacing);
        
        // Draw each pixel of the digit, scaled up
        for (let row = 0; row < baseDigitHeight; row++) {
          for (let col = 0; col < baseDigitWidth; col++) {
            if (pattern[row] && pattern[row][col] === 1) {
              // Draw a scale x scale block for each original pixel
              for (let scaleY = 0; scaleY < scale; scaleY++) {
                for (let scaleX = 0; scaleX < scale; scaleX++) {
                  const pixelX = digitStartX + col * scale + scaleX;
                  const pixelY = startY + row * scale + scaleY;
                  
                  // Make sure pixel is within bounds
                  if (pixelX >= 0 && pixelX < size && pixelY >= 0 && pixelY < size) {
                    const pixelIndex = (pixelY * size + pixelX) * 4;
                    data[pixelIndex] = textColor[0];     // R
                    data[pixelIndex + 1] = textColor[1]; // G
                    data[pixelIndex + 2] = textColor[2]; // B
                    data[pixelIndex + 3] = 255;          // A
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  static async updateBrowserIcon(value: number): Promise<void> {
    try {
      console.log(`Generating icon for glucose value: ${value} mg/dL`);
      
      // Create ImageData manually for service worker compatibility
      const size = 32;
      const imageData = new ImageData(size, size);
      const data = imageData.data;

      // Determine colors based on glucose range
      let bgR = 76, bgG = 175, bgB = 80; // Normal (70-180) - Green
      let textR = 255, textG = 255, textB = 255; // White text
      
      if (value < 70) {
        bgR = 244; bgG = 67; bgB = 54; // Low - Red
        textR = 255; textG = 255; textB = 255; // White text on red
      } else if (value > 180) {
        bgR = 255; bgG = 152; bgB = 0; // High - Orange  
        textR = 0; textG = 0; textB = 0; // Black text on orange for better visibility
      }

      // Fill background with glucose status color
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const pixelIndex = (y * size + x) * 4;
          data[pixelIndex] = bgR;
          data[pixelIndex + 1] = bgG;
          data[pixelIndex + 2] = bgB;
          data[pixelIndex + 3] = 255;
        }
      }

      // Format the value for display
      const displayValue = value.toString();
      
      // Draw the glucose value using pixel-based font
      this.drawNumber(data, size, displayValue, size / 2, size / 2, [textR, textG, textB]);

      // Update browser action icon
      if (chrome.action && chrome.action.setIcon) {
        await chrome.action.setIcon({ 
          imageData: {
            32: imageData
          }
        });
        console.log(`✓ Updated browser icon showing "${displayValue}" (bg: rgb(${bgR},${bgG},${bgB}), text: rgb(${textR},${textG},${textB}))`);
      }

      // Update title with current value and status
      if (chrome.action && chrome.action.setTitle) {
        let status = 'Normal';
        if (value < 70) status = 'LOW';
        else if (value > 180) status = 'HIGH';
        
        await chrome.action.setTitle({ 
          title: `Glucose: ${value} mg/dL (${status})` 
        });
        console.log(`✓ Updated browser title: Glucose: ${value} mg/dL (${status})`);
      }
    } catch (error) {
      console.error('Failed to update browser icon:', error);
      // Fallback: Update title even if icon fails
      if (chrome.action && chrome.action.setTitle) {
        await chrome.action.setTitle({ 
          title: `Glucose: ${value} mg/dL` 
        });
      }
    }
  }
}