"use client";

/**
 * Fixed "golden hour" backdrop: slow-drifting color blobs + a faint paper-grain
 * overlay so the cream background reads as warm/printed rather than a flat screen.
 */
export default function BackgroundAmbience() {
  const grainSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

  return (
    <>
      <div className="bg-blob blob-amber animate-float-blob" />
      <div className="bg-blob blob-coral animate-float-blob-slow" />
      <div className="bg-blob blob-sage animate-float-blob" style={{ animationDelay: "-7s" }} />
      <div
        className="grain-overlay"
        style={{ backgroundImage: `url("${grainSvg}")` }}
        aria-hidden="true"
      />
    </>
  );
}
