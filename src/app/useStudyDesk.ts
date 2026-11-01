import { useCallback, useEffect, useMemo, useState } from "react";
import { clearPracticeHistory, deletePracticeRecord, listHistory, savePracticeRecord, toggleSavedRecord } from "../shared/localHistory";
import { sendRuntimeRequest } from "../shared/messages";
import { parseQuestionInput } from "../shared/parseQuestion";
import { validateQuestionDraft } from "../shared/validateQuestion";
import type { PracticeRecord, ProviderId, PublicSettings, QuestionDraft, QuestionSource } from "../shared/types";
import type { AppView } from "./view";

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

  const useSelectedText = useCallback(async () => {
    setError("");
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (typeof tab?.id !== "number") throw new Error("No active browser tab is available. Open a practice page and try again.");
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
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

  const generate = useCallback(async () => {
    if (!settings) return;
    setError("");
    const draft: QuestionDraft = {
      question: parsed.question || question.trim(),
      options: parsed.options,
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
    void chrome.tabs.create({ url: chrome.runtime.getURL("workspace.html") });
  }, []);

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
