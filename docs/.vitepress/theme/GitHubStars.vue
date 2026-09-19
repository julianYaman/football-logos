<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const REPO = "julianYaman/football-logos";
const REPO_URL = `https://github.com/${REPO}`;
const CACHE_KEY = "football-logos-github-stars";
const CACHE_TTL_MS = 60 * 60 * 1000;

defineProps<{
  variant?: "nav" | "screen";
}>();

const stars = ref<number | null>(null);

const formatted = computed(() => {
  if (stars.value == null) return "";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(stars.value);
});

const label = computed(() => {
  if (stars.value == null) return "GitHub repository";
  const noun = stars.value === 1 ? "star" : "stars";
  return `GitHub repository, ${stars.value} ${noun}`;
});

onMounted(() => {
  const cached = readCache();
  if (cached != null) stars.value = cached.stars;
  if (!cached || Date.now() - cached.fetchedAt > CACHE_TTL_MS) {
    void refreshStars();
  }
});

function readCache(): { stars: number; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { stars?: unknown; fetchedAt?: unknown };
    if (typeof parsed.stars !== "number" || typeof parsed.fetchedAt !== "number") {
      return null;
    }
    return { stars: parsed.stars, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

async function refreshStars() {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return;
    const data = (await response.json()) as { stargazers_count?: unknown };
    if (typeof data.stargazers_count !== "number") return;
    stars.value = data.stargazers_count;
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ stars: data.stargazers_count, fetchedAt: Date.now() }),
    );
  } catch {
    // Keep any cached count; hide the chip if we never got one.
  }
}
</script>

<template>
  <a
    v-if="stars != null"
    class="github-stars"
    :class="variant === 'screen' ? 'github-stars--screen' : 'github-stars--nav'"
    :href="REPO_URL"
    :aria-label="label"
    target="_blank"
    rel="noreferrer"
  >
    <svg
      class="github-stars-icon"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
      />
    </svg>
    <span class="github-stars-count">{{ formatted }}</span>
    <span v-if="variant === 'screen'" class="github-stars-label">Star on GitHub</span>
  </a>
</template>

<style scoped>
.github-stars {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.25s;
}

.github-stars:hover {
  color: var(--vp-c-text-1);
}

.github-stars-icon {
  flex: none;
}

.github-stars--nav {
  height: 36px;
  margin-left: 0.15rem;
  padding: 0 0.45rem;
}

.github-stars--screen {
  justify-content: center;
  width: 100%;
  height: 44px;
  margin-top: 0.75rem;
  padding: 0 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
}

.github-stars-label {
  font-weight: 500;
}

@media (max-width: 767px) {
  .github-stars--nav {
    display: none;
  }
}
</style>
