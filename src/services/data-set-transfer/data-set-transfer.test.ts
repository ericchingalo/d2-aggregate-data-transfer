import { test, describe, expect } from "vitest";
import { initiateTransferDataSetData } from ".";

const mockParams = {
  startDate: "2022-01-01",
  endDate: "2022-01-31",
  sourceOuId: "1",
  targetOuId: "2",
  dataSetIds: ["1"],
};

describe("data set transfer", () => {
  test("initiate transfer of dataset-data", () => {
    const result = initiateTransferDataSetData(mockParams);
    expect(result).toBe(true);
  });
});
