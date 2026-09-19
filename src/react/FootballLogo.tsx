import type {
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import {
  getFootballLogoUrl,
  LogoResolveError,
  resolveFootballLogo,
} from "../index.js";

export type FootballLogoProps = {
  country: string;
  club?: string | null;
  size?: number;
  alt?: string;
  fallback?: ReactNode | null;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height" | "alt">;

export function FootballLogo({
  country,
  club,
  size = 48,
  alt,
  className,
  style,
  loading = "lazy",
  decoding = "async",
  fallback,
  ...imgProps
}: FootballLogoProps) {
  try {
    const record = resolveFootballLogo({ country, club });
    const src = getFootballLogoUrl({ country, club });
    return (
      <img
        src={src}
        width={size}
        height={size}
        alt={alt ?? record.name}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
        {...imgProps}
      />
    );
  } catch (caught) {
    if (!(caught instanceof LogoResolveError)) throw caught;
    if (fallback === null) return null;
    if (fallback) return fallback;
    return (
      <span
        role="img"
        aria-label={alt ?? "Unknown football logo"}
        className={className}
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "999px",
          background: "color-mix(in srgb, currentColor 12%, transparent)",
          ...style,
        }}
      />
    );
  }
}
