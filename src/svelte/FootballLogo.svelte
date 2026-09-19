<script lang="ts">
  import {
    getFootballLogoUrl,
    LogoResolveError,
    resolveFootballLogo,
    type ResolvedLogo,
  } from "football-logos";

  export let country: string;
  export let club: string | undefined = undefined;
  export let size: number = 48;
  export let alt: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let loading: "lazy" | "eager" = "lazy";
  export let decoding: "async" | "auto" | "sync" = "async";

  let record: ResolvedLogo | null = null;
  let src: string | null = null;

  $: {
    try {
      record = resolveFootballLogo({ country, club });
      src = getFootballLogoUrl({ country, club });
    } catch (error) {
      if (!(error instanceof LogoResolveError)) throw error;
      record = null;
      src = null;
    }
  }
</script>

{#if src && record}
  <img
    {src}
    width={size}
    height={size}
    alt={alt ?? record.name}
    class={className}
    {loading}
    {decoding}
  />
{:else}
  <span
    role="img"
    aria-label={alt ?? "Unknown football logo"}
    class={className}
    style="display:inline-block;width:{size}px;height:{size}px;border-radius:999px;background:color-mix(in srgb, currentColor 12%, transparent);"
  ></span>
{/if}
