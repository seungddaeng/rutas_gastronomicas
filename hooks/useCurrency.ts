import { useMemo, useCallback } from "react";

export function useCurrency(
  locale: string = "es-BO",
  currency: string = "BOB",
  maximumFractionDigits: number = 0
) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits,
      }),
    [locale, currency, maximumFractionDigits]
  );

  const format = useCallback((value: number) => formatter.format(value), [formatter]);
  return { format };
}