import { useForestPeriod } from "../hooks/useForestPeriod";

export function ForestAmbient() {
  const period = useForestPeriod();

  return (
    <div className={`forest-ambient forest-${period}`} aria-hidden="true">
      {period === "night" ? (
        <>
          <div className="firefly firefly-a" />
          <div className="firefly firefly-b" />
          <div className="firefly firefly-c" />
          <div className="firefly firefly-d" />
          <div className="firefly firefly-e" />
        </>
      ) : null}
    </div>
  );
}
