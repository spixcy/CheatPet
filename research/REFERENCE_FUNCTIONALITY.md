# Quizonator functionality findings

**Inspection date:** 2026-11-02  
**Evidence:** REA records `ev_5b1af60…`, `ev_220eaa6…`, `ev_d242ba7…`, and `ev_a8389b1…` in [`REFERENCE_PRODUCT.md`](REFERENCE_PRODUCT.md).

## Public workflow

**VERIFIED as the publisher's documented workflow:** install the Chrome extension, sign in, open a supported quiz page, start a mode, and review a suggestion. The app workflow is described as installing an app, opening a platform inside its browser, and starting analysis. These workflows require a Quizonator account; actual sign-in and solving were not exercised.

The Chrome Web Store overview says the extension can analyze question text and related images, analyze a selected screen area, use user notes/PDF files as reference material, choose an answer language, and review saved tests. It also says behavior varies by mode, platform, question type, and plan. The public website claims question history and statistics are available. These are published claims; they remain **INFERRED** as installed-app behavior.

## Modes

| Mode | Public description | Status and limitation |
|---|---|---|
| Default | Shows a suggested answer and explanation; user selects the answer. | **VERIFIED** as the public demo's description. Runtime output was not tested. |
| Instant | Automatically selects/fills an answer after analysis; submission is described as separate. | **VERIFIED** as demo copy; omitted from CheatPet because the requested implementation is limited to explicit practice/self-assessment and must not automatically choose or submit answers. |
| Invisible | Uses a faint cue on hover and can select an answer when the question is clicked. | **VERIFIED** as demo copy; omitted because concealed assistance is explicitly out of scope. |
| Snapshot | User selects a screen area containing a question; a result with explanation appears in a separate panel. | **VERIFIED** as demo description; installed runtime is unavailable. |

## Input, processing, and output

- **Page questions and choices:** publisher pages say the extension reads the question and available options from supported quiz pages. **INFERRED** (not exercised in the extension).
- **Image questions:** the public store listing and extension page say question images can be analyzed. **INFERRED** (no authenticated request was observed).
- **Snapshot:** the user selects a screen area, which is sent for analysis. The privacy policy identifies the selected part of the screen as data processed. **INFERRED** as runtime behavior.
- **Personal notes/PDFs:** the store listing says these may be used as reference material and the policy says such study materials can be sent to a selected provider. **INFERRED**.
- **Result:** public material describes an answer suggestion with an explanation, sometimes shown in an extension panel or marked beside the question. **INFERRED**.
- **History:** the publisher says questions, explanations, and test statistics can be revisited. The privacy policy says history remains until deletion. **INFERRED** as feature behavior; published retention terms are verified as text.
- **Confidence estimates:** no public page or listing inspected described an explicit confidence measure. **UNAVAILABLE**.
- **Provider/model selection:** public pages mention GPT-6-or-newer and a selected model provider but do not expose an in-product provider/model control. **UNAVAILABLE** for the UI and configuration behavior.

## Supported platforms

The public platform page lists Moodle, Testportal, Blooket, Socrative, Szkoła w Chmurze, Microsoft Forms, Google Forms, Quizizz/Wayground, and Canvas LMS (Classic Quizzes). The site gives platform-specific limits and describes Kahoot as a separate path, including iOS camera use for live games. This list is **VERIFIED as current public copy**, not a compatibility test.

## Plans and settings

The captured pricing page describes FREE, PRO, and PRO+ plans with monthly answer limits and increasing features. The displayed Free plan includes Default mode, history/statistics, and extension/mobile access. Paid plans include additional modes; PRO+ lists personal notes and files. The exact displayed prices and limits are changeable and were not independently verified beyond the page capture.

The website's cookie settings provide necessary, analytics, and marketing categories. The policy names Google Analytics as optional analytics and Meta/TikTok pixels as optional marketing after consent. This applies to the site and does not reveal extension settings.

## Privacy statements

The publisher's October 8, 2026 privacy policy states that question text, options, images, selected screen fragments, generated suggestions, selected modes, and some platform/test metadata may be processed. It describes question content going to the publisher's backend and then through an API to a selected model provider; results may be saved in account history. It also describes a shared answer base and storage/retention rules. These statements are verified as published policy text, not as observed network behavior.

The Chrome Web Store privacy disclosure lists personally identifiable information and authentication information. The captured public page showed the publisher's declarations that data is not sold outside approved use cases and is not used for unrelated purposes or creditworthiness.

## Limits for this investigation

No account was created, no extension was installed, no subscription was purchased, and no quiz question was submitted to the service. Therefore actual recognition accuracy, response quality, error handling, history deletion, supported-site behavior, provider settings, and permission prompts remain **UNAVAILABLE**.
