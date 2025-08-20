import React from "react";
import IframeComp from "./IfraneComp";


const Bubble = ({ children, mine }) => (
  <div
    className={`max-w-xl p-3 rounded-2xl shadow whitespace-pre-wrap ${
      mine ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none"
    }`}
  >
    {children}
  </div>
);

const ChatMessage = ({ message }) => {
  // Plain text
  if (!message.type || message.type === "text") {
    return (
      <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start "} my-2`}>
        <Bubble mine={message.role === "user"}>{message.content || message.text}</Bubble>
      </div>
    );
  }

  // Song via Spotify embed
  if (message.type === "song" && message.embed_url) {
    return (
      <div className="my-3 p-3 rounded-2xl bg-gray-100 shadow text-gray-900">
        <div className="font-medium mb-2">
          {message.title} {message.artist ? `– ${message.artist}` : ""}
        </div>
        <iframe
          src={message.embed_url}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="rounded-lg"
          title={`spotify-${message.title}`}
        />
      </div>
    );
  }

  // Movie – iframe with trailer/full movie toggle
  if (message.type === "movie") {
    if (message.tmdb_embed || message.stream) {
      return (
        <div className="my-3">
          <IframeComp stream={message.stream} tmdb_embed={message.tmdb_embed} />
        </div>
      );
    }

    // Fallback TMDb card if no videos
    return (
      <div className="my-3 p-3 rounded-2xl bg-gray-100 shadow text-gray-900 flex gap-3">
        {message.poster_url && (
          <img
            src={message.poster_url}
            alt={message.title}
            className="w-24 h-36 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <div className="font-semibold">{message.title}</div>
          {message.release_date && (
            <div className="text-sm text-gray-600 mb-1">Release: {message.release_date}</div>
          )}
          {message.overview && (
            <p className="text-sm text-gray-800 line-clamp-4">{message.overview}</p>
          )}
          {message.tmdb_url && (
            <a
              href={message.tmdb_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-blue-600 underline"
            >
              View on TMDb
            </a>
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="my-2 p-2 bg-gray-200 rounded-2xl text-gray-900">
      {JSON.stringify(message)}
    </div>
  );
};

export default ChatMessage;
