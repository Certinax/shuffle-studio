import { ImageResponse } from "next/og";

export const socialPreviewAlt =
  "Shuffle Studio green shuffle icon on a dark gradient background";

export const socialPreviewSize = {
  width: 1200,
  height: 630,
};

export const socialPreviewContentType = "image/png";

export function createSocialPreviewImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 18% 14%, rgba(29, 185, 84, 0.36), transparent 330px), radial-gradient(circle at 84% 18%, rgba(30, 215, 96, 0.18), transparent 310px), linear-gradient(135deg, #0b0b0b 0%, #080808 54%, #050505 100%)",
          color: "#f8fafc",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: 72,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 48,
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.025)), rgba(18, 18, 18, 0.78)",
            boxShadow: "0 32px 120px rgba(0, 0, 0, 0.48)",
            padding: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 700,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                color: "#1db954",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              <div
                style={{
                  width: 74,
                  height: 74,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(29, 185, 84, 0.34)",
                  borderRadius: 999,
                  background: "rgba(29, 185, 84, 0.15)",
                  boxShadow: "0 0 70px rgba(29, 185, 84, 0.24)",
                }}
              >
                <ShuffleIcon size={38} strokeWidth={2.4} />
              </div>
              Shuffle Studio
            </div>
            <div
              style={{
                fontSize: 76,
                fontWeight: 700,
                letterSpacing: "-0.065em",
                lineHeight: 0.95,
              }}
            >
              Turn any playlist into a fresh shuffled copy.
            </div>
            <div
              style={{
                maxWidth: 620,
                color: "#a1a1aa",
                fontSize: 30,
                lineHeight: 1.35,
              }}
            >
              Create beautifully shuffled Spotify playlists from your own catalog.
            </div>
          </div>
          <div
            style={{
              width: 260,
              height: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(29, 185, 84, 0.26)",
              borderRadius: 999,
              background:
                "radial-gradient(circle, rgba(29, 185, 84, 0.24) 0%, rgba(29, 185, 84, 0.08) 54%, rgba(29, 185, 84, 0.02) 100%)",
              color: "#1ed760",
              boxShadow: "0 0 120px rgba(29, 185, 84, 0.26)",
            }}
          >
            <ShuffleIcon size={132} strokeWidth={1.75} />
          </div>
        </div>
      </div>
    ),
    socialPreviewSize,
  );
}

function ShuffleIcon({
  size,
  strokeWidth,
}: {
  size: number;
  strokeWidth: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 14 4 4-4 4" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
      <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
      <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
    </svg>
  );
}
