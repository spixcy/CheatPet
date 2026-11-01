# Reference feature matrix

**Inspection date:** 2026-11-02  
**Evidence:** see the Evidence table in [`REFERENCE_PRODUCT.md`](REFERENCE_PRODUCT.md).

“Observed” describes the public page, store listing, or published policy. It does not mean an authenticated extension runtime was tested.

| Feature | Observed reference behavior | Evidence status | CheatPet implementation |
|---|---|---|---|
| Public navigation | Home, How It Works, Platforms, App, Pricing, Login, Start, and legal links. | VERIFIED: public page | Independent workspace navigation |
| Manual question input | No manual extension input form visible in inspected public interface. | UNAVAILABLE | Manual question and options editor |
| Multiple choice | Listing/publisher pages describe question and answer recognition. | INFERRED: publisher claim | Parse manually entered questions/options and show explanation |
| Page extraction | Extension says it recognizes questions on supported quiz pages. | INFERRED: publisher claim | Read only user-selected text after a click; no automatic page scanning |
| Screenshot input | Snapshot selects a screen region and displays a result panel. | INFERRED: demo/publisher claim | User uploads an image and can remove it before sending |
| Image question understanding | Listing and extension page mention images, charts, formulas, and question images. | INFERRED: publisher claim | Send user-uploaded image to OpenAI with question context |
| Default suggestion | Suggestion and explanation; user selects answer. | VERIFIED: public demo description | Practice explanation card; user remains responsible for selection |
| Instant answer selection | Automatically selects/fills answer. | VERIFIED: public demo description | OMITTED: outside requested practice-only scope |
| Invisible mode | Hover/click triggers subtle or concealed assistance. | VERIFIED: public demo description | OMITTED: concealed assistance is out of scope |
| Snapshot mode | User selects area, analysis appears in a separate panel. | VERIFIED: public demo description | Manual image upload for practice; no hidden capture |
| Detailed explanation | Public demo says a clear/short explanation accompanies a suggestion. | VERIFIED: public copy | Explanation and working steps |
| Confidence estimate | No explicit confidence control or estimate observed. | UNAVAILABLE | Model-reported qualitative estimate with an uncalibrated warning |
| AI provider selection | Public materials mention GPT-6-or-newer and a selected provider; UI unavailable. | UNAVAILABLE | OpenAI first; modular registry for later providers |
| API key management | No exposed settings screen. | UNAVAILABLE | Bring Your Own OpenAI API key in extension options |
| Model configuration | No exposed model selector/settings screen. | UNAVAILABLE | Editable model ID with an OpenAI default |
| Supported platforms | Moodle, Testportal, Blooket, Socrative, Szkoła w Chmurze, MS Forms, Google Forms, Quizizz/Wayground, Canvas Classic; separate Kahoot paths. | VERIFIED: public copy, not compatibility-tested | Selected-text extraction is platform-neutral; no site-specific adapters |
| Question history | Publisher says users can revisit questions, explanations, and statistics. | INFERRED: publisher claim | Local history with per-item deletion and clear-all |
| Saved questions | No public save control observed. | UNAVAILABLE | Save/unsave a question locally |
| User-controlled deletion | Publisher describes history/account deletion. | VERIFIED: published policy/Trust Center statement | Delete individual history items, saved items, settings, API key, or all local data |
| Consent settings | Website consent has necessary, analytics, and marketing categories. | VERIFIED: clicked public dialog | No tracking or analytics in CheatPet |
| Error handling | No solver error state inspected. | UNAVAILABLE | Key missing, invalid key, rate limit, network failure, and malformed response states |
| Privacy architecture | Publisher policy describes backend → model provider → result/history. | VERIFIED as published policy, runtime unverified | Direct user-controlled request to OpenAI; no mandatory backend |
| Extension manifest/source | Not exposed on public store capture; package not acquired. | UNAVAILABLE | Own Manifest V3 project with minimal permissions |

## Implementation and validation status

The implementation below is present in the source and generated Manifest V3 package. Automated verification passed on 2026-11-02. “Implemented” here means code and package checks are complete; no end-to-end interaction was performed in a manually installed Chrome extension.

| Area | CheatPet status |
|---|---|
| Manual editor and multiple choice | Implemented. The editor previews A/B/C and numbered choices; parsing and validation are covered by automated tests. |
| Selected page text | Implemented as an explicit click action using `activeTab` and `scripting`; there is no content script or background page scan. Browser interaction was not manually smoke-tested. |
| Question images | Implemented as user-selected PNG/JPEG/WebP uploads up to 4 MB. Images can be removed before sending and are not stored in history. No automatic screen capture or region crop is implemented. |
| Explanations | Implemented through a direct OpenAI Responses API request, with structured reasoning, choice labels, qualitative confidence, and ambiguity notes. API behavior has unit tests with mocked responses. |
| Providers and credentials | OpenAI is available; other catalog entries remain planned. The API key is stored in extension-local storage, withheld from page contexts, and never returned by the public settings message. |
| History and saved items | Implemented in local extension storage with a 100-record cap, save/unsave, per-record deletion, and full data clearing. Covered by automated tests. |
| Privacy and boundaries | Implemented with explicit user-triggered submission, direct provider calls, local history, no analytics, and no automatic answer selection or submission. |
| Extension package | Built successfully with popup, workspace, options page, module service worker, and icons. `verify:extension` checks the package paths, local assets, Manifest V3 shape, and exact permission allowlists. |

Validation performed:

- `npm run typecheck` — passed.
- `npm test -- --reporter=dot` — 7 test files and 26 tests passed.
- `npm run build` — passed and emitted the unpacked extension under `dist/`.
- `npm run verify:extension` — passed against the generated package.

Limitations: installing the package in Chrome and manually clicking through the UI was not part of this verification. OpenAI requests require the user to configure a working API key and an enabled model.
