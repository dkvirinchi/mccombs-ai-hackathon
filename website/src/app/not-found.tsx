import { ButtonLink } from "@/components/layout/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-4 py-32 sm:px-6">
      <h1 className="display text-5xl text-charcoal">Page not found</h1>
      <p className="text-lg text-muted">That link doesn&apos;t go anywhere. The hackathon site is one page plus the application.</p>
      <ButtonLink href="/">Back to the site</ButtonLink>
    </div>
  );
}
