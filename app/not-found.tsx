export const runtime = "edge";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h2 className="text-4xl font-bold mb-4 font-legan">404 - Page Not Found</h2>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        The invitation you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
