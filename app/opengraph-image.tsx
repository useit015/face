import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Oussama Nahiz — Senior Full-Stack Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [familjenRegular, familjenMedium, martianRegular, martianMedium] =
  await Promise.all([
    readFile(join(process.cwd(), "assets/FamiljenGrotesk-Regular.ttf")),
    readFile(join(process.cwd(), "assets/FamiljenGrotesk-Medium.ttf")),
    readFile(join(process.cwd(), "assets/MartianMono-Regular.ttf")),
    readFile(join(process.cwd(), "assets/MartianMono-Medium.ttf")),
  ]);

const colors = {
  background: "#f9f7f4",
  foreground: "#221f1b",
  secondary: "#514e49",
  tertiary: "#6b6864",
  quaternary: "#b2afab",
  border: "#dfddda",
} as const;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: colors.background,
          padding: "72px",
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontFamily: "Martian Mono",
            fontSize: 22,
            color: colors.tertiary,
          }}
        >
          <div style={{ display: "flex", letterSpacing: 4 }}>
            SENIOR FULL-STACK ENGINEER
          </div>
          <div style={{ display: "flex", letterSpacing: 2 }}>42-GRAD</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Familjen Grotesk",
              fontWeight: 500,
              fontSize: 108,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: colors.foreground,
            }}
          >
            Oussama Nahiz
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Familjen Grotesk",
              fontWeight: 400,
              fontSize: 32,
              lineHeight: 1.45,
              color: colors.secondary,
              maxWidth: 920,
              marginTop: 28,
            }}
          >
            9+ years shipping production software across React, Node.js,
            TypeScript, and AI — architecture to deployment.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            fontFamily: "Martian Mono",
            fontSize: 22,
            color: colors.foreground,
          }}
        >
          <div style={{ display: "flex", letterSpacing: 2 }}>
            REACT · NODE.JS · TYPESCRIPT · AI
          </div>
          <div style={{ display: "flex", letterSpacing: 2, color: colors.quaternary }}>
            ST9WD.COM
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Familjen Grotesk",
          data: familjenRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Familjen Grotesk",
          data: familjenMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Martian Mono",
          data: martianRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Martian Mono",
          data: martianMedium,
          style: "normal",
          weight: 500,
        },
      ],
    },
  );
}
