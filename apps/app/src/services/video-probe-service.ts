import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { env } from "../config/env.js";

const execFileAsync = promisify(execFile);

interface FfprobeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
  r_frame_rate?: string;
  duration?: string;
}

interface FfprobeFormat {
  duration?: string;
}

interface FfprobeOutput {
  streams?: FfprobeStream[];
  format?: FfprobeFormat;
}

export interface VideoProbeResult {
  durationSec: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  videoCodec: string | null;
  audioCodec: string | null;
}

function parseNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFrameRate(value: string | undefined): number | null {
  if (!value || value === "0/0") {
    return null;
  }

  const [numeratorValue, denominatorValue] = value.split("/");
  const numerator = Number(numeratorValue);
  const denominator = Number(denominatorValue);

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return Number((numerator / denominator).toFixed(3));
}

export async function probeVideo(filePath: string): Promise<VideoProbeResult> {
  const { stdout } = await execFileAsync(env.ffprobePath, [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath
  ]);

  const parsed = JSON.parse(stdout) as FfprobeOutput;
  const streams = parsed.streams ?? [];
  const videoStream = streams.find((stream) => stream.codec_type === "video");
  const audioStream = streams.find((stream) => stream.codec_type === "audio");

  return {
    durationSec:
      parseNumber(parsed.format?.duration) ?? parseNumber(videoStream?.duration) ?? null,
    width: videoStream?.width ?? null,
    height: videoStream?.height ?? null,
    fps:
      parseFrameRate(videoStream?.avg_frame_rate) ??
      parseFrameRate(videoStream?.r_frame_rate) ??
      null,
    videoCodec: videoStream?.codec_name ?? null,
    audioCodec: audioStream?.codec_name ?? null
  };
}

export async function generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
  await execFileAsync(env.ffmpegPath, [
    "-y",
    "-i",
    inputPath,
    "-vf",
    "thumbnail,scale=640:-1",
    "-frames:v",
    "1",
    outputPath
  ]);
}
