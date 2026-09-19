import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FootballLogo from "./FootballLogo.vue";

describe("FootballLogo (Vue)", () => {
  it("renders a hashed PNG for a known club", () => {
    const wrapper = mount(FootballLogo, {
      props: { country: "germany", club: "bayern-munchen", size: 48 },
    });
    const img = wrapper.get("img");
    expect(img.attributes("src")).toContain(
      "/germany/512x512/bayern-munchen.",
    );
    expect(img.attributes("loading")).toBe("lazy");
    expect(img.attributes("width")).toBe("48");
  });

  it("renders a placeholder when the lookup fails", () => {
    const wrapper = mount(FootballLogo, {
      props: { country: "not-a-country" },
    });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.get("span").attributes("role")).toBe("img");
  });
});
