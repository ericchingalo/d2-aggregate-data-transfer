import { Command } from "commander";

import { DateTime } from "luxon";
import { initiateTransferDataSetData } from "../services/data-set-transfer";
import logger from "../logging";

const program = new Command();

program
  .command("transfer")
  .requiredOption("--startDate <YYYY-MM-DD>", "Start date (YYYY-MM-DD)")
  .requiredOption("--from <source-ou-id>", "Source organisation unit id")
  .requiredOption("--to <target-ou-id>", "Target organisation unit id")
  .requiredOption(
    "--dataSetIds <comma-separated-data-set-id>",
    "Comma separated data set ids",
  )
  .option(
    "--endDate <YYYY-MM-DD>",
    "End date (YYYY-MM-DD)",
    DateTime.now().toFormat("yyyy-MM-dd"),
  )
  .action(
    ({
      startDate,
      endDate,
      from: source,
      to: target,
      dataSetIds,
    }: {
      startDate: string;
      endDate?: string;
      from: string;
      to: string;
      dataSetIds: string;
    }) => {
      endDate = endDate ?? DateTime.now().toFormat("yyyy-MM-dd");
      const dataSetIdsList: string[] = dataSetIds.split(",");
      try {
        initiateTransferDataSetData({
          startDate,
          endDate,
          dataSetIds: dataSetIdsList,
          sourceOuId: source,
          targetOuId: target,
        });
      } catch (error: any) {
        logger.error(
          "Error transferring dataset-data",
          JSON.stringify(error, null, 2),
        );
        process.exit(1);
      }
    },
  );

export default program;
