import logger from "../../logging";

type TransferDataSetDataArgs = {
  startDate: string;
  endDate: string;
  sourceOuId: string;
  targetOuId: string;
  dataSetIds: string[];
};

export async function initiateTransferDataSetData({
  startDate,
  endDate,
}: TransferDataSetDataArgs): Promise<void> {
  logger.info(
    `Initiated transfer of dataset-data from ${startDate} to ${endDate}`,
  );

  // logic here!

  logger.info("Transfer of dataset-data completed successfully");
}
