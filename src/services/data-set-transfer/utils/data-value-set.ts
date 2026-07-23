import dhis2Client from "../../../clients/dhis2";
import logger from "../../../logging";
import { getOrgUnitById } from "./org-unit";

type DataValueSet = {
  dataSet: string;
  period: string;
  orgUnit: string;
  attributeOptionCombo?: string;
  dataValues: DataValue[];
  completedDate?: string | null;
};

type DataValue = {
  dataElement: string;
  categoryOptionCombo: string;
  period: string;
  orgUnit: string;
  value: string | null;
  comment?: string | null;
};

type DataValueSetArgs = {
  period: string;
  orgUnit: string;
  dataSet: string;
  attributeOptionCombo?: string;
};

export async function saveDataValueSetToDHIS2(payload: DataValueSet) {
  try {
    logger.info(
      `Saving data value set for data set ${payload.dataSet} for period ${payload.period} at org unit ${payload.orgUnit} `,
    );
    const url =
      "dataValueSets?async=false&importStrategy=CREATE_AND_UPDATE&dryRun=false";
    const res = await dhis2Client.post(url, payload);

    if (res.status === 200 || res.status === 201) {
      logger.info(
        `Successfully saved data value set for data set ${payload.dataSet} for period ${payload.period} at org unit ${payload.orgUnit} `,
      );

      const { response } = res?.data ?? {};

      if (response?.importCount) {
        const { imported, updated, deleted, ignored } = response.importCount;
        logger.info(
          `Data value set for data set ${payload.dataSet} for period ${payload.period} at org unit ${payload.orgUnit} has been saved successfully`,
        );
        logger.info(
          `Imported: ${imported} updated: ${updated} deleted: ${deleted} ignored: ${ignored}`,
        );
      } else {
        logger.warn(
          `No data values found for data set ${payload.dataSet} for period ${payload.period} at org unit ${payload.orgUnit}`,
        );
      }
    } else {
      logger.error(
        `Error saving data value set for data set ${payload.dataSet}`,
        JSON.stringify(res.data, null, 2),
      );
    }
  } catch (error) {
    logger.error(
      `Error saving data value set for data set ${payload.dataSet}`,
      JSON.stringify(error, null, 2),
    );
    throw error;
  }
}

export async function getDataValueSetFromDHIS2({
  period,
  orgUnit,
  dataSet,
  attributeOptionCombo,
}: DataValueSetArgs): Promise<DataValueSet> {
  try {
    logger.info(
      `Getting data value set for data set ${dataSet} for period ${period} at org unit ${orgUnit}`,
    );
    const url = `dataValueSets?period=${period}&orgUnit=${orgUnit}&dataSet=${dataSet}&attributeOptionCombo=${attributeOptionCombo}`;
    const response = await dhis2Client.get<DataValueSet>(url);

    if (response.status === 200) {
      logger.info(
        `Successfully retrieved data value set for data set ${dataSet} for period ${period} at org unit ${orgUnit}`,
      );
      return response.data;
    } else {
      throw new Error(
        `Error retrieving data value set for data set ${dataSet}. Response status ${response.status} : ${JSON.stringify(response.data)}`,
      );
    }
  } catch (error) {
    logger.error(
      `Error retrieving data value set for data set ${dataSet}`,
      JSON.stringify(error, null, 2),
    );
    throw error;
  }
}

export async function getUpdatedDataValueSets(
  dataValueSet: DataValueSet,
  targetOrgUnit: string,
): Promise<DataValueSet[]> {
  const sanitizedDataValueSets: DataValueSet[] = [];

  try {
    const target = await getOrgUnitById(targetOrgUnit);
    const originalDataValueSet: DataValueSet = {
      ...dataValueSet,
      completedDate: null,
      dataValues: dataValueSet.dataValues.map((dataValue: DataValue) => {
        return {
          ...dataValue,
          orgUnit: dataValueSet.orgUnit,
          value: null,
          comment: `This data was transfered to ${target?.name || targetOrgUnit}`,
        };
      }),
    };

    const updatedDataValueSet: DataValueSet = {
      ...dataValueSet,
      orgUnit: targetOrgUnit,
      dataValues: dataValueSet.dataValues.map((dataValue: DataValue) => {
        return {
          ...dataValue,
          orgUnit: targetOrgUnit,
        };
      }),
    };

    sanitizedDataValueSets.push(originalDataValueSet, updatedDataValueSet);
  } catch (error) {
    logger.error(
      `Error sanitizing data value set for data set ${dataValueSet.dataSet} for period ${dataValueSet.period} at org unit ${dataValueSet.orgUnit}`,
      JSON.stringify(error, null, 2),
    );
    throw error;
  } finally {
    return sanitizedDataValueSets;
  }
}
