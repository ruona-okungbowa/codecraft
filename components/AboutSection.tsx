"use client";

import { Users } from "lucide-react";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div
        className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-50 -z-10"
        style={{
          backgroundColor: "rgba(76, 150, 225, 0.1)",
          animation: "spin 30s linear infinite reverse",
        }}
      ></div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative order-2 lg:order-1">
            <div
              className="bg-white p-8 rounded-lg transform rotate-2 hover:rotate-0 transition-transform duration-300"
              style={{
                boxShadow: "0 20px 25px -5px rgba(76, 150, 225, 0.1)",
              }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                To empower every developer to showcase their true potential. We
                believe the code you write is your best resume, and we&apos;re
                here to help you translate it into your next career opportunity.
              </p>
            </div>
            <div
              className="bg-white p-8 rounded-lg mt-8 transform -rotate-2 hover:rotate-0 transition-transform duration-300"
              style={{
                boxShadow: "0 20px 25px -5px rgba(34, 197, 94, 0.1)",
              }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Our Values
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                We&apos;re driven by inclusivity, innovation, and a
                developer-first mindset. CodeCraft is built to be an empowering
                and motivating tool for creators from all backgrounds.
              </p>
            </div>
          </div>

          <div className="text-center lg:text-left order-1 lg:order-2">
            <div
              className="inline-block p-4 rounded-full mb-6"
              style={{
                backgroundColor: "rgba(76, 150, 225, 0.1)",
                color: "#4c96e1",
              }}
            >
              <Users className="w-12 h-12" />
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
              Built by Developers, for Developers.
            </h2>
            <p className="mt-6 text-lg md:text-xl font-normal leading-relaxed text-gray-600 max-w-xl mx-auto lg:mx-0">
              We&apos;re a team of engineers and career specialists who&apos;ve
              experienced the hiring process firsthand. We created CodeCraft to
              solve a problem we all faced: proving our skills beyond a
              traditional resume. Our platform is a testament to the idea that
              great code speaks for itself.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
