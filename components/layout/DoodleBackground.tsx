"use client";

import { useEffect, useState } from "react";

const MARGIN_DOODLES = [
  { src: "/doodles/doodle.png", widthClass: "w-12 sm:w-24" },
  { src: "/doodles/heart.png", widthClass: "w-8 sm:w-16" },
  { src: "/doodles/dd.png", widthClass: "w-10 sm:w-20" },
  { src: "/doodles/df.png", widthClass: "w-8 sm:w-16" },
  { src: "/doodles/d3.png", widthClass: "w-10 sm:w-20" },
  { src: "/doodles/d2.png", widthClass: "w-8 sm:w-16" },
  { src: "/doodles/doodle2.png", widthClass: "w-16 sm:w-32" },
];

const WATERMARK_DOODLES = [
  { src: "/doodles/dw.png", widthClass: "max-w-[60vw] sm:max-w-[40vw] max-h-[40vh]" },
  { src: "/doodles/dw2.png", widthClass: "max-w-[60vw] sm:max-w-[40vw] max-h-[40vh]" },
  { src: "/doodles/dw3.png", widthClass: "max-w-[60vw] sm:max-w-[40vw] max-h-[40vh]" },
  { src: "/doodles/dw4.png", widthClass: "max-w-[60vw] sm:max-w-[40vw] max-h-[40vh]" },
];

interface DoodleInstance {
  id: string;
  src: string;
  widthClass: string;
  top: number; // percentage
  left?: number; // percentage, undefined if right
  right?: number; // percentage, undefined if left
  rotation: number; // degrees
  opacity: number;
}

interface WatermarkInstance {
  id: string;
  src: string;
  widthClass: string;
  top: number; // percentage
  opacity: number;
}

export default function DoodleBackground() {
  const [mounted, setMounted] = useState(false);
  const [doodles, setDoodles] = useState<DoodleInstance[]>([]);
  const [watermarks, setWatermarks] = useState<WatermarkInstance[]>([]);

  useEffect(() => {
    setMounted(true);

    // Random number of margin doodles: between 5 and 7 to keep layout clean
    const numDoodles = Math.floor(Math.random() * 3) + 5; 
    const generatedDoodles: DoodleInstance[] = [];

    // Divide the page height (0% to 100%) into zones to ensure beautiful spreading without clumping
    const step = 90 / numDoodles; // leave 5% margin at top and bottom

    for (let i = 0; i < numDoodles; i++) {
      const doodleType = MARGIN_DOODLES[Math.floor(Math.random() * MARGIN_DOODLES.length)];
      // Alternate left/right sides to guarantee doodles on the same side are separated by at least 2*step
      const isRight = i % 2 === 0;
      
      // Calculate top percentage within this zone
      const minZoneTop = 5 + i * step;
      const maxZoneTop = minZoneTop + step * 0.8;
      const top = minZoneTop + Math.random() * (maxZoneTop - minZoneTop);

      // Random horizontal offset within the margins
      const horizontalOffset = Math.floor(Math.random() * 8) + 2; // 2% to 10%
      
      // Random rotation between -20 and 20 degrees
      const rotation = Math.floor(Math.random() * 40) - 20;

      // Random opacity between 0.15 and 0.22
      const opacity = parseFloat((Math.random() * 0.07 + 0.15).toFixed(2));

      generatedDoodles.push({
        id: `doodle-${i}`,
        src: doodleType.src,
        widthClass: doodleType.widthClass,
        top: parseFloat(top.toFixed(1)),
        // Left side doodles clear binder lines by using a larger offset
        left: isRight ? undefined : (horizontalOffset + 6), // 8% to 16% on left
        right: isRight ? horizontalOffset : undefined, // 2% to 10% on right
        rotation,
        opacity,
      });
    }

    // Watermark doodles: 1 or 2 to avoid cluttering and overlapping
    const numWatermarks = Math.random() > 0.5 ? 1 : 2; 
    const generatedWatermarks: WatermarkInstance[] = [];

    if (numWatermarks === 1) {
      const watermarkType = WATERMARK_DOODLES[Math.floor(Math.random() * WATERMARK_DOODLES.length)];
      generatedWatermarks.push({
        id: "watermark-0",
        src: watermarkType.src,
        widthClass: watermarkType.widthClass,
        top: 50, // perfectly centered vertically
        opacity: parseFloat((Math.random() * 0.02 + 0.04).toFixed(2)), // faint: 0.04 to 0.06
      });
    } else {
      // 2 watermarks, placed far apart vertically (25% and 75%)
      const watermarkType1 = WATERMARK_DOODLES[Math.floor(Math.random() * WATERMARK_DOODLES.length)];
      let watermarkType2 = WATERMARK_DOODLES[Math.floor(Math.random() * WATERMARK_DOODLES.length)];
      if (watermarkType1.src === watermarkType2.src) {
        watermarkType2 = WATERMARK_DOODLES[(WATERMARK_DOODLES.indexOf(watermarkType1) + 1) % WATERMARK_DOODLES.length];
      }

      generatedWatermarks.push({
        id: "watermark-0",
        src: watermarkType1.src,
        widthClass: watermarkType1.widthClass,
        top: 25,
        opacity: parseFloat((Math.random() * 0.02 + 0.04).toFixed(2)),
      });
      generatedWatermarks.push({
        id: "watermark-1",
        src: watermarkType2.src,
        widthClass: watermarkType2.widthClass,
        top: 75,
        opacity: parseFloat((Math.random() * 0.02 + 0.04).toFixed(2)),
      });
    }

    setDoodles(generatedDoodles);
    setWatermarks(generatedWatermarks);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Center Watermarks */}
      {watermarks.map((w) => (
        <img
          key={w.id}
          src={w.src}
          alt=""
          className={`absolute left-1/2 -translate-x-1/2 ${w.widthClass} object-contain mix-blend-multiply`}
          style={{ 
            top: `${w.top}%`,
            opacity: w.opacity,
            transform: `translate(-50%, -50%)`
          }}
        />
      ))}

      {/* Margin Doodles */}
      {doodles.map((d) => {
        const positionStyles: React.CSSProperties = {
          top: `${d.top}%`,
          transform: `rotate(${d.rotation}deg) translateY(-50%)`,
          opacity: d.opacity,
        };

        if (d.left !== undefined) {
          positionStyles.left = `${d.left}%`;
        } else if (d.right !== undefined) {
          positionStyles.right = `${d.right}%`;
        }

        return (
          <img
            key={d.id}
            src={d.src}
            alt=""
            className={`absolute ${d.widthClass} h-auto mix-blend-multiply`}
            style={positionStyles}
          />
        );
      })}
    </div>
  );
}
