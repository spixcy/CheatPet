import { AnswerResult } from "./components/AnswerResult";
import { BrandHeader } from "./components/BrandHeader";
import { HistoryList } from "./components/HistoryList";
import { Icon } from "./components/Icon";
import { Navigation } from "./components/Navigation";
import { PracticeDisclosure } from "./components/PracticeDisclosure";
import { QuestionComposer } from "./components/QuestionComposer";
import { SettingsPanel } from "./components/SettingsPanel";
import { useStudyDesk } from "./useStudyDesk";

type Surface = "popup" | "workspace" | "options";

export function App({ surface }: { surface: Surface }) {
  const desk = useStudyDesk(surface);
  const resultIsVisible = desk.view === "practice" && Boolean(desk.activeRecord);

  return (
    <main className={`app-shell app-shell--${surface}`}>
      <BrandHeader surface={surface} onSettings={desk.openSettings} onOpenWorkspace={surface === "popup" ? desk.openWorkspace : undefined} />
      {desk.isLoading ? (
        <div className="loading-state" role="status"><span className="loading-spinner" /> Preparing your Study Desk…</div>
      ) : (
        <>
          <Navigation activeView={desk.view} onSelect={desk.setView} />
          <div className="app-content">
            {desk.view === "practice" && (
              resultIsVisible && desk.activeRecord ? (
                <AnswerResult record={desk.activeRecord} onSave={(id) => void desk.toggleSaved(id)} onBack={desk.backToQuestion} />
              ) : (
                <QuestionComposer
                  value={desk.question}
                  source={desk.source}
                  imageDataUrl={desk.imageDataUrl}
                  imageName={desk.imageName}
                  hasApiKey={desk.settings?.hasApiKey ?? false}
                  isGenerating={desk.isGenerating}
                  error={desk.error}
                  onChange={desk.onQuestionChange}
                  onImage={desk.addImage}
                  onCapture={() => void desk.captureScreenshot()}
                  onRemoveImage={desk.removeImage}
                  onUseSelectedText={() => void desk.useSelectedText()}
                  onGenerate={() => void desk.generate()}
                  onOpenSettings={desk.openSettings}
                />
              )
            )}
            {desk.view === "history" && <HistoryList records={desk.history} savedOnly={false} onOpen={desk.openRecord} onSave={(id) => void desk.toggleSaved(id)} onDelete={(id) => void desk.removeRecord(id)} onPractice={desk.startPractice} />}
            {desk.view === "saved" && <HistoryList records={desk.history} savedOnly onOpen={desk.openRecord} onSave={(id) => void desk.toggleSaved(id)} onDelete={(id) => void desk.removeRecord(id)} onPractice={desk.startPractice} />}
            {desk.view === "settings" && desk.settings && (
              <SettingsPanel
                key={`${desk.settings.provider}-${desk.settings.model}`}
                settings={desk.settings}
                busy={desk.isSaving}
                error={desk.error}
                onSaveProvider={desk.saveProvider}
                onSaveKey={desk.saveKey}
                onRemoveKey={desk.removeKey}
                onDeleteAll={desk.deleteAllData}
              />
            )}
            {desk.view === "settings" && !desk.settings && <p className="inline-error" role="alert">Settings could not be loaded. Reload the extension and try again.</p>}
            {desk.view !== "practice" && desk.view !== "settings" && desk.error && <p className="inline-error" role="alert"><Icon name="warning" size={16} />{desk.error}</p>}
            {desk.view === "practice" && <PracticeDisclosure />}
          </div>
        </>
      )}
    </main>
  );
}
