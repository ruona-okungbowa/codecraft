import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f7f8]">
      <div className="flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-3">
              <Link href="/" className="flex items-center gap-4 text-[#101922]">
                <div className="size-6 text-[#4c96e1]">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.003 2a10 10 0 0 0-9.333 14.136.75.75 0 0 0 .91.196 7.499 7.499 0 0 1 11.164-5.265.75.75 0 0 0 .86-.289 10 10 0 0 0-3.601-8.778ZM19.605 8.169a.75.75 0 0 0-1.045.263 7.5 7.5 0 0 1-5.118 10.978.75.75 0 0 0 .428 1.393A10 10 0 0 0 19.605 8.17Z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
                  CodeCraft
                </h2>
              </Link>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-12 md:py-24">
              <div className="flex flex-col items-center gap-6 text-center px-4">
                {/* Image with glow effect */}
                <div className="relative flex items-center justify-center w-full max-w-sm">
                  <div className="absolute inset-0 bg-[#4c96e1]/10 rounded-full blur-3xl"></div>
                  <div className="relative w-full max-w-[360px] aspect-square rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-8xl">🔍</div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-[#101922] text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em]">
                    404 - Page Not Found
                  </p>
                  <p className="text-slate-600 text-sm sm:text-base font-normal leading-normal">
                    Looks like you&apos;ve found a glitch in the matrix. The
                    page you&apos;re looking for has been moved or doesn&apos;t
                    exist.
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  href="/dashboard"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#4c96e1] text-white text-base font-bold leading-normal tracking-[0.015em] shadow-md hover:bg-[#3a7bc8] transition-all duration-300 hover:scale-105"
                >
                  <span className="truncate">Go to Dashboard</span>
                </Link>
              </div>
            </main>

            {/* Footer */}
            <footer className="flex flex-col gap-6 px-5 py-10 text-center">
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6">
                <Link
                  className="text-slate-500 text-sm font-normal leading-normal min-w-40 hover:text-[#4c96e1] transition-colors"
                  href="#"
                >
                  Help Center
                </Link>
                <Link
                  className="text-slate-500 text-sm font-normal leading-normal min-w-40 hover:text-[#4c96e1] transition-colors"
                  href="#"
                >
                  Contact Support
                </Link>
              </div>
              <p className="text-slate-500 text-sm font-normal leading-normal">
                © 2024 CodeCraft. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
