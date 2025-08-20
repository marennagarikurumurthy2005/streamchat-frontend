import React, { useState } from "react";

const IframeComp = ({ stream, tmdb_embed }) => {
  const [playingTrailer, setPlayingTrailer] = useState(!!tmdb_embed && !stream);

  const adblockUrl =
    "https://chromewebstore.google.com/detail/adguard-adblocker/bgnkhhnnamicmpeenaelnjfhikgbkllg";
  const braveDownloadUrl =
    "https://play.google.com/store/apps/details?id=com.brave.browser&hl=en_IN";

  // Decide which src to use
  const src = playingTrailer ? tmdb_embed : stream ? `https://dhcplay.com/e/${stream}` : null;

  if (!src) {
    return <p className="text-center text-gray-500">Video not available.</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-4">
      <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
          loading="lazy"
          src={src}
          allowFullScreen
          className="w-full h-full border-0"
          title="movie-player"
        />
      </div>

      {/* Toggle buttons if both trailer & full movie are available */}
      {stream && tmdb_embed && (
        <div className="flex gap-2 mt-2 justify-center">
          <button
            className={`px-4 py-2 rounded-lg ${
              playingTrailer ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setPlayingTrailer(true)}
          >
            Trailer
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              !playingTrailer ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setPlayingTrailer(false)}
          >
            Full Movie
          </button>
        </div>
      )}

      {/* Adblock & Brave buttons */}
      <div className="mt-6 mb-6 bg-slate-50 p-6 rounded-lg shadow text-center">
        <h2 className="text-lg font-semibold mb-2">Avoid Ads with These Solutions</h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md"
            onClick={() => window.open(adblockUrl, "_blank")}
          >
            AdGuard Extension
          </button>
          <button
            className="flex-1 p-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md"
            onClick={() => window.open(braveDownloadUrl, "_blank")}
          >
            Brave Browser (Mobile)
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Using an ad blocker or privacy-focused browser can improve your viewing experience by
          removing unwanted ads.
        </p>
      </div>
    </div>
  );
};

export default IframeComp;
