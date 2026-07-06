import { useEffect, useState } from "react";

export const useVisualViewportHeight = () => {
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  );

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const onResize = () => setHeight(viewport.height);
    viewport.addEventListener("resize", onResize);

    return () => viewport.removeEventListener("resize", onResize);
  }, []);

  return height;
};
