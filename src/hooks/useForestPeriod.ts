import { useEffect, useState } from "react";

export type ForestPeriod = "morning" | "afternoon" | "evening" | "night";

function getForestPeriodFromHour(hour: number): ForestPeriod {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
}

export function useForestPeriod() {
  const [period, setPeriod] = useState<ForestPeriod>(() =>
    getForestPeriodFromHour(new Date().getHours()),
  );

  useEffect(() => {
    const update = () =>
      setPeriod(getForestPeriodFromHour(new Date().getHours()));
    update();
    const interval = window.setInterval(update, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  return period;
}
