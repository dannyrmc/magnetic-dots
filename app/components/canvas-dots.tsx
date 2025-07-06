import React from "react";

const CanvasDots = React.forwardRef<HTMLCanvasElement>((props, ref) => {
  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full touch-none text-primary"
      {...props}
    />
  );
});

CanvasDots.displayName = "CanvasDots";

export default CanvasDots;
