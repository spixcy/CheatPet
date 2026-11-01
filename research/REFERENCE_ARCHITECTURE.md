# Quizonator architecture: evidence and limits

**Inspection date:** 2026-11-02  
**Evidence:** REA page scenario `ev_2876f68…`, public policy pages in `ev_a8389b1…`, and public Chrome Web Store listing `ev_d242ba7…`.

## Directly observed

The public marketing site is a rendered React page: the captured HTML includes a `#root` element, prerendered markup, a boot script, a hashed main script, chunk scripts, and hashed CSS. A controlled page-load capture observed the site fetching these assets and a successful `GET https://quizonator.com/api/geo` request. The capture ran about 15 seconds and does not prove this is the extension backend or reveal the content of an authenticated question request.

The public site's navigation, page content, mode tabs, consent dialog, and screenshots were captured in REA browser scenarios. No extension application source or installed runtime was attached to the browser.

## Publisher-described processing flow

The Trust Center and Privacy Policy describe this flow:

```text
Question or selected screen content
          │
          ▼
Quizonator extension/app → Quizonator backend → selected model provider
          │                                      │
          └──────────── result and explanation ◄┘
                              │
                              ▼
                    account quiz history
```

This is a **VERIFIED publisher description**, not an independently observed runtime trace. The policy says the extension reads question content from supported pages and sends the content to the controller's backend, which passes it to an AI provider. It also says questions and generated answers may be retained in history and that question/answer data may be used in a shared answer base. The website refers to GPT-6-or-newer and the privacy policy to a selected provider; the public materials inspected do not reveal whether end users can choose a model.

## Extension internals — UNAVAILABLE

The Chrome Web Store page exposed a product description, version/size, developer, privacy disclosures, and the install CTA. It did not expose a manifest, source repository, license, content scripts, worker source, storage design, or network trace. The official page required an install/sign-in path not used in this investigation. No package was acquired, and no source was reverse engineered.

Accordingly, the following are **UNAVAILABLE**: manifest version and permission list; browser host matches; popup/options architecture; extension messaging; local/server storage details; provider implementation; exact question-extraction algorithms; authenticated endpoint behavior; and deletion semantics beyond publisher policy.

## CheatPet architecture decisions

The independent extension will use Manifest V3 with a popup UI and a service worker. It will request only extension storage, the OpenAI API host, active-tab access on a user gesture, and scripting for one explicit selected-text read. No content script will run across sites. The active tab's selected text will be read only when the user presses the extraction control. The OpenAI key will stay in extension-owned storage restricted to trusted extension contexts; page scripts will never receive it. Requests will go directly to the provider from the extension service worker. Questions, answers, and settings will remain local unless the user starts an AI request.

These are independent design choices, not claims about the Quizonator implementation.

## Technical references used for our implementation

- [Chrome activeTab permission](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)
- [Chrome scripting API](https://developer.chrome.com/docs/extensions/reference/api/scripting)
- [Chrome storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome cross-origin extension requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)
- [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text?api-mode=responses)
- [OpenAI image input guide](https://developers.openai.com/api/docs/guides/images-vision)
- [OpenAI structured output guide](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI GPT-6 Luna model](https://developers.openai.com/api/docs/models/gpt-6-luna)
