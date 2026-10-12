export const machineRules = [
  {
    id: "MACHINE_OFFLINE",
    when: (d) => d.status === "offline",
    then: (ctx, d) => {
      ctx.alert(`Machine offline: ${d.machine_id}`, "critical");
    },
  },
  {
    id: "RPM_OVERSPEED",
    when: (d) => d.rpm > 3500,
    then: (ctx, d) => {
      ctx.alert(`Overspeed ${d.rpm} RPM on ${d.machine_id}`, "critical");
      ctx.command("set_speed", 3000, "RPM_OVERSPEED");
    },
  },
];
