import type { QuestionDraft } from "./types";

export const MAX_QUESTION_CHARACTERS = 8_000;
export const MAX_OPTION_CHARACTERS = 800;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const supportedImageType = /^data:image\/(?:png|jpeg|webp);base64,/i;

export function approximateImageBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function validateQuestionDraft(draft: QuestionDraft): string | null {
  const question = draft.question.trim();
  if (!question && !draft.imageDataUrl) {
    return "Add a question or attach an image before generating an explanation.";
  }
  if (question.length > MAX_QUESTION_CHARACTERS) {
    return `Keep the question under ${MAX_QUESTION_CHARACTERS.toLocaleString()} characters.`;
  }
  if (draft.options.length === 1) {
    return "Add at least two choices, or remove the single choice.";
  }

  const labels = new Set<string>();
  for (const [index, option] of draft.options.entries()) {
    const label = option.label.trim().toLocaleUpperCase();
    const text = option.text.trim();
    if (!label || !text) {
      return `Complete choice ${index + 1} or remove it.`;
    }
    if (labels.has(label)) {
      return `Choice label ${label} is used more than once.`;
    }
    labels.add(label);
    if (text.length > MAX_OPTION_CHARACTERS) {
      return `Keep each choice under ${MAX_OPTION_CHARACTERS} characters.`;
    }
  }

  if (draft.imageDataUrl) {
    if (!supportedImageType.test(draft.imageDataUrl)) {
      return "Use a PNG, JPEG, or WebP image.";
    }
    if (approximateImageBytes(draft.imageDataUrl) > MAX_IMAGE_BYTES) {
      return "Keep the image under 4 MB.";
    }
  }

  return null;
}
