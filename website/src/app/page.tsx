import { Hero } from "@/components/hero/Hero";
import { CanIDoThis } from "@/components/CanIDoThis";
import { WhatIsIt } from "@/components/sections/WhatIsIt";
import { WhoCanApply } from "@/components/sections/WhoCanApply";
import { Journey } from "@/components/Journey";
import { Selection } from "@/components/sections/Selection";
import { FAQ } from "@/components/sections/FAQ";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatIsIt />
      <CanIDoThis />
      <WhoCanApply />
      <Journey />
      <Selection />
      <FAQ />
    </>
  );
}
