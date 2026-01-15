// The below two types are used for a number with arbitrary length. By default the type `${number}` allows spaces which is not allowed in cron expressions.
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type NumberWithoutSpaces = `${Digit}${number | ""}` & `${number | ""}${Digit}`;

// The below type is used to constrain the cron expression to only allow valid characters. This will find any invalid characters in the cron expression.
type CronChars = `${"*" | "/" | "-" | "," | NumberWithoutSpaces}`;

/**
 * Will return false if the TMaybeCron string contains any invalid characters.
 * Otherwise it will return true.
 */
type ConstrainedCronString<TMaybeCron extends string> = TMaybeCron extends ""
  ? true
  : TMaybeCron extends `${CronChars}${infer Rest}`
    ? ConstrainedCronString<Rest>
    : false;

/**
 * Will return true if the TMaybeCron string is a valid cron expression.
 * Otherwise it will return false.
 *
 * It allows cron expressions with 5 or 6 parts. (Seconds are optional)
 * See https://nodecron.com/docs/
 */
export type ValidateCron<TMaybeCron extends string> =
  TMaybeCron extends `${infer inferedSecond} ${infer inferedMinute} ${infer inferedHour} ${infer inferedMonthDay} ${infer inferedMonth} ${infer inferedWeekDay}`
    ? ConstrainedCronString<inferedSecond> extends true
      ? ConstrainedCronString<inferedMinute> extends true
        ? ConstrainedCronString<inferedHour> extends true
          ? ConstrainedCronString<inferedMonthDay> extends true
            ? ConstrainedCronString<inferedMonth> extends true
              ? ConstrainedCronString<inferedWeekDay> extends true
                ? true
                : false
              : false
            : false
          : false
        : false
      : false
    : TMaybeCron extends `${infer inferedMinute} ${infer inferedHour} ${infer inferedMonthDay} ${infer inferedMonth} ${infer inferedWeekDay}`
      ? ConstrainedCronString<inferedMinute> extends true
        ? ConstrainedCronString<inferedHour> extends true
          ? ConstrainedCronString<inferedMonthDay> extends true
            ? ConstrainedCronString<inferedMonth> extends true
              ? ConstrainedCronString<inferedWeekDay> extends true
                ? true
                : false
              : false
            : false
          : false
        : false
      : false;

/**
 * Will return the cron expression if it is valid.
 * Otherwise it will return void (as type).
 */
export const checkCron = <const T extends string>(cron: T) => {
  return cron as ValidateCron<T> extends true ? T : void;
};
