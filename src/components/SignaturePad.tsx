"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: (type?: string) => string;
}

interface Props {
  disabled?: boolean;
  onChange?: (hasContent: boolean) => void;
  className?: string;
}

type PadInstance = {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: (t?: string) => string;
  off?: () => void;
  addEventListener: (e: string, cb: () => void) => void;
};

const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  { disabled, onChange, className },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<PadInstance | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Init once: size the canvas for the device pixel ratio so strokes
  // are crisp on tablets/retina, then wire up the pen.
  useEffect(() => {
    let cancelled = false;
    let pad: PadInstance | null = null;

    (async () => {
      const SignaturePad = (await import("signature_pad")).default;
      if (cancelled || !canvasRef.current || !wrapRef.current) return;

      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.getContext("2d")!.scale(ratio, ratio);

      pad = new SignaturePad(canvas, {
        penColor: "#1b222d",
        minWidth: 0.8,
        maxWidth: 2.4,
        throttle: 8,
      }) as PadInstance;

      pad.addEventListener("endStroke", () => {
        const has = !pad!.isEmpty();
        setHasDrawn(has);
        onChange?.(has);
      });

      padRef.current = pad;
    })();

    return () => {
      cancelled = true;
      pad?.off?.();
    };
  }, [onChange]);

  useImperativeHandle(
    ref,
    () => ({
      clear: () => {
        padRef.current?.clear();
        setHasDrawn(false);
        onChange?.(false);
      },
      isEmpty: () => padRef.current?.isEmpty() ?? true,
      toDataURL: (type) => padRef.current?.toDataURL(type ?? "image/png") ?? "",
    }),
    [onChange]
  );

  return (
    <div ref={wrapRef} className={`relative h-[200px] ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 touch-none cursor-crosshair ${
          disabled ? "pointer-events-none" : ""
        }`}
      />
      {/* The dotted signing line */}
      <div className="absolute bottom-8 inset-x-0 border-b-2 border-dotted border-ink/30 pointer-events-none" />
    </div>
  );
});

export default SignaturePad;