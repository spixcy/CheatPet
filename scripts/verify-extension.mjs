import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const dist = resolve("dist");
const manifestPath = resolve(dist, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

assert.equal(manifest.manifest_version, 3, "The unpacked build must use Manifest V3.");
assert.equal(manifest.action?.default_popup, "index.html", "The toolbar popup must point to the built popup page.");
assert.equal(manifest.options_page, "options.html", "The options page must be present in the package.");
assert.equal(manifest.background?.service_worker, "service-worker.js", "The service worker must be bundled at the manifest path.");
assert.equal(manifest.background?.type, "module", "The service worker must load as an ES module.");
assert.deepEqual(manifest.permissions, ["activeTab", "scripting", "storage"], "Review any change to the minimal permission set.");
assert.deepEqual(manifest.host_permissions, ["https://api.openai.com/*"], "Only the configured OpenAI API host should be reachable.");
assert.equal("content_scripts" in manifest, false, "The package must not inject scripts into pages.");

const requiredFiles = ["index.html", "workspace.html", "options.html", "service-worker.js"];
for (const file of requiredFiles) await access(resolve(dist, file));

for (const [size, file] of Object.entries(manifest.icons ?? {})) {
  assert.ok(file, `Manifest icon ${size} must have a file path.`);
  await access(resolve(dist, file));
}
for (const [size, file] of Object.entries(manifest.action?.default_icon ?? {})) {
  assert.ok(file, `Toolbar icon ${size} must have a file path.`);
  await access(resolve(dist, file));
}

for (const page of ["index.html", "workspace.html", "options.html"]) {
  const html = await readFile(resolve(dist, page), "utf8");
  const localReferences = [...html.matchAll(/(?:src|href)="([^\"]+)"/g)].map((match) => match[1]);
  assert.ok(localReferences.length > 0, `${page} must reference built assets.`);
  for (const reference of localReferences) {
    assert.ok(!/^https?:\/\//i.test(reference), `${page} must not load remote executable or style assets.`);
    await access(resolve(dist, reference.replace(/^\//, "")));
  }
}

console.log("Built extension package and permission boundaries look consistent.");
