export const powerRules = [
  {
    id: "POWER_IDLE_CUT",
    when: (d) => d.status === "idle" && d.power > 5,
    then: (ctx, d) => {
      ctx.command("power_down", 0, "POWER_IDLE_CUT");
      ctx.alert(`Idle power cut: ${d.machine_id}`, "info");
    },
  },
  {
    id: "POWER_SPIKE",
    when: (d) => d.power > 50,
    then: (ctx, d) => {
      ctx.alert(`Power spike ${d.power}kW on ${d.machine_id}`, "critical");
    },
  },
];
