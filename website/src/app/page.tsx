import { Hero } from "@/components/hero/Hero";
import { CanIDoThis } from "@/components/CanIDoThis";
import { WhatIsIt } from "@/components/sections/WhatIsIt";
import { WhoCanApply } from "@/components/sections/WhoCanApply";
import { Journey } from "@/components/Journey";
import { ApplyCta } from "@/components/sections/ApplyCta";
import { FAQ } from "@/components/sections/FAQ";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatIsIt />
      <CanIDoThis />
      <WhoCanApply />
      <Journey />
      <ApplyCta />
      <FAQ />
    </>
  );
}
