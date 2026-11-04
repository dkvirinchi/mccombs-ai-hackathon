"use client";

import { useId, useRef, useState } from "react";
import { content } from "@/lib/content";
import { RESUME_MAX_BYTES } from "@/lib/schema";
import { Checkbox } from "./Checkbox";

export type ResumeFile = { name: string; mime: string; base64: string; size: number };

type Props = {
  file: ResumeFile | null;
  onFile: (f: ResumeFile | null) => void;
  share: boolean;
  onShare: (v: boolean) => void;
};

const copy = content.form.fields.resume;
const err = content.form.errors;

/** True when the file starts with the "%PDF-" header. The extension and mime type come from the file name and are easy to get wrong. */
async function looksLikePdf(file: File): Promise<boolean> {
  const head = await file.slice(0, 5).text();
  return head === "%PDF-";
}

/** Read a File as base64 (without the data: prefix) so it can travel inside the JSON payload. */
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Optional PDF upload plus the separate "OK to share with partners" opt-in, shown once a file is attached. */
export function ResumeField({ file, onFile, share, onShare }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > RESUME_MAX_BYTES) return setError(err.resumeSize);
    try {
      if (!(await looksLikePdf(f))) return setError(err.resumeType);
      const base64 = await toBase64(f);
      setError(null);
      onFile({ name: f.name, mime: "application/pdf", base64, size: f.size });
    } catch {
      // FileReader can fail on a file that moved or is locked, or on a permissions error on iOS.
      setError(err.resumeRead);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          void choose(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {file ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-charcoal bg-white px-4 py-3.5">
          <span className="min-w-0 break-all text-base font-semibold text-charcoal">{file.name}</span>
          <span className="flex gap-4 text-sm font-semibold">
            <label htmlFor={id} className="cursor-pointer text-charcoal underline-offset-4 hover:underline">
              {copy.replaceLabel}
            </label>
            <button
              type="button"
              className="text-charcoal underline-offset-4 hover:underline"
              onClick={() => {
                onFile(null);
                onShare(false);
              }}
            >
              {copy.removeLabel}
            </button>
          </span>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-charcoal/40 bg-white px-4 py-6 text-base font-semibold text-charcoal hover:border-charcoal"
        >
          {copy.chooseLabel}
        </label>
      )}
      <p role="alert" className="mt-2 min-h-[1.25rem] text-sm font-medium text-error">
        {error ?? ""}
      </p>
      {file && (
        <div className="mt-2">
          <Checkbox checked={share} onChange={onShare} label={copy.shareLabel} />
          <p className="-mt-4 text-sm text-muted">{copy.shareHelp}</p>
        </div>
      )}
      <p className="mt-4 text-sm text-muted">{copy.note}</p>
    </div>
  );
}
