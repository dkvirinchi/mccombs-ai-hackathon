"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { formatDate } from "@/lib/window";
import { ButtonLink } from "@/components/layout/Button";

type Props = { id: string; email: string; teamName: string; resubmission: boolean };

/** Link that opens the form with the team name filled in (read by ApplicationForm's ?team= handling). */
function teamLink(teamName: string): string {
  return `${window.location.origin}/apply/?team=${encodeURIComponent(teamName.trim())}`;
}

export function Confirmation({ id, email, teamName, resubmission }: Props) {
  const c = content.form.confirmation;
  const [copied, setCopied] = useState(false);
  const body = c.body.replace("{email}", email).replace("{decisionsBy}", formatDate(content.dates.decisionsBy));
  const link = teamName ? teamLink(teamName) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked; the link is still visible to copy by hand */
    }
  };

  return (
    <div role="status" aria-live="polite">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">
        {c.idLabel} {id}
      </p>
      <h2 className="display mt-2 text-4xl text-orange sm:text-5xl">{c.heading}</h2>
      <p className="mt-5 text-lg text-ink">{resubmission ? c.resubmittedBody : body}</p>
      {resubmission && <p className="mt-2 text-base text-muted">{body}</p>}
      {teamName && (
        <div className="mt-6 rounded-2xl bg-limestone-soft p-5">
          <p className="text-base text-charcoal">{c.teamNote.replace("{teamName}", teamName)}</p>
          <h3 className="mt-4 text-lg font-semibold text-charcoal">{c.teamLinkHeading}</h3>
          <p className="mt-1 text-base text-muted">{c.teamLinkBody}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-2 text-sm text-charcoal">{link}</code>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-full bg-charcoal px-5 py-2 text-sm font-semibold text-white hover:bg-charcoal-deep"
            >
              {copied ? c.copiedLabel : c.copyLabel}
            </button>
          </div>
        </div>
      )}
      <div className="mt-8">
        <ButtonLink href="/" variant="secondary">
          {c.homeCta}
        </ButtonLink>
      </div>
    </div>
  );
}
