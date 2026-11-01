import { useRef, useState } from "react";
import { MAX_IMAGE_BYTES } from "../../shared/validateQuestion";
import { Icon } from "./Icon";

interface QuestionImageUploadProps {
  imageDataUrl?: string;
  imageName?: string;
  onImage: (dataUrl: string, name: string) => void;
  onRemove: () => void;
}

const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export function QuestionImageUpload({ imageDataUrl, imageName, onImage, onRemove }: QuestionImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function readFile(file?: File) {
    setError("");
    if (!file) return;
    if (!acceptedTypes.has(file.type)) {
      setError("Choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Keep the image under 4 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setError("That image could not be read. Try another file.");
    reader.onload = () => {
      if (typeof reader.result === "string") onImage(reader.result, file.name);
      else setError("That image could not be read. Try another file.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="image-input-wrap">
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label="Choose a practice question image"
        onChange={(event) => readFile(event.currentTarget.files?.[0])}
      />
      {imageDataUrl ? (
        <div className="image-preview-card">
          <img src={imageDataUrl} alt="Uploaded practice question preview" />
          <div className="image-preview-copy">
            <strong>{imageName || "Question image"}</strong>
            <span>Sent only when you generate an explanation.</span>
          </div>
          <button className="icon-button icon-button--quiet" type="button" aria-label="Remove image" onClick={onRemove}>
            <Icon name="close" />
          </button>
        </div>
      ) : (
        <button
          className="image-upload-button"
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            readFile(event.dataTransfer.files[0]);
          }}
        >
          <span className="upload-icon"><Icon name="image" /></span>
          <span className="upload-copy"><strong>Add a question image</strong><small>PNG, JPEG, or WebP · up to 4 MB</small></span>
          <Icon name="upload" size={16} className="upload-trailing" />
        </button>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
