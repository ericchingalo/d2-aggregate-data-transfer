import { describe, test, expect, vi, beforeEach } from "vitest";
import { initiateTransferDataSetData } from ".";
import { getDataSetById } from "./utils/data-set";
import {
  getDataValueSetFromDHIS2,
  getUpdatedDataValueSets,
  saveDataValueSetToDHIS2,
} from "./utils/data-value-set";
import { getDHIS2Periods } from "./utils/period";

vi.mock("./utils/data-set");
vi.mock("./utils/data-value-set");
vi.mock("./utils/period");

const mockedGetDataSetById = vi.mocked(getDataSetById);
const mockedGetDHIS2Periods = vi.mocked(getDHIS2Periods);
const mockedGetDataValueSetFromDHIS2 = vi.mocked(getDataValueSetFromDHIS2);
const mockedGetUpdatedDataValueSets = vi.mocked(getUpdatedDataValueSets);
const mockedSaveDataValueSetToDHIS2 = vi.mocked(saveDataValueSetToDHIS2);

const mockParams = {
  startDate: "2022-01-01",
  endDate: "2022-01-31",
  sourceOuId: "source-ou-1",
  targetOuId: "target-ou-2",
  dataSetIds: ["ds-1"],
  attributeOptionCombo: "aoc-1",
};

describe("data set transfer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should do nothing when dataSetIds is empty", async () => {
    await initiateTransferDataSetData({
      ...mockParams,
      dataSetIds: [],
    });

    expect(mockedGetDataSetById).not.toHaveBeenCalled();
    expect(mockedGetDHIS2Periods).not.toHaveBeenCalled();
  });

  test("should successfully transfer dataset data for valid dataset and periods", async () => {
    mockedGetDataSetById.mockResolvedValue({
      id: "ds-1",
      name: "DataSet 1",
      periodType: "Monthly",
    });

    mockedGetDHIS2Periods.mockReturnValue(["202201"]);

    const mockDataValueSet = {
      dataSet: "ds-1",
      period: "202201",
      orgUnit: "source-ou-1",
      attributeOptionCombo: "aoc-1",
      dataValues: [
        {
          dataElement: "de-1",
          categoryOptionCombo: "coc-1",
          period: "202201",
          orgUnit: "source-ou-1",
          value: "10",
        },
      ],
    };

    mockedGetDataValueSetFromDHIS2.mockResolvedValue(mockDataValueSet);

    const mockUpdatedValueSets = [
      { ...mockDataValueSet, orgUnit: "source-ou-1", completeDate: null },
      { ...mockDataValueSet, orgUnit: "target-ou-2" },
    ];

    mockedGetUpdatedDataValueSets.mockResolvedValue(mockUpdatedValueSets);
    mockedSaveDataValueSetToDHIS2.mockResolvedValue(undefined);

    await initiateTransferDataSetData(mockParams);

    expect(mockedGetDataSetById).toHaveBeenCalledWith("ds-1");
    expect(mockedGetDHIS2Periods).toHaveBeenCalledWith({
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      periodType: "Monthly",
    });
    expect(mockedGetDataValueSetFromDHIS2).toHaveBeenCalledWith({
      period: "202201",
      orgUnit: "source-ou-1",
      dataSet: "ds-1",
      attributeOptionCombo: "aoc-1",
    });
    expect(mockedGetUpdatedDataValueSets).toHaveBeenCalledWith(
      mockDataValueSet,
      "target-ou-2",
    );
    expect(mockedSaveDataValueSetToDHIS2).toHaveBeenCalledTimes(2);
    expect(mockedSaveDataValueSetToDHIS2).toHaveBeenNthCalledWith(
      1,
      mockUpdatedValueSets[0],
    );
    expect(mockedSaveDataValueSetToDHIS2).toHaveBeenNthCalledWith(
      2,
      mockUpdatedValueSets[1],
    );
  });

  test("should warn and skip processing when no periods are generated", async () => {
    mockedGetDataSetById.mockResolvedValue({
      id: "ds-1",
      name: "DataSet 1",
      periodType: "Monthly",
    });
    mockedGetDHIS2Periods.mockReturnValue([]);

    await initiateTransferDataSetData(mockParams);

    expect(mockedGetDataSetById).toHaveBeenCalledWith("ds-1");
    expect(mockedGetDHIS2Periods).toHaveBeenCalledWith({
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      periodType: "Monthly",
    });
    expect(mockedGetDataValueSetFromDHIS2).not.toHaveBeenCalled();
  });

  test("should warn and skip saving when returned data value set has no dataValues", async () => {
    mockedGetDataSetById.mockResolvedValue({
      id: "ds-1",
      name: "DataSet 1",
      periodType: "Monthly",
    });
    mockedGetDHIS2Periods.mockReturnValue(["202201"]);
    mockedGetDataValueSetFromDHIS2.mockResolvedValue({
      dataSet: "ds-1",
      period: "202201",
      orgUnit: "source-ou-1",
      dataValues: [],
    });

    await initiateTransferDataSetData(mockParams);

    expect(mockedGetDataValueSetFromDHIS2).toHaveBeenCalled();
    expect(mockedGetUpdatedDataValueSets).not.toHaveBeenCalled();
    expect(mockedSaveDataValueSetToDHIS2).not.toHaveBeenCalled();
  });

  test("should handle getDataSetById failure gracefully and continue with remaining datasets", async () => {
    mockedGetDataSetById
      .mockRejectedValueOnce(new Error("Failed to get dataset ds-1"))
      .mockResolvedValueOnce({
        id: "ds-2",
        name: "DataSet 2",
        periodType: "Monthly",
      });

    mockedGetDHIS2Periods.mockReturnValue([]);

    await initiateTransferDataSetData({
      ...mockParams,
      dataSetIds: ["ds-1", "ds-2"],
    });

    expect(mockedGetDataSetById).toHaveBeenCalledTimes(2);
    expect(mockedGetDataSetById).toHaveBeenNthCalledWith(1, "ds-1");
    expect(mockedGetDataSetById).toHaveBeenNthCalledWith(2, "ds-2");
    expect(mockedGetDHIS2Periods).toHaveBeenCalledTimes(1);
    expect(mockedGetDHIS2Periods).toHaveBeenCalledWith({
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      periodType: "Monthly",
    });
  });

  test("should handle getDataValueSetFromDHIS2 failure gracefully for a period", async () => {
    mockedGetDataSetById.mockResolvedValue({
      id: "ds-1",
      name: "DataSet 1",
      periodType: "Monthly",
    });
    mockedGetDHIS2Periods.mockReturnValue(["202201", "202202"]);
    mockedGetDataValueSetFromDHIS2
      .mockRejectedValueOnce(new Error("Network error for 202201"))
      .mockResolvedValueOnce({
        dataSet: "ds-1",
        period: "202202",
        orgUnit: "source-ou-1",
        dataValues: [
          {
            dataElement: "de-1",
            categoryOptionCombo: "coc-1",
            period: "202202",
            orgUnit: "source-ou-1",
            value: "5",
          },
        ],
      });

    mockedGetUpdatedDataValueSets.mockResolvedValue([]);

    await initiateTransferDataSetData(mockParams);

    expect(mockedGetDataValueSetFromDHIS2).toHaveBeenCalledTimes(2);
    expect(mockedGetUpdatedDataValueSets).toHaveBeenCalledTimes(1);
  });

  test("should handle saveDataValueSetToDHIS2 failure gracefully", async () => {
    mockedGetDataSetById.mockResolvedValue({
      id: "ds-1",
      name: "DataSet 1",
      periodType: "Monthly",
    });
    mockedGetDHIS2Periods.mockReturnValue(["202201"]);

    const mockDataValueSet = {
      dataSet: "ds-1",
      period: "202201",
      orgUnit: "source-ou-1",
      dataValues: [
        {
          dataElement: "de-1",
          categoryOptionCombo: "coc-1",
          period: "202201",
          orgUnit: "source-ou-1",
          value: "10",
        },
      ],
    };

    mockedGetDataValueSetFromDHIS2.mockResolvedValue(mockDataValueSet);
    mockedGetUpdatedDataValueSets.mockResolvedValue([
      { ...mockDataValueSet, orgUnit: "source-ou-1" },
      { ...mockDataValueSet, orgUnit: "target-ou-2" },
    ]);

    mockedSaveDataValueSetToDHIS2
      .mockRejectedValueOnce(new Error("Failed to save first dataset payload"))
      .mockResolvedValueOnce(undefined);

    await initiateTransferDataSetData(mockParams);

    expect(mockedSaveDataValueSetToDHIS2).toHaveBeenCalledTimes(2);
  });
});
