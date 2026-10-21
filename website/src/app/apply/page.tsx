import type { Metadata } from "next";
import { content } from "@/lib/content";
import { ApplicationForm } from "@/components/form/ApplicationForm";

export const metadata: Metadata = {
  title: content.form.title,
  description: content.meta.description,
};

export default function ApplyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <ApplicationForm />
    </div>
  );
}
