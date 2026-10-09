import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "The Dream Business, the business builder: where businesses build their future.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/@fontsource/schibsted-grotesk/files");

export default async function Image() {
  const [bold, medium, emblem] = await Promise.all([
    readFile(join(fontDir, "schibsted-grotesk-latin-700-normal.woff")),
    readFile(join(fontDir, "schibsted-grotesk-latin-500-normal.woff")),
    readFile(join(process.cwd(), "public/brand/the-dream-business-emblem.svg")),
  ]);
  const emblemSrc = `data:image/svg+xml;base64,${emblem.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0D1B2E",
          backgroundImage: "radial-gradient(circle at 80% 50%, rgba(226,176,72,0.22), rgba(13,27,46,0) 42%)",
          padding: "72px 80px",
          fontFamily: "Schibsted",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 500, color: "#E2B048", letterSpacing: "0.02em" }}>The Business Builder</div>
            <div style={{ marginTop: 18, fontSize: 92, fontWeight: 700, lineHeight: 0.98, letterSpacing: "-0.035em" }}>The Dream Business</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: "#D5DDE7", letterSpacing: "-0.02em" }}>Where businesses build their future.</div>
            <div style={{ marginTop: 18, fontSize: 26, fontWeight: 500, color: "#A9B8CB" }}>
              Business tools, research, suppliers and services. From first venture to global expansion.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 330, marginLeft: 40 }}>
          <img src={emblemSrc} width={300} height={300} alt="" />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Schibsted", data: bold, weight: 700, style: "normal" },
        { name: "Schibsted", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
