export type AppView = "practice" | "history" | "settings";

export const appViews: Array<{ id: AppView; label: string; icon: "spark" | "history" | "bookmark" | "settings" }> = [
  { id: "practice", label: "Practice", icon: "spark" },
  { id: "history", label: "History", icon: "history" },
  { id: "settings", label: "Settings", icon: "settings" },
];
