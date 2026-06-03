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

  return (
    <div
      style={{
        ...targetStyle,
        borderColor: platform.color,
        opacity: enter,
        transform: `translateX(${interpolate(enter, [0, 1], [-120, 0]) + interpolate(shift, [0, 1], [0, index * 18])}px)`
      }}
    >
      <div style={{ ...platformDotStyle, background: platform.color }}>{platform.label.slice(0, 1)}</div>
      <div style={{ flex: 1 }}>
        <strong>{platform.label}</strong>
        <span>target platformowy</span>
      </div>
      <em style={{ background: platform.soft, color: platform.color }}>{platform.status}</em>
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
      <span>{label}</span>
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
          <span>materiał źródłowy</span>
          <strong>launch_clip_001.mp4</strong>
          <small>00:47 · pionowy · gotowy</small>
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
        <strong>Postmerce</strong>
        <span>postmerce.pl</span>
      </div>
    </AbsoluteFill>
  );
};

const rootStyle: CSSProperties = {
  background: "linear-gradient(135deg, #f8fbff 0%, #eef3ff 48%, #f5fff8 100%)",
  color: "#111827",
  fontFamily: "Aptos, Segoe UI, system-ui, sans-serif",
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
  fontSize: 82,
  letterSpacing: 0,
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
  padding: "14px 18px"
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
  width: 48
};

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

const statusRailStyle: CSSProperties = {
  bottom: 48,
  display: "flex",
  gap: 14,
  left: 40,
  position: "absolute",
  zIndex: 10
};

const statusPillStyle: CSSProperties = {
  background: "#fff",
  border: "2px solid",
  borderRadius: 999,
  fontSize: 24,
  fontWeight: 900,
  padding: "12px 18px",
  textTransform: "uppercase"
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
  zIndex: 14
};
