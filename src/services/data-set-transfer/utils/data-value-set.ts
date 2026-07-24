import dhis2Client from "../../../clients/dhis2";
import logger from "../../../logging";
import { getOrgUnitById } from "./org-unit";

type DataValueSet = {
  dataSet: string;
  period: string;
  orgUnit: string;
  attributeOptionCombo?: string;
  dataValues: DataValue[];
  completeDate?: string | null;
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

type DataSetRegistration = {
  period: string;
  dataSet: string;
  organisationUnit: string;
  attributeOptionCombo: string;
  date: string;
  storedBy: string;
  completed: boolean;
};

type DataSetRegistrationParams = {
  period: string;
  dataSet: string;
  orgUnit: string;
};

type DataSetCompleteStatusPayload = {
  dataSet: string;
  period: string;
  orgUnit: string;
  attribute: {
    combo: string;
    options: string[];
  };
  completed: boolean;
};

type CategoryOptionCombo = {
  name: string;
  categoryCombo: {
    id: string;
  };
  categoryOptions: {
    id: string;
  }[];
  id: string;
};

export async function getCategoryOptionComboByID(
  id: string,
): Promise<CategoryOptionCombo> {
  logger.info(`Getting category option combo for data set ${id}`);

  const url = `categoryOptionCombos/${id}`;
  const response = await dhis2Client.get<CategoryOptionCombo>(url);
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(
      `Error retrieving category option combo for data set ${id}. Response status ${response.status} : ${JSON.stringify(response.data)}`,
    );
  }
}

export async function updatedDataSetCompleteStatus(
  payload: DataSetRegistration,
): Promise<void> {
  try {
    logger.info(
      `Updating data set complete status for data set ${payload.dataSet} for period ${payload.period} at org unit ${payload.organisationUnit}`,
    );

    const categoryOptionCombo = await getCategoryOptionComboByID(
      payload.attributeOptionCombo,
    );

    const url = "dataEntry/dataSetCompletion";

    if (categoryOptionCombo) {
      const dataSetCompletionPayload: DataSetCompleteStatusPayload = {
        dataSet: payload.dataSet,
        period: payload.period,
        orgUnit: payload.organisationUnit,
        attribute: {
          combo: categoryOptionCombo.categoryCombo.id,
          options: categoryOptionCombo.categoryOptions.map(
            (option) => option.id,
          ),
        },
        completed: payload.completed,
      };

      const response = await dhis2Client.post(url, dataSetCompletionPayload);

      if (response.status === 200) {
        logger.info(
          `Successfully updated data set complete status for data set ${payload.dataSet} for period ${payload.period} at org unit ${payload.organisationUnit}`,
        );
      } else {
        throw new Error(
          `Error updating data set complete status for data set ${payload.dataSet}. Response status ${response.status} : ${JSON.stringify(response.data)}`,
        );
      }
    } else {
      logger.warn(
        `Aborting update of completion status: Category option combo not found for data set ${payload.dataSet}`,
      );
    }
  } catch (error) {
    logger.error(
      `Error updating data set complete status for data set ${payload.dataSet}`,
      JSON.stringify(error, null, 2),
    );
    throw error;
  }
}

export async function getCompletedDataSetRegistrations(
  params: DataSetRegistrationParams,
): Promise<DataSetRegistration[]> {
  logger.info(
    `Getting data set registrations for data set ${params.dataSet} for period ${params.period} at org unit ${params.orgUnit}`,
  );

  const url = `completeDataSetRegistrations?period=${params.period}&orgUnit=${params.orgUnit}&dataSet=${params.dataSet}`;
  const response = await dhis2Client.get<{
    completeDataSetRegistrations: DataSetRegistration[];
  }>(url);

  if (response.status === 200) {
    logger.info(
      `Successfully retrieved data set registrations for data set ${params.dataSet} for period ${params.period} at org unit ${params.orgUnit}`,
    );
    return response.data.completeDataSetRegistrations ?? [];
  } else {
    throw new Error(
      `Error retrieving data set registrations for data set ${params.dataSet}. Response status ${response.status} : ${JSON.stringify(response.data)}`,
    );
  }
}

export async function saveDataValueSetToDHIS2(
  payload: DataValueSet,
  attributeOptionCombo?: string,
) {
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
      throw Error(
        `Error saving data value set for data set ${payload.dataSet}. Response status ${res.status} : ${JSON.stringify(res.data)}`,
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
      completeDate: null,
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
