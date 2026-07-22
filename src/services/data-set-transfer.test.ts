import { test, describe, expect } from "vitest";
import { initiateTransferDataSetData } from "./data-set-transfer";

describe("data set transfer", () => {
  test("initiate transfer of dataset-data", () => {
    expect(initiateTransferDataSetData()).toBe(true);
  });
});
