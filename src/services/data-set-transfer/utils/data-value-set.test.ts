import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  saveDataValueSetToDHIS2,
  getDataValueSetFromDHIS2,
  getUpdatedDataValueSets,
} from "./data-value-set";
import dhis2Client from "../../../clients/dhis2";
import { getOrgUnitById } from "./org-unit";

vi.mock("../../../clients/dhis2", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("./org-unit");

const mockedGet = vi.mocked(dhis2Client.get);
const mockedPost = vi.mocked(dhis2Client.post);
const mockedGetOrgUnitById = vi.mocked(getOrgUnitById);

describe("data-value-set utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveDataValueSetToDHIS2", () => {
    const payload = {
      dataSet: "ds-1",
      period: "202301",
      orgUnit: "ou-1",
      dataValues: [
        {
          dataElement: "de-1",
          categoryOptionCombo: "coc-1",
          period: "202301",
          orgUnit: "ou-1",
          value: "10",
        },
      ],
    };

    test("should successfully save data value set with importCount response", async () => {
      mockedPost.mockResolvedValueOnce({
        status: 200,
        data: {
          response: {
            importCount: {
              imported: 1,
              updated: 0,
              deleted: 0,
              ignored: 0,
            },
          },
        },
      } as any);

      await saveDataValueSetToDHIS2(payload);

      expect(mockedPost).toHaveBeenCalledWith(
        "dataValueSets?async=false&importStrategy=CREATE_AND_UPDATE&dryRun=false",
        payload,
      );
    });

    test("should handle status 200 response without importCount", async () => {
      mockedPost.mockResolvedValueOnce({
        status: 200,
        data: {},
      } as any);

      await saveDataValueSetToDHIS2(payload);

      expect(mockedPost).toHaveBeenCalled();
    });

    test("should handle status other than 200/201 without throwing", async () => {
      mockedPost.mockResolvedValueOnce({
        status: 400,
        data: { message: "Bad Request" },
      } as any);

      await saveDataValueSetToDHIS2(payload);

      expect(mockedPost).toHaveBeenCalled();
    });

    test("should re-throw when dhis2Client post throws an error", async () => {
      mockedPost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(saveDataValueSetToDHIS2(payload)).rejects.toThrow(
        "Network Error",
      );
    });
  });

  describe("getDataValueSetFromDHIS2", () => {
    const args = {
      period: "202301",
      orgUnit: "ou-1",
      dataSet: "ds-1",
      attributeOptionCombo: "aoc-1",
    };

    test("should return data value set when status is 200", async () => {
      const mockDataValueSet = {
        dataSet: "ds-1",
        period: "202301",
        orgUnit: "ou-1",
        dataValues: [],
      };

      mockedGet.mockResolvedValueOnce({
        status: 200,
        data: mockDataValueSet,
      } as any);

      const result = await getDataValueSetFromDHIS2(args);

      expect(mockedGet).toHaveBeenCalledWith(
        "dataValueSets?period=202301&orgUnit=ou-1&dataSet=ds-1&attributeOptionCombo=aoc-1",
      );
      expect(result).toEqual(mockDataValueSet);
    });

    test("should throw error when status is not 200", async () => {
      mockedGet.mockResolvedValueOnce({
        status: 500,
        data: { error: "Server error" },
      } as any);

      await expect(getDataValueSetFromDHIS2(args)).rejects.toThrow(
        'Error retrieving data value set for data set ds-1. Response status 500 : {"error":"Server error"}',
      );
    });

    test("should re-throw error when dhis2Client get fails", async () => {
      mockedGet.mockRejectedValueOnce(new Error("Connection refused"));

      await expect(getDataValueSetFromDHIS2(args)).rejects.toThrow(
        "Connection refused",
      );
    });
  });

  describe("getUpdatedDataValueSets", () => {
    const inputDataValueSet = {
      dataSet: "ds-1",
      period: "202301",
      orgUnit: "source-ou-1",
      completeDate: "2023-01-15",
      dataValues: [
        {
          dataElement: "de-1",
          categoryOptionCombo: "coc-1",
          period: "202301",
          orgUnit: "source-ou-1",
          value: "25",
        },
      ],
    };

    test("should correctly transform data value sets using target org unit name", async () => {
      mockedGetOrgUnitById.mockResolvedValueOnce({
        id: "target-ou-2",
        name: "Regional Hospital",
      });

      const result = await getUpdatedDataValueSets(
        inputDataValueSet,
        "target-ou-2",
      );

      expect(mockedGetOrgUnitById).toHaveBeenCalledWith("target-ou-2");
      expect(result).toHaveLength(2);

      // Original data value set (cleared values with comment)
      expect(result[0]).toEqual({
        ...inputDataValueSet,
        completeDate: null,
        dataValues: [
          {
            dataElement: "de-1",
            categoryOptionCombo: "coc-1",
            period: "202301",
            orgUnit: "source-ou-1",
            value: null,
            comment: "This data was transfered to Regional Hospital",
          },
        ],
      });

      // Target data value set
      expect(result[1]).toEqual({
        ...inputDataValueSet,
        orgUnit: "target-ou-2",
        dataValues: [
          {
            dataElement: "de-1",
            categoryOptionCombo: "coc-1",
            period: "202301",
            orgUnit: "target-ou-2",
            value: "25",
          },
        ],
      });
    });

    test("should fallback to targetOrgUnit ID when target org unit name is not returned", async () => {
      mockedGetOrgUnitById.mockResolvedValueOnce({
        id: "target-ou-2",
        name: "",
      });

      const result = await getUpdatedDataValueSets(
        inputDataValueSet,
        "target-ou-2",
      );

      expect(result[0].dataValues[0].comment).toBe(
        "This data was transfered to target-ou-2",
      );
    });
  });
});
