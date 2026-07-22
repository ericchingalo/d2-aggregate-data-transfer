import { Command } from "commander";

import logger from "../logging";

const program = new Command();

// call command for transfering dataset-data
program.command("transfer-dataset-data").action(() => {
  logger.info("Initiated the transfer of dataset-data");
});

export default program;
