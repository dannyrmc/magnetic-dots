import type React from "react";

interface MouseTrackerProps {
  onMouseMove: (clientX: number, clientY: number) => void;
  onMouseLeave: () => void;
}

const MouseTracker: React.FC<MouseTrackerProps> = ({
  onMouseMove,
  onMouseLeave,
}) => {
  const handleInteraction = (clientX: number, clientY: number) => {
    onMouseMove(clientX, clientY);
  };

  const handleMouseLeave = () => {
    onMouseLeave();
  };

  return (
    <div
      className="absolute inset-0 h-full w-full cursor-none"
      onMouseMove={(e) => handleInteraction(e.clientX, e.clientY)}
      onMouseLeave={handleMouseLeave}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleInteraction(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleMouseLeave}
    />
  );
};

export default MouseTracker;
