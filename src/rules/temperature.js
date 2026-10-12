export const temperatureRules = [
  {
    id: "TEMP_CRITICAL",
    when: (d) => d.temp >= 95,
    then: (ctx, d) => {
      ctx.alert(`CRITICAL: Temp ${d.temp}C on ${d.machine_id}`, "critical");
      ctx.command("set_speed", Math.round(d.rpm * 0.8), "TEMP_CRITICAL");
    },
  },
  {
    id: "TEMP_WARN",
    when: (d) => d.temp >= 85 && d.temp < 95,
    then: (ctx, d) => {
      ctx.alert(`WARN: Temp ${d.temp}C on ${d.machine_id}`, "warning");
    },
  },
  {
    id: "TEMP_OK",
    when: (d) => d.temp < 80,
    then: (ctx) => {
      ctx.clearAlert();
    },
  },
];
