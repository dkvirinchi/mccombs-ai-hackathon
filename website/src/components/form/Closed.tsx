import { content, stripTodo } from "@/lib/content";
import { ButtonLink } from "@/components/layout/Button";

export function Closed({ state }: { state: "before" | "after" }) {
  const c = state === "before" ? content.form.closed.beforeOpen : content.form.closed.afterClose;
  const email = stripTodo(content.contact.email);
  return (
    <div>
      <h2 className="display text-4xl text-charcoal sm:text-5xl">{c.heading}</h2>
      <p className="mt-5 text-lg text-ink">{c.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/" variant="secondary">
          {content.form.confirmation.homeCta}
        </ButtonLink>
        <ButtonLink href={`mailto:${email}`} variant="ghost">
          {content.contact.label}
        </ButtonLink>
      </div>
    </div>
  );
}
