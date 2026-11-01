import { Icon } from "./Icon";

export function PracticeDisclosure() {
  return (
    <aside className="practice-disclosure" aria-label="Practice and privacy information">
      <span className="disclosure-icon"><Icon name="shield" size={17} /></span>
      <div>
        <strong>For practice and self-assessment</strong>
        <p>CheatPet explains questions you choose to submit. It never selects or submits answers on a webpage.</p>
        <p>Your question is sent directly to OpenAI only after you request an explanation. History stays in this browser profile.</p>
      </div>
    </aside>
  );
}
