"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-row items-center justify-between text-gray-600">
          <div className="flex items-center gap-3">
            <Image
              src="/icon-logo.png"
              alt="CodeCraft"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-gray-900">CodeCraft</h2>
              <p className="text-xs">© 2024 All rights reserved.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm transition-colors hover:text-[#4c96e1]"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-[#4c96e1]"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
