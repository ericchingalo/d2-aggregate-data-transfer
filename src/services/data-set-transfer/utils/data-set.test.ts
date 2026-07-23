import { describe, test, expect, vi, beforeEach } from "vitest";
import { getDataSetById } from "./data-set";
import dhis2Client from "../../../clients/dhis2";

vi.mock("../../../clients/dhis2", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(dhis2Client.get);

describe("data-set utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDataSetById", () => {
    test("should successfully return data set when response status is 200", async () => {
      const mockDataSet = {
        id: "ds-123",
        name: "Monthly Malaria Data",
        periodType: "Monthly",
      };

      mockedGet.mockResolvedValueOnce({
        status: 200,
        data: mockDataSet,
      } as any);

      const result = await getDataSetById("ds-123");

      expect(mockedGet).toHaveBeenCalledWith("dataSets/ds-123");
      expect(result).toEqual(mockDataSet);
    });

    test("should throw error when response status is not 200", async () => {
      mockedGet.mockResolvedValueOnce({
        status: 404,
        data: { message: "Data set not found" },
      } as any);

      await expect(getDataSetById("invalid-id")).rejects.toThrow(
        'Error retrieving data set with id invalid-id. Response status 404 : {"message":"Data set not found"}',
      );

      expect(mockedGet).toHaveBeenCalledWith("dataSets/invalid-id");
    });

    test("should re-throw error when dhis2Client request rejects", async () => {
      const networkError = new Error("Network connection lost");
      mockedGet.mockRejectedValueOnce(networkError);

      await expect(getDataSetById("ds-123")).rejects.toThrow(
        "Network connection lost",
      );

      expect(mockedGet).toHaveBeenCalledWith("dataSets/ds-123");
    });
  });
});
