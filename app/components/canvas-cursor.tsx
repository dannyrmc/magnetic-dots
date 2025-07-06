import React from "react";

const CanvasCursor = React.forwardRef<HTMLCanvasElement>((props, ref) => {
  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full touch-none"
      {...props}
    />
  );
});

CanvasCursor.displayName = "CanvasCursor";

export default CanvasCursor;