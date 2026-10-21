import { content } from "@/lib/content";

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  const label = content.form.progressLabel.replace("{current}", String(current)).replace("{total}", String(total));
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-limestone"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="Application progress"
      >
        <div className="h-full rounded-full bg-orange transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
