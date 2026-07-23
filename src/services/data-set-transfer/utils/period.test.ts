import { describe, test, expect } from "vitest";
import { getDHIS2Periods } from "./period";

describe("period utility", () => {
  describe("getDHIS2Periods", () => {
    test("should generate Daily periods correctly", () => {
      const periods = getDHIS2Periods({
        startDate: "2023-01-01",
        endDate: "2023-01-03",
        periodType: "Daily",
      });

      expect(periods).toEqual(["20230101", "20230102", "20230103"]);
    });

    test("should generate Weekly periods correctly", () => {
      const periods = getDHIS2Periods({
        startDate: "2023-01-02",
        endDate: "2023-01-16",
        periodType: "Weekly",
      });

      expect(periods).toEqual(["2023W1", "2023W2", "2023W3"]);
    });

    test("should generate Monthly periods correctly", () => {
      const periods = getDHIS2Periods({
        startDate: "2023-01-01",
        endDate: "2023-03-31",
        periodType: "Monthly",
      });

      expect(periods).toEqual(["202301", "202302", "202303"]);
    });

    test("should generate Quarterly periods correctly", () => {
      const periods = getDHIS2Periods({
        startDate: "2023-01-01",
        endDate: "2023-09-30",
        periodType: "Quarterly",
      });

      expect(periods).toEqual(["2023Q1", "2023Q2", "2023Q3"]);
    });

    test("should generate Yearly periods correctly", () => {
      const periods = getDHIS2Periods({
        startDate: "2021-01-01",
        endDate: "2023-12-31",
        periodType: "Yearly",
      });

      expect(periods).toEqual(["2021", "2022", "2023"]);
    });

    test("should throw error for unsupported period type", () => {
      expect(() =>
        getDHIS2Periods({
          startDate: "2023-01-01",
          endDate: "2023-01-31",
          periodType: "BiMonthly",
        }),
      ).toThrow("Unsupported period type: BiMonthly");
    });
  });
});
