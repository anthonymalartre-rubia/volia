'use client';

export default function TopBar() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-[#1e1e24] bg-[#09090b]/82 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side: Logo and title */}
        <div className="flex items-center gap-4">
          {/* Logo box with gradient */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-sm font-bold text-white">EZ</span>
          </div>

          {/* Title and badge */}
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-semibold text-[#fafafa]">
              Scraping Prospects DOM
            </h1>
            <div className="inline-flex w-fit rounded-md bg-[#1e1e24] px-2 py-1">
              <span className="text-xs font-medium text-[#52525b]">
                Next.js + Supabase
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Subtitle with regions */}
        <div className="text-sm font-medium text-[#52525b]">
          Martinique · Guadeloupe · Guyane · La Réunion
        </div>
      </div>
    </div>
  );
}
