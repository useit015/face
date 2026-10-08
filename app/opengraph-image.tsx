import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { boxStroke, hashSeed, underlineStroke } from "@/lib/ink-sketch";

export const alt = "Oussama Nahiz, senior full-stack engineer, drawn in blue ballpoint";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [kalamLight, kalamBold, portrait] = await Promise.all([
  readFile(join(process.cwd(), "assets/Kalam-Light.ttf")),
  readFile(join(process.cwd(), "assets/Kalam-Bold.ttf")),
  readFile(join(process.cwd(), "assets/og-portrait.png")),
]);

const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`;

const paper = "#f5f1e8";
const ink = "#1d36a9";
const ink2 = "#3958b6";
const ink3 = "#4a66bd";

const FRAME = 360;
const frame = boxStroke(hashSeed("og-frame"), FRAME, FRAME, { overshoot: 5 });
const frame2 = boxStroke(hashSeed("og-frame-2"), FRAME, FRAME, { overshoot: 3 });
const underline = underlineStroke(hashSeed("og-underline"), 560);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: paper,
          backgroundImage: "radial-gradient(120% 90% at 40% 40%, rgba(0,0,0,0) 60%, rgba(120,100,60,0.07) 100%)",
          padding: "70px 76px",
          fontFamily: "Kalam",
          color: ink,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontWeight: 700, fontSize: 104, lineHeight: 1.05 }}>Oussama Nahiz</div>
            <svg width="600" height="30" viewBox="-6 -6 620 30" style={{ marginTop: 4 }}>
              <path d={underline} fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ display: "flex", fontWeight: 300, fontSize: 36, lineHeight: 1.4, color: ink2, maxWidth: 600, marginTop: 26 }}>
              Senior full-stack engineer. React, Node.js, TypeScript, and AI, in production since 2016.
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 26, letterSpacing: 2, color: ink3, maxWidth: 640 }}>
            <div style={{ display: "flex" }}>REACT · NODE.JS · TYPESCRIPT · AI</div>
            <div style={{ display: "flex", fontWeight: 300, letterSpacing: 1 }}>st9wd.com</div>
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", width: FRAME, height: FRAME, marginTop: 40, transform: "rotate(1.5deg)" }}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={portraitSrc} width={FRAME - 16} height={FRAME - 16} style={{ position: "absolute", top: 8, left: 8 }} />
          <svg width={FRAME + 20} height={FRAME + 20} viewBox={`-10 -10 ${FRAME + 20} ${FRAME + 20}`} style={{ position: "absolute", top: -10, left: -10 }}>
            <path d={frame} fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d={frame2} fill="none" stroke={ink} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Kalam", data: kalamLight, style: "normal", weight: 300 },
        { name: "Kalam", data: kalamBold, style: "normal", weight: 700 },
      ],
    },
  );
}
