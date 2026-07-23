import { DateTime } from "luxon";

type Props = {
  startDate: string;
  endDate: string;
  periodType: string;
};

enum PERIOD_TYPES {
  DAILY = "Daily",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  QUARTERLY = "Quarterly",
  YEARLY = "Yearly",
}

export function getDHIS2Periods({
  startDate,
  endDate,
  periodType,
}: Props): string[] {
  const periods: string[] = [];
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  let current = start;
  switch (periodType) {
    case PERIOD_TYPES.DAILY:
      while (current <= end) {
        periods.push(current.toFormat("yyyyMMdd"));
        current = current.plus({ days: 1 });
      }
      break;
    case PERIOD_TYPES.WEEKLY:
      while (current <= end) {
        periods.push(current.toFormat("yyyy'W'W"));
        current = current.plus({ days: 7 });
      }
      break;
    case PERIOD_TYPES.MONTHLY:
      while (current <= end) {
        periods.push(current.toFormat("yyyyMM"));
        current = current.plus({ months: 1 });
      }
      break;
    case PERIOD_TYPES.QUARTERLY:
      while (current <= end) {
        periods.push(current.toFormat("yyyy'Q'q"));
        current = current.plus({ months: 3 });
      }
      break;
    case PERIOD_TYPES.YEARLY:
      while (current <= end) {
        periods.push(current.toFormat("yyyy"));
        current = current.plus({ years: 1 });
      }
      break;
    default:
      throw new Error(`Unsupported period type: ${periodType}`);
  }
  return periods;
}
