"use client"

export function CollegeHeader() {
  return (
    <div className="w-full border-2 border-primary bg-card">
      <div className="flex items-center justify-center px-2 py-2 md:px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/srit-banner.png"
          alt="SRIT College Banner - Srinivasa Ramanujan Institute of Technology"
          className="h-auto w-full max-w-4xl object-contain"
        />
      </div>
    </div>
  )
}
