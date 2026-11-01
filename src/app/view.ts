export type AppView = "practice" | "history" | "saved" | "settings";

export const appViews: Array<{ id: AppView; label: string; icon: "spark" | "history" | "bookmark" | "settings" }> = [
  { id: "practice", label: "Practice", icon: "spark" },
  { id: "history", label: "History", icon: "history" },
  { id: "saved", label: "Saved", icon: "bookmark" },
  { id: "settings", label: "Settings", icon: "settings" },
];
