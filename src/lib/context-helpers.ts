export function repoContextHelper() {
  if (typeof window === "undefined") return { key: "repoContext", value: "" };
  const selectedRepo =
    localStorage.getItem("devpilot-repo") || "tambo-ai/tambo";
  return {
    key: "repoContext",
    value: JSON.stringify({
      selectedRepo,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentDate: new Date().toISOString().split("T")[0],
    }),
  };
}

export function currentTimeHelper() {
  return {
    key: "currentTime",
    value: new Date().toISOString(),
  };
}
