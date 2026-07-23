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
  .option(
    "--attributeOptionCombo <attribute-option-combo-id>",
    "Attribute option combo id",
  )
  .action(
    ({
      startDate,
      endDate,
      dataSetIds,
      attributeOptionCombo,
      from: source,
      to: target,
    }: {
      startDate: string;
      endDate?: string;
      from: string;
      to: string;
      dataSetIds: string;
      attributeOptionCombo?: string;
    }) => {
      endDate = endDate ?? DateTime.now().toFormat("yyyy-MM-dd");
      const dataSetIdsList: string[] = dataSetIds.split(",");
      try {
        initiateTransferDataSetData({
          startDate,
          endDate,
          attributeOptionCombo,
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
