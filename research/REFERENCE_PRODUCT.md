# Quizonator 2.0 reference investigation

**Inspection date:** 2026-11-02  
**Reference:** [Quizonator 2.0](https://quizonator.com/en/quizonator-2)  
**Method:** REA controlled Chromium sessions, page DOM and accessibility captures, selected-tab interactions, screenshots, the public Chrome Web Store listing, and the publisher's product/privacy pages.

## Scope and result

The public site and store listing were reachable. The actual installed extension workspace was not available in the inspected browser. The Chrome Web Store listing's Add to Chrome control was disabled in this session and linked to a Google sign-in flow; the product site says the extension requires installation and a Quizonator account. No account was created and no extension was installed. The page and tabs on the public site were inspected through REA; those captures do not establish that the installed extension behaves identically.

The reference product is presented as a Chrome extension plus Android and iOS apps sharing an account and plan. Its public flow is: open a supported quiz, start a mode, read a suggested answer and explanation, then select or submit an answer. The public site presents four modes: Default, Instant, Invisible, and Snapshot. The app UI itself, its installed settings, and its runtime behavior remain unavailable for direct inspection.

## Evidence and status meanings

- **VERIFIED** means directly captured or interacted with in the public page/store listing. A publisher statement is verified as a statement, not as independently tested extension behavior.
- **INFERRED** means the publisher describes the behavior, but it was not exercised in an installed extension.
- **UNAVAILABLE** means the public investigation did not expose the needed screen, package, or runtime evidence.

REA Evidence records:

| Evidence ID | Capture |
|---|---|
| `ev_2876f68fb6841e504a95dd291254e70b2ca4828266a9183a1e2a4b7e915c17ef` | Quizonator 2.0 page load, DOM, accessibility tree, screenshot, and page-load events |
| `ev_5b1af609f94ab56378a3e165d2de7c8798b6369b675c3511459c752fa40191b7` | How It Works page load and DOM/accessibility capture |
| `ev_220eaa65f9277ae1d26743900090e1dac2e2013e4e61aebc01b0d1a3c9625c24` | Clicked each of the four public mode tabs and captured the resulting panels/screenshots |
| `ev_d242ba7ad819a6551a6c166ca28b59f9ce5260fbb5ec4a310ed41504d3a3076b` | Official Chrome Web Store listing page load |
| `ev_97da396ebf3666859c18d40387d6d9ee0f7a2bf1c95722d0dedcbde87622536d` | Opened the site's cookie customization dialog |
| `ev_a8389b1b6c1f4798c291b845cc7f4439db8ac9571f32f9e279e4dc940326431b` | Public extension, platforms, pricing, trust, privacy, cookie, mobile, and Chrome Web Store privacy pages |

Captured public reference screenshots are in [`research/evidence`](evidence/):

- [Quizonator 2.0 hero and cookie banner](evidence/quizonator-2-hero.png)
- [Default demo panel](evidence/mode-default.png)
- [Instant demo panel](evidence/mode-instant.png)
- [Invisible demo panel](evidence/mode-invisible.png)
- [Snapshot demo panel](evidence/mode-snapshot.png)

## Summary of findings

### VERIFIED — public-facing UI and published product claims

- The Quizonator 2.0 page has a navigation bar, account and pricing links, a product hero, feature cards, device cards, a four-mode demo, a presentation, supported-platform links, and footer/legal links. The visual reference uses a pale blue/white surface, dark text, cyan/blue accents, and a cookie banner; CheatPet will use its independently specified dark visual system.
- Clicking each public mode tab changes the selected tab and the demo panel's heading and explanation. The demo identifies itself as a recording; some panels say the quiz page is recreated for the recording.
- The cookie preference dialog exposes a required category plus optional analytics and marketing checkboxes, along with Essential only, Save preferences, and Accept all actions.
- The public Chrome Web Store listing identifies the product as “Quizonator - AI quiz assistant”; the captured English listing showed version 2.0.7, a November 1, 2026 update date, 2.09 MiB, 7,000 users, and data disclosures for personally identifiable and authentication information. Store listing values can change.
- The publisher's public pages describe Default, Instant, Invisible, and Snapshot modes, supported platforms, account-based plans, local/mobile product paths, and a history feature.
- The publisher's privacy policy describes question text, answer options, images, selected screen regions, generated suggestions, usage history, selected modes, platform/course/test metadata, and sometimes test-summary results as product data. It states that question content is sent to the publisher's backend and then to a selected model provider, and that question history is saved until the user deletes it or the account.

### INFERRED — product behavior described but not exercised in the installed app

- The extension reads questions and answers from supported pages, recognizes related images, and may display a suggestion inline or in its panel.
- Default mode highlights a suggestion and gives an explanation; Instant fills an answer field; Invisible presents a faint hover cue; Snapshot analyzes a user-selected screen area.
- The publisher describes an account dashboard with saved quiz history and statistics, a mobile in-app browser, and a shared plan across Chrome and mobile.
- The publisher's privacy documents describe a server-backed flow and AI provider selection. We did not observe an authenticated extension request or independently verify storage or deletion behavior.

### UNAVAILABLE — not exposed during this investigation

- The installed extension popup, options/settings screens, post-login workspace, account dashboard, actual answer result, live question recognition, and in-product provider/model controls.
- Extension manifest, permission list, content scripts, background worker, storage schema, source code, and extension-origin network traffic. No public source repository or source licence was linked from the official listing/pages we checked. The package was not acquired or installed.
- Screens or behavior requiring a Quizonator account, payment, account authorization, or an installed extension. These were documented as limits and not bypassed.

## Independent implementation decisions

CheatPet will keep the useful practice workflow—manual question entry, selected practice text, optional question image, an explanation, and a local question history—while retaining its own name, iconography, copy, and interface. It will not reproduce Invisible or Instant answer-selection behavior, submit answers, or conceal assistance. Website extraction will be an explicit user gesture that reads only text the user has selected on the active tab. The first provider will be OpenAI via the user's own API key; no account/backend requirement will be added.

## Source pages

- [Quizonator 2.0](https://quizonator.com/en/quizonator-2)
- [How It Works](https://quizonator.com/en/how-it-works)
- [Chrome extension](https://quizonator.com/en/chrome-extension)
- [Supported platforms](https://quizonator.com/en/platforms)
- [Pricing](https://quizonator.com/en/pricing)
- [Trust center](https://quizonator.com/en/trust-center)
- [Privacy policy](https://quizonator.com/en/privacy-policy)
- [Cookie policy](https://quizonator.com/en/cookie-policy)
- [Chrome Web Store listing](https://chromewebstore.google.com/detail/quizonator-quizy-i-wyja%C5%9Bn/dhphdklknbffcgahfpiipdmafoncnndi?hl=en)
