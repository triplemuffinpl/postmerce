import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

type PlatformTone = {
  label: string;
  color: string;
  soft: string;
  status: string;
};

const platforms: PlatformTone[] = [
  { label: "YouTube", color: "#ef4444", soft: "#fee2e2", status: "gotowe" },
  { label: "LinkedIn", color: "#0a66c2", soft: "#dbeafe", status: "zaplanowane" },
  { label: "Instagram", color: "#e1306c", soft: "#fce7f3", status: "w kolejce" },
  { label: "Facebook", color: "#1877f2", soft: "#dbeafe", status: "do kontroli" },
  { label: "TikTok", color: "#111827", soft: "#e5e7eb", status: "API" }
];

const statusTones = [
  { label: "zaplanowane", color: "#2563eb" },
  { label: "w kolejce", color: "#7c3aed" },
  { label: "publikowanie", color: "#f59e0b" },
  { label: "opublikowane", color: "#10b981" },
  { label: "wymaga reakcji", color: "#f43f5e" }
];

const platformIcons: Record<string, string> = {
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24" width="24" height="24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24" width="24" height="24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24" width="24" height="24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  tiktok: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24" width="24" height="24"><path d="M12.525.02c1.31-.032 2.617-.023 3.91-.033.08 1.56.63 3.09 1.557 4.253.906 1.15 2.174 1.96 3.565 2.193V10.3c-1.24-.077-2.427-.512-3.45-1.258-.228-.166-.44-.347-.638-.544v7.354c.047 1.726-.607 3.414-1.804 4.654A6.47 6.47 0 0 1 10.34 22.2a6.47 6.47 0 0 1-4.834-2.827c-1.074-1.393-1.464-3.195-1.074-4.92A6.5 6.5 0 0 1 8.85 9.878c.813-.23 1.668-.244 2.485-.04v3.916c-.328-.088-.675-.12-1.012-.093-.827.05-1.58.5-2.002 1.21-.422.7-.492 1.57-.187 2.336a2.6 2.6 0 0 0 2.4 1.678c.677.01 1.332-.31 1.727-.86.395-.55.485-1.26.242-1.89a5.1 5.1 0 0 0-.25-.49V.02h.27z"/></svg>`
};

function progress(frame: number, startSeconds: number, durationSeconds: number, fps: number): number {
  return interpolate(frame, [startSeconds * fps, (startSeconds + durationSeconds) * fps], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
}

function fadeStyle(frame: number, startSeconds: number, durationSeconds: number, fps: number): CSSProperties {
  const value = progress(frame, startSeconds, durationSeconds, fps);
  return {
    opacity: value,
    transform: `translateY(${interpolate(value, [0, 1], [34, 0])}px)`
  };
}

function PlatformTarget({ platform, index }: { platform: PlatformTone; index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = progress(frame, 0.55 + index * 0.12, 0.72, fps);
  const shift = progress(frame, 2.1, 0.55, fps);

  const platformKey = platform.label.toLowerCase();
  const svgHtml = platformIcons[platformKey];

  return (
    <div
      style={{
        ...targetStyle,
        borderColor: platform.color,
        opacity: enter,
        transform: `translateX(${interpolate(enter, [0, 1], [-120, 0]) + interpolate(shift, [0, 1], [0, index * 18])}px)`
      }}
    >
      {svgHtml ? (
        <div 
          style={{ ...platformDotStyle, background: platform.color }}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      ) : (
        <div style={{ ...platformDotStyle, background: platform.color }}>
          {platform.label.slice(0, 1)}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 6 }}>
        <strong style={platformLabelStyle}>{platform.label}</strong>
        <span style={platformSubstyle}>target platformowy</span>
      </div>
      <em style={platformStatusStyle(platform)}>{platform.status}</em>
    </div>
  );
}

function ScreenshotFrame({
  src,
  label,
  start,
  rotate,
  x
}: {
  src: string;
  label: string;
  start: number;
  rotate: number;
  x: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = progress(frame, start, 0.75, fps);
  const leave = progress(frame, start + 2.55, 0.75, fps);
  const opacity = enter - leave * 0.82;
  const scale = interpolate(enter, [0, 1], [0.9, 1]);

  return (
    <figure
      style={{
        ...screenshotFrameStyle,
        opacity,
        transform: `translate(${x + interpolate(enter, [0, 1], [80, 0])}px, ${interpolate(leave, [0, 1], [0, -70])}px) rotate(${rotate}deg) scale(${scale})`
      }}
    >
      <span style={labelStyle}>{label}</span>
      <Img src={staticFile(src)} style={screenshotImageStyle} />
    </figure>
  );
}

function StatusRail() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={statusRailStyle}>
      {statusTones.map((status, index) => {
        const enter = progress(frame, 6.0 + index * 0.14, 0.45, fps);
        return (
          <div
            key={status.label}
            style={{
              ...statusPillStyle,
              borderColor: status.color,
              color: status.color,
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`
            }}
          >
            {status.label}
          </div>
        );
      })}
    </div>
  );
}

export const ProductShowcase = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sourceEnter = progress(frame, 0, 0.7, fps);
  const finalEnter = progress(frame, 8.7, 1.0, fps);
  const finalGlow = interpolate(finalEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={rootStyle}>
      <div style={gridOverlayStyle} />
      <div style={orbStyle} />

      <section style={copyStyle}>
        <div style={{ ...fadeStyle(frame, 0.1, 0.7, fps) }}>
          <p style={eyebrowStyle}>Postmerce</p>
          <h1 style={headlineStyle}>Jeden film. Wiele publikacji. Pełna kontrola.</h1>
          <p style={leadStyle}>Postmerce rozbija video na targety platform, kolejkę i statusy, które da się realnie obsłużyć.</p>
        </div>
      </section>

      <section style={stageStyle}>
        <div
          style={{
            ...sourceCardStyle,
            opacity: sourceEnter,
            transform: `translateY(${interpolate(sourceEnter, [0, 1], [46, 0])}px) scale(${interpolate(sourceEnter, [0, 1], [0.94, 1])})`
          }}
        >
          <span style={sourceLabelStyle}>materiał źródłowy</span>
          <strong style={sourceTitleStyle}>launch_clip_001.mp4</strong>
          <small style={sourceMetaStyle}>00:47 · pionowy · gotowy</small>
        </div>

        <div style={targetColumnStyle}>
          {platforms.map((platform, index) => (
            <PlatformTarget key={platform.label} platform={platform} index={index} />
          ))}
        </div>

        <ScreenshotFrame src="screenshots/app-calendar.png" label="Kalendarz" start={2.35} rotate={-2} x={-80} />
        <ScreenshotFrame src="screenshots/app-control.png" label="Centrum kontroli" start={5.15} rotate={1.4} x={20} />
        <ScreenshotFrame src="screenshots/app-dashboard.png" label="Dashboard" start={8.1} rotate={0} x={-20} />
        <StatusRail />
      </section>

      <div
        style={{
          ...finalCardStyle,
          opacity: finalEnter,
          boxShadow: `0 0 ${Math.round(60 + finalGlow * 90)}px rgba(124, 58, 237, ${0.16 + finalGlow * 0.18})`
        }}
      >
        <span 
          style={{ display: "grid", placeItems: "center", color: "#a855f7" }}
          dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="42" height="42"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.61 8.41m5.98 5.96a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 013.43 14.37m12.16 0a6 6 0 00-5.84-7.38" /></svg>` }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <strong style={finalLogoStyle}>Postmerce</strong>
          <span style={finalLinkStyle}>postmerce.pl</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const rootStyle: CSSProperties = {
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 48%, #f5f3ff 100%)",
  color: "#0f172a",
  fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
  overflow: "hidden"
};

const gridOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(124, 58, 237, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.08) 1px, transparent 1px)",
  backgroundSize: "54px 54px"
};

const orbStyle: CSSProperties = {
  position: "absolute",
  right: -220,
  top: -160,
  width: 620,
  height: 620,
  borderRadius: 999,
  background: "radial-gradient(circle, rgba(124,58,237,0.28), rgba(16,185,129,0.08) 48%, transparent 70%)"
};

const copyStyle: CSSProperties = {
  position: "absolute",
  left: 96,
  top: 98,
  width: 690,
  zIndex: 3
};

const eyebrowStyle: CSSProperties = {
  color: "#7c3aed",
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: 1.2,
  margin: "0 0 22px",
  textTransform: "uppercase"
};

const headlineStyle: CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: 82,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  lineHeight: 0.95,
  margin: 0
};

const leadStyle: CSSProperties = {
  color: "#52607a",
  fontSize: 30,
  lineHeight: 1.35,
  marginTop: 28
};

const stageStyle: CSSProperties = {
  position: "absolute",
  inset: "86px 82px 76px 760px",
  zIndex: 2
};

const sourceCardStyle: CSSProperties = {
  alignItems: "flex-start",
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 28,
  color: "#fff",
  display: "grid",
  gap: 12,
  padding: "28px 32px",
  position: "absolute",
  top: 24,
  left: 0,
  width: 560,
  zIndex: 5
};

const sourceLabelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  textTransform: "uppercase",
  color: "#a855f7",
  letterSpacing: "0.05em",
  fontFamily: "'Outfit', sans-serif"
};

const sourceTitleStyle: CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  color: "#ffffff",
  fontFamily: "'Outfit', sans-serif"
};

const sourceMetaStyle: CSSProperties = {
  fontSize: 16,
  color: "#9ca3af",
  fontFamily: "'Inter', sans-serif"
};

const targetColumnStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  left: 36,
  position: "absolute",
  top: 220,
  width: 560,
  zIndex: 4
};

const targetStyle: CSSProperties = {
  alignItems: "center",
  background: "rgba(255, 255, 255, 0.88)",
  border: "2px solid",
  borderRadius: 22,
  display: "flex",
  gap: 18,
  minHeight: 74,
  padding: "14px 18px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
  fontFamily: "'Inter', sans-serif"
};

const platformDotStyle: CSSProperties = {
  alignItems: "center",
  borderRadius: 18,
  color: "#fff",
  display: "flex",
  fontSize: 24,
  fontWeight: 900,
  height: 48,
  justifyContent: "center",
  width: 48,
  flexShrink: 0
};

const platformLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 20,
  fontWeight: 700,
  color: "#0f172a",
  fontFamily: "'Outfit', sans-serif"
};

const platformSubstyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  color: "#64748b",
  marginTop: 2,
  fontFamily: "'Inter', sans-serif"
};

const platformStatusStyle = (platform: PlatformTone): CSSProperties => ({
  background: platform.soft,
  color: platform.color,
  fontStyle: "normal",
  fontWeight: 700,
  fontSize: 14,
  padding: "6px 12px",
  borderRadius: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  fontFamily: "'Outfit', sans-serif"
});

const screenshotFrameStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(15,23,42,0.14)",
  borderRadius: 24,
  boxShadow: "0 28px 90px rgba(15, 23, 42, 0.18)",
  margin: 0,
  overflow: "hidden",
  position: "absolute",
  right: 0,
  top: 160,
  width: 900,
  zIndex: 8
};

const screenshotImageStyle: CSSProperties = {
  display: "block",
  width: "100%"
};

const labelStyle: CSSProperties = {
  background: "#ffffff",
  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
  color: "#7c3aed",
  display: "block",
  fontSize: 16,
  fontWeight: 800,
  padding: "10px 16px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontFamily: "'Outfit', sans-serif"
};

const statusRailStyle: CSSProperties = {
  bottom: 48,
  display: "flex",
  gap: 14,
  left: 40,
  position: "absolute",
  zIndex: 10
};

const statusPillStyle: CSSProperties = {
  background: "#ffffff",
  border: "2px solid",
  borderRadius: 999,
  fontSize: 20,
  fontWeight: 800,
  padding: "10px 20px",
  textTransform: "uppercase",
  fontFamily: "'Outfit', sans-serif",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
  letterSpacing: "0.03em"
};

const finalCardStyle: CSSProperties = {
  alignItems: "center",
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 28,
  bottom: 78,
  color: "#fff",
  display: "flex",
  gap: 22,
  padding: "22px 30px",
  position: "absolute",
  right: 90,
  zIndex: 14,
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
  fontFamily: "'Outfit', sans-serif"
};

const finalLogoStyle: CSSProperties = {
  fontSize: 34,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: "#ffffff"
};

const finalLinkStyle: CSSProperties = {
  fontSize: 20,
  color: "#a855f7",
  fontWeight: 700
};
