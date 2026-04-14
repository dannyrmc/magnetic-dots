import type { Dot, MouseState } from "@/lib/types";
import type { RefObject, MutableRefObject } from "react";

interface AnimationParams {
  dots: Dot[];
  mouseState: MouseState;
  prevMouseState: MouseState;
  mouseMovedRef: MutableRefObject<boolean>;
  containerRef: RefObject<HTMLDivElement>;
  initialAnimationRef: MutableRefObject<boolean>;
  startTimeRef: MutableRefObject<number>;
  ctx: CanvasRenderingContext2D;
  cursorCtx: CanvasRenderingContext2D;
  animationSpeed?: number; // Add animation speed parameter
}

export const animateDots = ({
  dots,
  mouseState,
  prevMouseState,
  mouseMovedRef,
  containerRef,
  initialAnimationRef,
  startTimeRef,
  ctx,
  cursorCtx,
  animationSpeed = 0.008, // Default value matching the original normalReturnForce
}: AnimationParams) => {
  if (!containerRef.current) return;

  const rect = containerRef.current.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Draw the custom cursor
  drawCursor(cursorCtx, mouseState, containerRef);

  // Check if mouse has moved
  const mouseMoved = mouseMovedRef.current;
  const currentTime = Date.now();

  // Force for initial animation - faster than normal return
  const initialAssemblyForce = 0.006;
  // Use the configurable animationSpeed instead of hardcoded normalReturnForce
  const normalReturnForce = animationSpeed;

  // Scale interaction radius based on container size
  const maxDistance = Math.min(rect.width, rect.height) * 0.2;

  // User - maxDistance ... 0.2

  // Calculate relative mouse position within the container
  const relativeMouseX = mouseState.x - rect.left;
  const relativeMouseY = mouseState.y - rect.top;

  // Check if user is trying to interact during initial animation
  const isMouseInContainer =
    relativeMouseX >= 0 &&
    relativeMouseX <= rect.width &&
    relativeMouseY >= 0 &&
    relativeMouseY <= rect.height;

  // If user moves mouse within container during initial animation, interrupt it
  if (initialAnimationRef.current && mouseMoved && isMouseInContainer) {
    initialAnimationRef.current = false;
    // Reset lastForced for all dots so they can respond immediately
    dots.forEach((dot) => {
      dot.lastForced = 0;
    });
  }

  // Track if all dots are close to their base positions
  let allDotsInPosition = true;
  const elapsed = currentTime - startTimeRef.current;

  dots.forEach((dot) => {
    const dx = relativeMouseX - dot.x;
    const dy = relativeMouseY - dot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate distance from home position
    const distanceFromBase = Math.sqrt(
      Math.pow(dot.x - dot.baseX, 2) + Math.pow(dot.y - dot.baseY, 2)
    );

    // If dot isn't close to home during initial animation, we're not done yet
    if (initialAnimationRef.current && distanceFromBase > 1) {
      allDotsInPosition = false;
    }

    // Allow interaction regardless of initial animation state
    if (distance < maxDistance && !initialAnimationRef.current) {
      // This dot is in the "shark zone"
      if (mouseMoved) {
        // Only move dots when the mouse moves
        const angle = Math.atan2(dy, dx);

        const forceStrength = 40; // increase this for a more aggressive push
        const lerpFactor = 0.12; // makes the dots move toward the target faster
        const falloff = Math.pow((maxDistance - distance) / maxDistance, 2); // steeper curve

        // User - forceStrength = 40
        // User - lerpFactor = 0.12

        const targetX =
          dot.baseX - Math.cos(angle) * falloff * (maxDistance * forceStrength);
        const targetY =
          dot.baseY - Math.sin(angle) * falloff * (maxDistance * forceStrength);

        dot.x += (targetX - dot.x) * lerpFactor;
        dot.y += (targetY - dot.y) * lerpFactor;

        dot.lastForced = currentTime;
      }
      // We don't apply spring force here, so dots stay in place when mouse stops
    } else {
      // Handle initial animation or normal return behavior
      if (initialAnimationRef.current) {
        // Only start moving if the delay has passed
        if (elapsed > dot.assemblyDelay) {
          // Add some physics for more natural movement
          const dx = dot.baseX - dot.x;
          const dy = dot.baseY - dot.y;

          // Add acceleration toward home position
          dot.vx += dx * initialAssemblyForce;
          dot.vy += dy * initialAssemblyForce;

          // Add some damping
          dot.vx *= 0.85;
          dot.vy *= 0.85;

          // user - dot.vx *= 0.9;

          // Apply velocity
          dot.x += dot.vx;
          dot.y += dot.vy;
        }
      } else {
        // Normal return behavior when not in initial animation
        const timeSinceForced = currentTime - dot.lastForced;
        // Add a small delay before starting the return animation
        if (timeSinceForced > distance * 0) {
          dot.x += (dot.baseX - dot.x) * normalReturnForce;
          dot.y += (dot.baseY - dot.y) * normalReturnForce;
        }
      }
    }

    // Calculate horizontal position ratio (0 to 1) for gradient
    const t = dot.baseX / rect.width;
    // Interpolate from blue (hue 220) to purple (hue 280)
    const hue = 220 + t * 60;
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Reset the mouse moved flag after processing
  mouseMovedRef.current = false;

  // If all dots are in position, end the initial animation
  if (initialAnimationRef.current && allDotsInPosition && elapsed > 1500) {
    initialAnimationRef.current = false;
  }
};

const drawCursor = (
  ctx: CanvasRenderingContext2D,
  mouseState: MouseState,
  containerRef: RefObject<HTMLDivElement>
) => {
  if (!containerRef.current) return;

  const rect = containerRef.current.getBoundingClientRect();

  // Clear previous cursor
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Calculate relative mouse position within the container
  const relativeMouseX = mouseState.x - rect.left;
  const relativeMouseY = mouseState.y - rect.top;

  // Don't draw if mouse is outside container
  if (
    relativeMouseX < 0 ||
    relativeMouseX > rect.width ||
    relativeMouseY < 0 ||
    relativeMouseY > rect.height
  ) {
    return;
  }

  // Calculate interaction radius based on container size
  const interactionRadius = Math.min(rect.width, rect.height) * 0.4;

  // Draw outer white circle for interaction area
  ctx.beginPath();
  ctx.arc(relativeMouseX, relativeMouseY, interactionRadius, 0, Math.PI * 2);
};
