"use client";

import Image from "next/image";

export default function SeparatorSection() {
  return (
    <section className="w-full bg-white py-2">
      <Image
        src="/seperator.svg"
        alt="Separator"
        width={1920}
        height={100}
        className="w-full h-auto"
      />
    </section>
  );
}
