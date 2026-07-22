import dhis2Client from "../../../clients/dhis2";
import logger from "../../../logging";

type DataSet = {
  id: string;
  name: string;
  periodType: string;
};

export async function getDataSetById(id: string): Promise<DataSet> {
  try {
    logger.info(`Getting data set with id ${id}`);
    const response = await dhis2Client.get<DataSet>(`dataSets/${id}`);
    if (response.status === 200) {
      logger.info(`Successfully retrieved data set with id ${id}`);
      return response.data;
    } else {
      throw new Error(
        `Error retrieving data set with id ${id}. Response status ${response.status} : ${JSON.stringify(response.data)}`,
      );
    }
  } catch (error) {
    logger.error(
      `Error retrieving data set with id ${id}`,
      JSON.stringify(error, null, 2),
    );
    throw error;
  }
}
