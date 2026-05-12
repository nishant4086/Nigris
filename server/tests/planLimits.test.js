import { getPlanLimits } from "../utils/planLimits.js";

describe("Plan Limits Utility", () => {
  test("Should return correct limits for free plan", () => {
    const limits = getPlanLimits("free");
    expect(limits.maxProjects).toBe(1);
    expect(limits.requestLimit).toBe(100);
  });

  test("Should return correct limits for pro plan", () => {
    const limits = getPlanLimits("pro");
    expect(limits.maxProjects).toBe(20);
    expect(limits.requestLimit).toBe(10000);
  });

  test("Should fallback to free plan for unknown plans", () => {
    const limits = getPlanLimits("unknown");
    expect(limits.maxProjects).toBe(1);
  });

  test("Should handle enterprise unlimited status", () => {
    const limits = getPlanLimits("enterprise");
    expect(limits.maxProjects).toBe(-1);
  });
});
