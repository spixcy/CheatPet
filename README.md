# CheatPet Study Desk

CheatPet is an independent Chrome Manifest V3 study companion. It explains practice questions that you choose to enter, select, or upload. It does not inspect pages in the background, choose answers on webpages, or submit forms.

## Features

- Enter questions and common A/B/C or numbered choices, with a parsed choice preview.
- Explicitly import selected page text after clicking **Use selected practice text**.
- Attach a PNG, JPEG, or WebP question image up to 4 MB.
- Request an explanation, reasoning steps, qualitative confidence, and ambiguity notes from OpenAI.
- Keep up to 100 explanation records in local Chrome extension storage; save or delete individual records.
- Store your own OpenAI key in extension-local storage. The key is not returned to the app UI or a webpage.
- Remove the key, preferences, history, and saved explanations with **Delete all local data**.

## Build and install locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```powershell
npm install
npm run build
```

In Chrome, open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the generated `dist/` directory. The toolbar popup opens the compact Study Desk. Use its expand control to open the full workspace; extension details also provide the Settings page.

For local UI development, run `npm run dev`. The development server does not have Chrome extension APIs, so provider, storage, and tab-selection actions require loading the production build as an unpacked extension.

## Configure OpenAI

Open **Settings**, enter an OpenAI API key and model ID, and save. The default model ID is `gpt-6-luna`; you can enter another model available to your OpenAI API account. API access and usage charges are managed by OpenAI, not CheatPet.

When you click **Explain this question**, the question text, choices, and optional image are sent directly from the extension service worker to the OpenAI Responses API. The app does not send that request through a CheatPet server. OpenAI handles submitted content under your API account's terms and data controls.

The key is stored in Chrome extension local storage on this device. Chrome local storage is not encrypted by CheatPet. The extension restricts storage access to trusted extension contexts and never returns the key in its settings response, but anyone with access to the browser profile or extension developer tools may be able to inspect local extension data.

## Privacy and permissions

- `activeTab` and `scripting` are used only after you click the selected-text control. The extension reads the current text selection; it has no content script and does not read full pages.
- `storage` holds provider preferences, the API key, and local practice history. History does not include uploaded image bytes.
- The only host permission is `https://api.openai.com/*`, used for the direct provider request.
- There is no CheatPet account, analytics endpoint, or background page monitoring.
- A submitted question and any attached image leave this browser for OpenAI when you request an explanation. Clear local data from Settings when you want to remove the extension's stored records and key.

CheatPet is intended for practice, study, and self-assessment. Follow the rules that apply to your course or assessment.

## Development checks

```powershell
npm run typecheck
npm test
npm run build
```

The test suite covers question parsing and validation, provider request/response handling, extension message boundaries, settings storage, and history behavior.

## Reference research

The original product study and REA evidence are documented in [`research/`](research/). The captured public reference pages exposed four demo modes, but CheatPet intentionally implements a user-directed practice workflow without covert page overlays, automatic answer selection, or answer submission. The official extension runtime and private source were not available during inspection, so the research notes distinguish public claims from observed behavior.
"# CheatPet" 
