import dhis2Client from "../../../clients/dhis2";
import logger from "../../../logging";

type DataValueSet = {
  dataSet: string;
  period: string;
  orgUnit: string;
  attributeOptionCombo?: string;
  dataValues: DataValue[];
  completedDate?: string;
};

type DataValue = {
  dataElement: string;
  categoryOptionCombo: string;
  period: string;
  orgUnit: string;
  value: string | null;
};

type DataValueSetArgs = {
  period: string;
  orgUnit: string;
  dataSet: string;
};

export async function saveDataValueSetToDHIS2(payload: DataValueSet) {
  try {
    logger.info(
      `Saving data value set for data set ${payload.dataSet} for period ${payload.period} at org unit ${payload.orgUnit} `,
    );
    const url =
      "dataValueSets?async=false&importStrategy=CREATE_AND_UPDATE&dryRun=false";
    const response = await dhis2Client.post(url, payload);

    if (response.status === 200 || response.status === 201) {
      logger.info(
        `Successfully saved data value set for data set ${payload.dataSet} for period ${payload.period} at org unit ${payload.orgUnit} `,
      );
      console.log("RESPONSE:::", JSON.stringify(response.data));
    } else {
      logger.error(
        `Error saving data value set for data set ${payload.dataSet}`,
        JSON.stringify(response, null, 2),
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
}: DataValueSetArgs): Promise<DataValueSet> {
  try {
    logger.info(
      `Getting data value set for data set ${dataSet} for period ${period} at org unit ${orgUnit}`,
    );
    const url = `dataValueSets?period=${period}&orgUnit=${orgUnit}&dataSet=${dataSet}`;
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
