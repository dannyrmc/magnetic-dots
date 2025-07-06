import { FOUR_PATH, ZERO_PATH } from "@/lib/svg-paths";
import type { Dot } from "@/lib/types";

export const generateDots = (
  width: number,
  height: number,
  isInitialAnimation: boolean
): Dot[] => {
  // Create an offscreen canvas to draw and sample from
  const offscreen = document.createElement("canvas");
  const offscreenCtx = offscreen.getContext("2d");
  if (!offscreenCtx) return [];

  // Set size for the sampling canvas - using a consistent size for sampling
  const samplingWidth = 1000; // Fixed width for consistent sampling
  const samplingHeight = Math.floor((samplingWidth / width) * height);
  offscreen.width = samplingWidth;
  offscreen.height = samplingHeight;

  // Calculate scaling factor based on container size
  const svgHeight = 190; // Height of the SVG paths
  const svgWidth = 400; // Approximate width needed for all three digits

  const scale =
    Math.min(samplingWidth / svgWidth, samplingHeight / svgHeight) * 0.8;
  const dotSize = Math.max(1.5, Math.min(2, width / 400));

  // Center the digits in the sampling canvas
  const centerX = samplingWidth / 2;
  const centerY = samplingHeight / 2;

  // Clear the canvas
  offscreenCtx.fillStyle = "white";
  offscreenCtx.fillRect(0, 0, samplingWidth, samplingHeight);

  // Draw the paths filled in black
  offscreenCtx.fillStyle = "black";

  // Draw the first "4"
  offscreenCtx.save();
  offscreenCtx.translate(centerX - scale * 180, centerY);
  offscreenCtx.scale(scale, scale);
  offscreenCtx.translate(-60, -91.5); // Center the digit
  const firstFourPath = new Path2D(FOUR_PATH);
  offscreenCtx.fill(firstFourPath);
  offscreenCtx.restore();

  // Draw the "0"
  offscreenCtx.save();
  offscreenCtx.translate(centerX, centerY);
  offscreenCtx.scale(scale, scale);
  offscreenCtx.translate(-72, -91.5); // Center the digit
  const zeroPath = new Path2D(ZERO_PATH);
  offscreenCtx.fill(zeroPath);
  offscreenCtx.restore();

  // Draw the second "4"
  offscreenCtx.save();
  offscreenCtx.translate(centerX + scale * 180, centerY);
  offscreenCtx.scale(scale, scale);
  offscreenCtx.translate(-80, -91.5); // Center the digit
  const secondFourPath = new Path2D(FOUR_PATH);
  offscreenCtx.fill(secondFourPath);
  offscreenCtx.restore();

  // Sample points from the filled paths with fixed density
  const imageData = offscreenCtx.getImageData(
    0,
    0,
    samplingWidth,
    samplingHeight,
  );
  const dots: Dot[] = [];

  // Fixed dot density for consistent appearance
  const dotDensity = 9; // Lower number = more dots

  for (let y = 0; y < samplingHeight; y += dotDensity) {
    for (let x = 0; x < samplingWidth; x += dotDensity) {
      const index = (y * samplingWidth + x) * 4;
      if (index < imageData.data.length && imageData.data[index] < 128) {
        // Black pixels have low values
        // Map sampling coordinates back to actual canvas coordinates
        const canvasX = (x / samplingWidth) * width;
        const canvasY = (y / samplingHeight) * height;

        // If this is the initial animation, scatter the dots randomly
        let startX = canvasX;
        let startY = canvasY;

        if (isInitialAnimation) {
          // Scatter within the full container area
          startX = Math.random() * width;
          startY = Math.random() * height;
        }

        dots.push({
          x: startX,
          y: startY,
          vx: 0,
          vy: 0,
          baseX: canvasX,
          baseY: canvasY,
          size: dotSize,
          lastForced: 0,
          // Random assembly delay between 0-800ms for staggered animation
          assemblyDelay: Math.random() * 400,
        });
      }
    }
  }

  return dots;
};