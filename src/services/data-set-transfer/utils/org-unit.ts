import dhis2Client from "../../../clients/dhis2";
import logger from "../../../logging";

type organisationUnit = {
  id: string;
  name: string;
};

export async function getOrgUnitById(id: string): Promise<organisationUnit> {
  try {
    logger.info(`Getting organisation unit with id ${id}`);
    const response = await dhis2Client.get<organisationUnit>(
      `organisationUnits/${id}`,
    );
    if (response.status === 200) {
      logger.info(`Successfully retrieved organisation unit with id ${id}`);
      return response.data;
    } else {
      throw new Error(
        `Error retrieving organisation unit with id ${id}. Response status ${response.status} : ${JSON.stringify(response.data)}`,
      );
    }
  } catch (error) {
    logger.error(
      `Error retrieving organisation unit with id ${id}`,
      JSON.stringify(error, null, 2),
    );
    throw error;
  }
}
