# Permissions, privacy, and access limits

**Inspection date:** 2026-11-02  
**Evidence:** Chrome Web Store listing `ev_d242ba7…`, listing privacy page and public publisher policy captures in `ev_a8389b1…`, and cookie dialog `ev_97da396…`.

## Quizonator access requirements

| Access or data | Status | What was observed |
|---|---|---|
| Chrome extension listing | **VERIFIED** | Public listing reachable; it identifies the publisher and displays an Add to Chrome control. The control was disabled in this browser session; a Sign in link was shown. |
| Quizonator account | **VERIFIED as published requirement** | The extension page says to sign in after installation. No account was created. |
| Paid subscription | **VERIFIED as a plan option** | Public pricing page shows Free, Pro, and Pro+ plans. We did not purchase a plan. |
| Extension installation | **UNAVAILABLE in this session** | Installation was not attempted; doing so would cross the explicit installation gate in the task. |
| Manifest permissions | **UNAVAILABLE** | Not shown in the listing capture. No extension package was acquired or inspected. |
| Source and licence | **UNAVAILABLE** | No public source repository or source licence was linked from the checked official pages. No claim is made about the package's legal status beyond that observation. |
| Extension network traffic | **UNAVAILABLE** | The inspected network events belong to the public website, not an installed extension session. |

## Publisher privacy disclosures

The public Chrome Web Store disclosure lists personally identifiable information and authentication information. The publisher declares that data is not sold outside approved use cases, not used for purposes unrelated to core functionality, and not used for creditworthiness/lending.

The publisher's privacy policy says question text, answer options, question images, selected Snapshot regions, generated suggestions, history, selected modes, some test/course/platform metadata, and sometimes test summary results may be processed. It describes sending question content to its backend and then to an AI provider, and describes retaining history until the user deletes it or the account. The publisher's trust page describes account and data deletion controls. These are verified as published disclosures, not tested behavior.

The site's cookie dialog exposes necessary, analytics, and marketing preferences. The cookie policy says Google Analytics, Meta Pixel, and TikTok Pixel are optional and enabled only after the corresponding consent. This is site behavior and does not establish extension telemetry behavior.

## CheatPet permission plan

CheatPet will use these narrowly scoped capabilities:

- `storage` for local settings, API-key metadata, history, and saved questions.
- Host access only to `https://api.openai.com/*` for direct OpenAI requests.
- `activeTab` and `scripting` so an explicit user gesture can read only the current browser selection for a practice question.
- No `<all_urls>` match, no always-on content script, no background page monitoring, no screenshot capture permission, no automatic answer selection, and no answer submission.

The service worker will call `chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" })` so content scripts cannot read extension-local keys. The page will receive no key or model request. API keys in local browser storage are not equivalent to encrypted secrets; the settings UI will state that the key remains on this Chrome profile and is sent only to OpenAI when the user asks for an answer.
