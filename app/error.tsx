"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f7f8]">
      <div className="flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-8 md:px-10 lg:px-20 xl:px-40 py-5">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <div className="size-6">
              <svg
                fill="currentColor"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  fillRule="evenodd"
                  fill="#4c96e1"
                />
                <path
                  clipRule="evenodd"
                  d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  fillRule="evenodd"
                  fill="#4c96e1"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold">CodeCraft</h2>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center py-10 px-4">
          <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
            {/* Error Image */}
            <div className="w-full max-w-xs">
              <div className="w-full h-auto rounded-xl overflow-hidden bg-gradient-to-br from-red-100 to-orange-100 aspect-square flex items-center justify-center">
                <div className="text-8xl">🤖</div>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-900">
                Something went wrong
              </h1>
              <p className="max-w-md text-slate-600 text-sm sm:text-base">
                Our team has been notified and we&apos;re working on a fix. We
                appreciate your patience while we get things back online.
              </p>
              {error.digest && (
                <p className="text-xs text-slate-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <button
                onClick={reset}
                className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-slate-200 text-slate-900 text-base font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 transition-colors"
              >
                <span className="truncate">Try again</span>
              </button>
              <Link
                href="/dashboard"
                className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#4c96e1] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors"
              >
                <span className="truncate">Go to Dashboard</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
