"use client";

import type React from "react";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import CanvasDots from "./canvas-dots";
import CanvasCursor from "./canvas-cursor";
import MouseTracker from "./mouse-tracker";
import { generateDots } from "@/lib/dot-generator";
import { animateDots } from "@/lib/animation-handler";
import type { Dot, MouseState } from "@/lib/types";

interface InteractiveDotsProps {
  densityLevel?: number;
  dotSizeScaler?: number;
  animationSpeed?: number;
}

export interface InteractiveDotsRef {
  resetAnimation: () => void;
}

const InteractiveDots = forwardRef<InteractiveDotsRef, InteractiveDotsProps>(
  ({ densityLevel = 12, dotSizeScaler = 1.5, animationSpeed = 0.008 }, ref) => {
    // Convert user-facing density level to internal dotDensity (invert the relationship)
    const dotDensity = 23 - densityLevel;

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
    const dotsRef = useRef<Dot[]>([]);
    const mouseRef = useRef<MouseState>({ x: 0, y: 0 });
    const prevMouseRef = useRef<MouseState>({ x: 0, y: 0 });
    const mouseMovedRef = useRef(false);
    const animationRef = useRef<number | undefined>(undefined);
    const lastVibrationRef = useRef(0); // Track last vibration time

    // New refs for the animation
    const initialAnimationRef = useRef(true);
    const startTimeRef = useRef(Date.now());

    // Reset animation function to allow re-triggering the effect
    const resetAnimation = () => {
      if (!containerRef.current) return;

      initialAnimationRef.current = true;
      startTimeRef.current = Date.now();

      // Re-scatter the dots
      const rect = containerRef.current.getBoundingClientRect();
      dotsRef.current.forEach((dot) => {
        dot.vx = 0;
        dot.vy = 0;
        dot.x = Math.random() * rect.width;
        dot.y = Math.random() * rect.height;
        dot.assemblyDelay = Math.random() * 400;
      });
    };

    // Expose the resetAnimation function to parent components
    useImperativeHandle(ref, () => ({
      resetAnimation,
    }));

    // Haptic feedback function
    const triggerHapticFeedback = () => {
      const now = Date.now();
      // Throttle vibrations to avoid overwhelming the user (max once per 100ms)
      if (now - lastVibrationRef.current < 100) return;

      if ("vibrate" in navigator) {
        // Light vibration pattern: short pulse
        navigator.vibrate(15); // 15ms vibration
        lastVibrationRef.current = now;
      }
    };

    // Check if dots are being pushed by cursor
    const checkForDotInteraction = (clientX: number, clientY: number) => {
      if (!containerRef.current || initialAnimationRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const relativeMouseX = clientX - rect.left;
      const relativeMouseY = clientY - rect.top;
      const maxDistance = Math.min(rect.width, rect.height) * 0.2;

      // Check if any dots are within interaction range
      const isInteracting = dotsRef.current.some((dot) => {
        const dx = relativeMouseX - dot.x;
        const dy = relativeMouseY - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < maxDistance;
      });

      if (isInteracting) {
        triggerHapticFeedback();
      }
    };

    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const cursorCanvas = cursorCanvasRef.current;
      if (!canvas || !cursorCanvas || !container) return;

      const ctx = canvas.getContext("2d");
      const cursorCtx = cursorCanvas.getContext("2d");
      if (!ctx || !cursorCtx) return;

      // Initialize the animation start time
      startTimeRef.current = Date.now();

      const updateCanvasSize = () => {
        const rect = container.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;

        // Set dimensions for both canvases
        const setCanvasSize = (
          cnv: HTMLCanvasElement,
          ctx: CanvasRenderingContext2D
        ) => {
          cnv.width = rect.width * pixelRatio;
          cnv.height = rect.height * pixelRatio;
          cnv.style.width = `${rect.width}px`;
          cnv.style.height = `${rect.height}px`;
          ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        };

        // Set up main canvas
        if (ctx) setCanvasSize(canvas, ctx);

        // Set up cursor canvas
        if (cursorCtx) setCanvasSize(cursorCanvas, cursorCtx);

        // Regenerate dots when size changes, passing both dotDensity and dotSizeScaler
        dotsRef.current = generateDots(
          rect.width,
          rect.height,
          initialAnimationRef.current,
          dotDensity,
          dotSizeScaler
        );
      };

      // Animation function
      const animate = () => {
        if (!canvas || !ctx || !cursorCtx || !containerRef.current) return;

        animateDots({
          dots: dotsRef.current,
          mouseState: mouseRef.current,
          prevMouseState: prevMouseRef.current,
          mouseMovedRef,
          containerRef: containerRef as React.RefObject<HTMLDivElement>,
          initialAnimationRef,
          startTimeRef,
          ctx,
          cursorCtx,
          animationSpeed, // Pass the animation speed parameter
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      updateCanvasSize();
      window.addEventListener("resize", updateCanvasSize);

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener("resize", updateCanvasSize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [densityLevel, dotSizeScaler, animationSpeed]); // Add animationSpeed to dependency array

    const handleInteraction = (clientX: number, clientY: number) => {
      // Check if the mouse has actually moved from previous position
      const hasMoved =
        clientX !== prevMouseRef.current.x ||
        clientY !== prevMouseRef.current.y;

      if (hasMoved) {
        mouseMovedRef.current = true;
        prevMouseRef.current = { x: clientX, y: clientY };

        // Check for dot interaction and trigger haptic feedback
        checkForDotInteraction(clientX, clientY);
      }

      mouseRef.current = {
        x: clientX,
        y: clientY,
      };
    };

    const handleMouseLeave = () => {
      // Reset mouse position to be far away when mouse leaves
      mouseRef.current = {
        x: -1000,
        y: -1000,
      };
      // Mark as moved so dots can resume normal behavior
      mouseMovedRef.current = true;
    };

    return (
      <div ref={containerRef} className="relative h-full w-full">
        {/* Main canvas for the dots */}
        <CanvasDots ref={canvasRef} />

        {/* Overlay canvas for custom cursor */}
        <CanvasCursor ref={cursorCanvasRef} />

        {/* Invisible overlay div to capture mouse events */}
        <MouseTracker
          onMouseMove={handleInteraction}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    );
  }
);

InteractiveDots.displayName = "InteractiveDots";

export default InteractiveDots;
