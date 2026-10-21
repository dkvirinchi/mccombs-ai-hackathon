import { content } from "@/lib/content";
import { formatDate } from "@/lib/window";
import { ButtonLink } from "@/components/layout/Button";

type Props = { id: string; email: string; teamName: string; resubmission: boolean };

export function Confirmation({ id, email, teamName, resubmission }: Props) {
  const c = content.form.confirmation;
  const body = c.body.replace("{email}", email).replace("{decisionsBy}", formatDate(content.dates.decisionsBy));
  return (
    <div role="status" aria-live="polite">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">
        {c.idLabel} {id}
      </p>
      <h2 className="display mt-2 text-4xl text-orange sm:text-5xl">{c.heading}</h2>
      <p className="mt-5 text-lg text-ink">{resubmission ? c.resubmittedBody : body}</p>
      {resubmission && <p className="mt-2 text-base text-muted">{body}</p>}
      {teamName && (
        <p className="mt-5 rounded-2xl bg-limestone-soft p-4 text-base text-charcoal">{c.teamNote.replace("{teamName}", teamName)}</p>
      )}
      <div className="mt-8">
        <ButtonLink href="/" variant="secondary">
          {c.homeCta}
        </ButtonLink>
      </div>
    </div>
  );
}
