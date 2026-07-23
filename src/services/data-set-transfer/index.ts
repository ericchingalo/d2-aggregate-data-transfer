import logger from "../../logging";
import { getDataSetById } from "./utils/data-set";
import {
  getDataValueSetFromDHIS2,
  getUpdatedDataValueSets,
  saveDataValueSetToDHIS2,
} from "./utils/data-value-set";
import { getDHIS2Periods } from "./utils/period";

type TransferDataSetDataArgs = {
  startDate: string;
  endDate: string;
  sourceOuId: string;
  targetOuId: string;
  dataSetIds: string[];
  attributeOptionCombo?: string;
};

export async function initiateTransferDataSetData({
  startDate,
  endDate,
  attributeOptionCombo,
  dataSetIds,
  sourceOuId,
  targetOuId,
}: TransferDataSetDataArgs): Promise<void> {
  logger.info(
    `Initiated transfer of dataset-data from ${startDate} to ${endDate}`,
  );

  if (dataSetIds.length === 0) {
    logger.warn("No data sets to transfer");
    return;
  }

  for (const dataSetId of dataSetIds) {
    try {
      const dataSet = await getDataSetById(dataSetId);
      if (dataSet.id) {
        const periods = getDHIS2Periods({
          startDate,
          endDate,
          periodType: dataSet.periodType,
        });

        if (periods.length > 0) {
          for (const period of periods) {
            try {
              const dataValueSet = await getDataValueSetFromDHIS2({
                period: period.trim(),
                orgUnit: sourceOuId,
                dataSet: dataSetId,
                attributeOptionCombo,
              });
              if (dataValueSet?.dataValues.length) {
                const updatedDataValuesSets = await getUpdatedDataValueSets(
                  dataValueSet,
                  targetOuId,
                );

                for (const updatedDataValueSet of updatedDataValuesSets) {
                  try {
                    await saveDataValueSetToDHIS2(updatedDataValueSet);
                  } catch (error) {
                    logger.error(
                      `Error updating data value set for data set ${dataSetId} for period ${period} at org unit ${targetOuId}`,
                      JSON.stringify(error, null, 2),
                    );
                  }
                }
              } else {
                logger.warn(
                  `No data values found for data set ${dataSetId} for period ${period}`,
                );
              }
            } catch (error) {
              logger.error(
                `Error processing data set transfers for ${dataSetId} data set`,
                JSON.stringify(error, null, 2),
              );
            }
          }
        } else {
          logger.warn(
            `No periods were generated for data set ${dataSetId} with period type ${dataSet.periodType} for the given period range`,
          );
        }
      }
    } catch (error) {
      logger.error(
        `Error processing data set transfers for ${dataSetId} data set`,
        JSON.stringify(error, null, 2),
      );
    }
  }

  logger.info("Transfer of dataset-data completed successfully");
}
