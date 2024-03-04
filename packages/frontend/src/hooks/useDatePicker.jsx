import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import {
  format,
  addDays,
  addMonths,
  addYears,
  differenceInDays,
  getTime,
  parseISO,
  startOfDay,
} from "date-fns";
import { pt, enUS, es } from "date-fns/locale";
import { maskCapitalize } from "../helpers/mask";

const useDatePicker = () => {
  const { i18n, t } = useTranslation("new_activity");
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    if (i18n.resolvedLanguage === "pt-BR") {
      setLocale("pt-BR");
    } else if (i18n.resolvedLanguage === "es") {
      setLocale("es");
    } else {
      setLocale("en");
    }
  }, [i18n.resolvedLanguage]);

  const getLocale = (l) => {
    if (l === "pt-BR") return pt;
    if (l === "es") return es;
    return enUS;
  };

  const getWeekDays = () => {
    const baseDate = new Date(2023, 0, 1);
    const days = [];
    for (let i = 0; i < 7; i++)
      days.push(
        maskCapitalize(
          format(addDays(baseDate, i), "EEE", { locale: getLocale(locale) })
        )
      );
    return days;
  };

  const getMonths = () => {
    const baseDate = new Date(2023, 0, 1);
    const months = [];
    for (let i = 0; i < 12; i++)
      months.push(
        maskCapitalize(
          format(addMonths(baseDate, i), "MMMM", { locale: getLocale(locale) })
        )
      );
    return months;
  };

  const verifyMaxDates = useCallback((maxDays, dates) =>
      dates.length > maxDays
        ? `${t("new_activity_dates_max")} ${maxDays} ${t(
            "new_activity_dates_days"
          )}`
        : false,
    [t]
  );

  const verifyDuration = useCallback((maxDiff, dates) => {
      if (dates.length >= 2) {
        const formatDate = (date) =>
          `${date.year}-${
            date.month.number < 10 ? "0" + date.month.number : date.month.number
          }-${date.day < 10 ? "0" + date.day : date.day}`;
        const firstDay = formatDate(dates[0]);
        const lastDay = formatDate(dates[dates.length - 1]);
        const diffDays = differenceInDays(
          startOfDay(parseISO(lastDay)),
          startOfDay(parseISO(firstDay))
        );
        return diffDays + 1 > maxDiff
          ? `${t("new_activity_dates_duration")} ${maxDiff} ${t(
              "new_activity_dates_days"
            )}`
          : false;
      }
      return false;
    },
    [t]
  );

  const datePickerFormat = useCallback(
    (l = locale) => {
      if (l === "pt-BR") return "DD/MM/YY";
      if (l === "es") return "DD/MM/YY";
      return "MM/DD/YY";
    },
    [locale]
  );

  const datePickerConfig = {
    multiple: true,
    sort: true,
    maxDate: addYears(new Date(), 1),
    weekDays: getWeekDays(),
    months: getMonths(),
    format: datePickerFormat(),
    inputClass:
      "w-full px-4 py-2 text-text-700 placeholder-text-500 bg-white border rounded-lg",
  };

  const datePickerSurveyConfig = {
    ...datePickerConfig,
    multiple: false,
  };

  const validateActivityDates = useCallback(
    (maxDays, maxDiff, dates) => {
      const maxDates = verifyMaxDates(maxDays, dates);
      const maxDuration = verifyDuration(maxDiff, dates);
      return maxDates || maxDuration || "";
    },
    [verifyDuration, verifyMaxDates]
  );

  const dateToTimestap = useCallback((date) => {
    const formatedDate = `${date.year}-${
      date.month.number < 10 ? "0" + date.month.number : date.month.number
    }-${date.day < 10 ? "0" + date.day : date.day}`;
    const [year, month, day] = formatedDate.split("-");
    return getTime(new Date(year, month - 1, day));
  }, []);

  const dateToString = useCallback((date) => {
    return date.format();
  }, []);

  const datesToString = useCallback((dates) => {
    const formatedDates = [];
    dates.forEach((d) => formatedDates.push(d.format()));
    return JSON.stringify(formatedDates);
  }, []);

  const stringToDateObject = useCallback(
    (d, l) => {
      return new DateObject({
        date: d,
        format: datePickerFormat(l),
      });
    },
    [datePickerFormat]
  );

  return {
    datePickerConfig,
    datePickerSurveyConfig,
    validateActivityDates,
    dateToTimestap,
    dateToString,
    datesToString,
    stringToDateObject,
  };
};

export default useDatePicker;
