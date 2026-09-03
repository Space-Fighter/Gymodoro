import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";

interface Props {
  children: ReactNode;
  /** Camera field of view. Default 50. */
  fov?: number;
  className?: string;
}

/**
 * Base full-bleed R3F canvas for scroll/timer backgrounds. Runs at a capped
 * DPR (perf on the Windows/Chromium targets this app ships to) and never
 * blocks paint — wrap slow-loading meshes in their own <Suspense> boundary if
 * they need a fallback other than "nothing for a frame".
 */
export default function Scene3D({ children, fov = 50, className }: Props) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov, position: [0, 0, 5] }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
