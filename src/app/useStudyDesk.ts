import { useCallback, useEffect, useMemo, useState } from "react";
import { clearPracticeHistory, deletePracticeRecord, listHistory, savePracticeRecord, toggleSavedRecord } from "../shared/localHistory";
import { sendRuntimeRequest } from "../shared/messages";
import { parseQuestionInput } from "../shared/parseQuestion";
import { validateQuestionDraft } from "../shared/validateQuestion";
import type { PracticeRecord, ProviderId, PublicSettings, QuestionDraft, QuestionSource } from "../shared/types";
import type { AppView } from "./view";
import { consumeScreenshotHandoff, SCREENSHOT_HANDOFF_KEY } from "../shared/screenshotHandoff";

type Surface = "popup" | "workspace" | "options";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "That action could not be completed. Please try again.";
}

export function useStudyDesk(surface: Surface) {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [history, setHistory] = useState<PracticeRecord[]>([]);
  const [view, setView] = useState<AppView>(surface === "options" ? "settings" : "practice");
  const [question, setQuestion] = useState("");
  const [questionSource, setQuestionSource] = useState<QuestionSource>("manual");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [activeRecord, setActiveRecord] = useState<PracticeRecord>();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const source: QuestionSource = imageDataUrl ? "image" : questionSource;
  const parsed = useMemo(() => parseQuestionInput(question), [question]);

  const refreshHistory = useCallback(async () => {
    setHistory(await listHistory());
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.all([sendRuntimeRequest({ type: "GET_PUBLIC_SETTINGS" }), listHistory()])
      .then(([publicSettings, records]) => {
        if (!mounted) return;
        setSettings(publicSettings);
        setHistory(records);
      })
      .catch((reason: unknown) => { if (mounted) setError(errorMessage(reason)); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (surface !== "workspace") return;
    const params = new URLSearchParams(window.location.search);
    const sourceTabId = Number(params.get("sourceTabId"));
    const captureId = params.get("captureId");
    void consumeScreenshotHandoff(chrome.storage.session, sourceTabId, captureId ?? "").then((handoff) => {
      if (handoff) {
        setImageDataUrl(handoff.dataUrl);
        setImageName("Captured practice page");
        setQuestionSource("image");
      }
      if (captureId && !handoff) setError("That screenshot handoff is missing, expired, or invalid. Capture the page again from the toolbar popup.");
    }).catch(() => setError("The captured screenshot could not be transferred. Capture again from the toolbar popup."));
  }, [surface]);

  const runSettingsAction = useCallback(async (action: () => Promise<void>) => {
    setError("");
    setIsSaving(true);
    try {
      await action();
    } catch (reason) {
      setError(errorMessage(reason));
      throw reason;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const saveProvider = useCallback((provider: ProviderId, model: string) => runSettingsAction(async () => {
    const publicSettings = await sendRuntimeRequest({ type: "SAVE_PROVIDER_SETTINGS", provider, model });
    setSettings(publicSettings);
  }), [runSettingsAction]);

  const saveKey = useCallback((apiKey: string) => runSettingsAction(async () => {
    await sendRuntimeRequest({ type: "SAVE_API_KEY", apiKey });
    setSettings((current) => current ? { ...current, hasApiKey: true } : current);
  }), [runSettingsAction]);

  const removeKey = useCallback(() => runSettingsAction(async () => {
    await sendRuntimeRequest({ type: "REMOVE_API_KEY" });
    setSettings((current) => current ? { ...current, hasApiKey: false } : current);
  }), [runSettingsAction]);

  const deleteAllData = useCallback(() => runSettingsAction(async () => {
    await sendRuntimeRequest({ type: "DELETE_ALL_DATA" });
    await clearPracticeHistory();
    const defaults = await sendRuntimeRequest({ type: "GET_PUBLIC_SETTINGS" });
    setSettings(defaults);
    setHistory([]);
    setActiveRecord(undefined);
    setQuestion("");
    setImageDataUrl(undefined);
    setImageName(undefined);
  }), [runSettingsAction]);

  const addImage = useCallback((dataUrl: string, name: string) => {
    setImageDataUrl(dataUrl);
    setImageName(name);
    setError("");
  }, []);

  const captureScreenshot = useCallback(async () => {
    setError("");
    if (surface !== "popup") {
      setError("To capture the practice page, open CheatPet from the toolbar while that page is active, then choose Capture This Tab.");
      return;
    }
    try {
      const [sourceTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (typeof sourceTab?.id !== "number" || typeof sourceTab.windowId !== "number") throw new Error("Could not verify the active source tab. Close other extension popups and try again.");
      const focusedBefore = await chrome.windows.getLastFocused();
      if (focusedBefore.id !== sourceTab.windowId) throw new Error("The active browser window changed. Reopen CheatPet on the page you want to capture.");
      if (sourceTab.url?.startsWith("chrome://") || sourceTab.url?.startsWith("chrome-extension://")) throw new Error("Chrome does not allow capture from this page. Open a regular practice webpage first.");
      const dataUrl = await chrome.tabs.captureVisibleTab(sourceTab.windowId, { format: "jpeg", quality: 82 });
      const [stillActive] = await chrome.tabs.query({ active: true, windowId: sourceTab.windowId });
      const focusedAfter = await chrome.windows.getLastFocused();
      if (stillActive?.id !== sourceTab.id || focusedAfter.id !== sourceTab.windowId) throw new Error("The active tab or window changed during capture. No screenshot was transferred; try again on the intended page.");
      if (dataUrl.length > 5_700_000) throw new Error("This viewport screenshot is too large. Zoom out or resize the browser and capture again.");
      setImageDataUrl(dataUrl);
      setImageName(`Visible tab · ${new Date().toLocaleTimeString()}`);
      setQuestionSource("image");
      setActiveRecord(undefined);
      const captureId = crypto.randomUUID();
      await chrome.storage.session.set({ [SCREENSHOT_HANDOFF_KEY]: { dataUrl, sourceTabId: sourceTab.id, windowId: sourceTab.windowId, captureId, capturedAt: Date.now() } });
      const url = new URL(chrome.runtime.getURL("workspace.html"));
      url.searchParams.set("sourceTabId", String(sourceTab.id));
      url.searchParams.set("captureId", captureId);
      await chrome.tabs.create({ url: url.toString() });
    } catch (reason) {
      await chrome.storage.session.remove(SCREENSHOT_HANDOFF_KEY).catch(() => undefined);
      const message = errorMessage(reason);
      setError(message.includes("chrome://") || message.includes("Cannot access")
        ? "Chrome does not allow screenshots of this page. Open an ordinary website and capture again."
        : message);
    }
  }, [surface]);

  const useSelectedText = useCallback(async () => {
    setError("");
    try {
      // A workspace tab cannot capture itself. When it is opened from the popup,
      // keep the original tab id so the user-directed activeTab grant is used.
      const sourceTabId = new URLSearchParams(window.location.search).get("sourceTabId");
      const tabId = sourceTabId === null
        ? surface === "popup"
          ? (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id
          : undefined
        : Number(sourceTabId);
      if (typeof tabId !== "number" || !Number.isInteger(tabId)) {
        throw new Error("Open Study Desk from the toolbar on the practice page, then expand the workspace to capture selected text.");
      }
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => window.getSelection()?.toString().trim() ?? "",
      });
      const selected = results[0]?.result?.trim() ?? "";
      if (!selected) throw new Error("Select some practice text on the page first.");
      if (selected.length > 8_000) throw new Error("That selection is over 8,000 characters. Select a smaller section.");
      setQuestion(selected);
      setQuestionSource("selected-text");
      setImageDataUrl(undefined);
      setImageName(undefined);
      setView("practice");
      setActiveRecord(undefined);
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }, []);

  const generate = useCallback(async (questionOverride?: string) => {
    if (!settings) return;
    setError("");
    const draft: QuestionDraft = {
      question: questionOverride ? parseQuestionInput(questionOverride).question : parsed.question || question.trim(),
      options: questionOverride ? parseQuestionInput(questionOverride).options : parsed.options,
      source: imageDataUrl ? "image" : questionSource,
      imageDataUrl,
      imageName,
    };
    const validationError = validateQuestionDraft(draft);
    if (validationError) { setError(validationError); return; }
    setIsGenerating(true);
    try {
      const result = await sendRuntimeRequest({ type: "GENERATE_ANSWER", draft });
      const record: PracticeRecord = {
        ...result.answer,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        question: draft.question,
        options: draft.options,
        source: draft.source,
        provider: result.provider,
        model: result.model,
        saved: false,
      };
      await savePracticeRecord(record);
      await refreshHistory();
      setActiveRecord(record);
      setImageDataUrl(undefined);
      setImageName(undefined);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setIsGenerating(false);
    }
  }, [imageDataUrl, imageName, parsed, question, questionSource, refreshHistory, settings]);

  const toggleSaved = useCallback(async (id: string) => {
    try {
      setError("");
      await toggleSavedRecord(id);
      await refreshHistory();
      setActiveRecord((current) => current?.id === id ? { ...current, saved: !current.saved } : current);
    } catch (reason) { setError(errorMessage(reason)); }
  }, [refreshHistory]);

  const removeRecord = useCallback(async (id: string) => {
    try {
      setError("");
      await deletePracticeRecord(id);
      await refreshHistory();
      setActiveRecord((current) => current?.id === id ? undefined : current);
    } catch (reason) { setError(errorMessage(reason)); }
  }, [refreshHistory]);

  const openWorkspace = useCallback(() => {
    void (async () => {
      const url = new URL(chrome.runtime.getURL("workspace.html"));
      if (surface === "popup") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (typeof tab?.id === "number") url.searchParams.set("sourceTabId", String(tab.id));
      } else {
        const sourceTabId = new URLSearchParams(window.location.search).get("sourceTabId");
        if (sourceTabId) url.searchParams.set("sourceTabId", sourceTabId);
      }
      await chrome.tabs.create({ url: url.toString() });
    })().catch((reason: unknown) => setError(errorMessage(reason)));
  }, [surface]);

  const openSettings = useCallback(() => setView("settings"), []);
  const openRecord = useCallback((record: PracticeRecord) => { setActiveRecord(record); setView("practice"); }, []);
  const backToQuestion = useCallback(() => setActiveRecord(undefined), []);
  const startPractice = useCallback(() => { setView("practice"); setActiveRecord(undefined); }, []);

  return {
    settings,
    history,
    view,
    setView,
    question,
    setQuestion,
    imageDataUrl,
    imageName,
    addImage,
    captureScreenshot,
    removeImage: () => { setImageDataUrl(undefined); setImageName(undefined); },
    source,
    onQuestionChange: (value: string) => { setQuestion(value); setQuestionSource("manual"); },
    isLoading,
    isGenerating,
    isSaving,
    error,
    setError,
    activeRecord,
    generate,
    useSelectedText,
    saveProvider,
    saveKey,
    removeKey,
    deleteAllData,
    toggleSaved,
    removeRecord,
    openWorkspace,
    openSettings,
    openRecord,
    backToQuestion,
    startPractice,
  };
}
