import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiPlus, FiLogOut, FiMenu, FiMoon, FiSun } from "react-icons/fi";
import useWebSocket from "../services/useWebSocket";
import ChatMessage from "../components/ChatMessage";
import { User,Trash2 } from "lucide-react";
import axios from "axios";


const LS_KEY = "streamchat_conversations";


const handleDeleteChat=(id)=>{
  localStorage.removeItem("streamchat_conversations.id")
}

const loadConversations = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveConversations = (convos) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(convos));
  } catch {}
}; 

const StreamChatPage = () => {
  const { messages, sendMessage, setMessages } = useWebSocket();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState(localStorage.getItem("theme") || "dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState(loadConversations());
  const [currentChatId, setCurrentChatId] = useState(null);
  const [searchType, setSearchType] = useState("both"); // movie | song | both

  const bottomRef = useRef(null);
  const chatContainerRef = useRef(null);

  const username = localStorage.getItem("username") || "User";
  const token = localStorage.getItem("access");
  const API = import.meta.env.VITE_BACKEND_URL || "https://streamchat-backend-ow46.onrender.com";

  // theme
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", mode);
  }, [mode]);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // persist current chat
  useEffect(() => {
    if (!currentChatId) return;
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === currentChatId ? { ...c, messages } : c));
      saveConversations(next);
      return next;
    });
  }, [messages, currentChatId]);

  // helpers
  const createConversation = (title, firstMessage) => {
    const id = Date.now();
    const newConvo = {
      id,
      title: title.length > 32 ? title.slice(0, 32) + "…" : title,
      messages: firstMessage ? [firstMessage] : [],
      createdAt: new Date().toISOString(),
    };
    const next = [newConvo, ...conversations];
    setConversations(next);
    saveConversations(next);
    return id;
  };
  const loadConversation = (id) => {
    const convo = conversations.find((c) => c.id === id);
    if (!convo) return;
    setMessages(convo.messages || []);
    setCurrentChatId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };
  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // API calls
  const fetchMovies = async (q) => {
    const url = `${API}/movies/search/?query=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Movie search failed");
    return res.json(); // array of movies
  };
  const fetchSongs = async (q) => {
    const url = `${API}/music/search/?query=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Song search failed");
    return res.json(); // array of songs
  };

  // send message
  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;

    // 1) show user message
    const userMsg = { role: "user", type: "text", content: q };
    setMessages((prev) => [...prev, userMsg]);

    // 2) send to WS (optional – your backend can listen and log)
    sendMessage({ role: "user", type: "text", content: q, searchType });

    setInput("");

    // 3) create or update conversation
    if (currentChatId) {
      const merged = [...messages, userMsg];
      const next = conversations.map((c) => (c.id === currentChatId ? { ...c, messages: merged } : c));
      setConversations(next);
      saveConversations(next);
    } else {
      const id = createConversation(q, userMsg);
      setCurrentChatId(id);
    }

    // 4) call your REST endpoints and render results
    try {
      const tasks = [];
      if (searchType === "movie" || searchType === "both") {
        tasks.push(
          fetchMovies(q).then((arr) =>
            arr.slice(0, 5).map((m) => ({
              role: "assistant",
              type: "movie",
              title: m.title,
              release_date: m.release_date,
              overview: m.overview,
              poster_url: m.poster_url,
              tmdb_url: m.tmdb_url,
              // If you later add: tmdb_embed / stream — it will auto play via IframeComp
              tmdb_embed: m.tmdb_embed || null,
            }))
          )
        );
      }
      if (searchType === "song" || searchType === "both") {
        tasks.push(
          fetchSongs(q).then((arr) =>
            arr.slice(0, 5).map((s) => ({
              role: "assistant",
              type: "song",
              title: s.title,
              artist: s.artist,
              spotify_url: s.spotify_url,
              embed_url: s.embed_url, // required for embed
            }))
          )
        );
      }

      const settled = await Promise.all(tasks);
      const flat = settled.flat();

      if (flat.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "text",
            content: "No results found. Try a different title or artist.",
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, ...flat]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "text",
          content: "There was a problem fetching results. Please try again.",
        },
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("streamchat_conversations");
    window.location.href = "/";
  };

  /* useEffect(()=>{
    const searchHistory=async()=>{
      try {
        const token=localStorage.getItem("access");
        const response=await axios.get("http://127.0.0.1:8000/history/",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        setConversations(response.data)
        
      } catch (err) {
        console.error(err);
        setError("Failed to load history");
        
      }finally {
        setLoading(false);
      }
    }
    searchHistory();
  },[]); */

  return (
    <div className={`flex h-screen ${mode === "dark" ? "bg-[#343541] text-white" : "bg-gray-50 text-gray-900"} overflow-hidden`}>
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-20 h-full w-64 ${mode === "dark" ? "bg-[#202123]" : "bg-white"} flex flex-col border-r ${mode === "dark" ? "border-gray-700" : "border-gray-200"} transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-gray-700/30">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-500 transition"
          >
            <FiPlus /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
  {conversations.length > 0 ? (
    conversations.map((chat) => (
      <div
        key={chat.id}
        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-200
          ${mode === "dark" 
            ? "hover:bg-gray-100" 
            : "hover:bg-gray-400"} 
          ${currentChatId === chat.id 
            ? (mode === "dark" 
                ? "bg-gray-700 border-l-4 border-blue-500" 
                : "bg-gray-300 border-l-4 border-blue-500") 
            : ""}`}
        onClick={() => loadConversation(chat.id)}
        title={chat.title}
      >
        {/* Chat title */}
        <div
          className={`truncate ${
            currentChatId === chat.id
              ? "font-semibold text-blue-600"
              : "text-blue-600"
          }`}
        >
          {chat.title || `Chat ${chat.id}`}
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevents triggering parent click
            handleDeleteChat(chat.id);
          }}
          className="text-red-400 hover:text-red-700 p-2 rounded-md transition-colors duration-200"
        >
          <Trash2 size={20} />
        </button>
      </div>
            ))
      ) : (
        <div className="text-gray-500 p-2">No conversations yet</div>
          )}
          </div>


        <div className="p-4 border-t border-gray-700/30 flex items-center justify-between">
          <button
            onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}
            className="p-2 rounded-lg hover:opacity-80"
            title="Toggle theme"
          >
            {mode === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:opacity-80" title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex flex-col flex-1 relative">
        {/* Header */}
        <header className={`px-4 py-3 flex justify-between items-center shadow ${mode === "dark" ? "bg-[#202123]" : "bg-white"}`}>
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:opacity-80"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FiMenu />
            </button>
            <h1 className="text-lg font-bold">StreamChat</h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className={`text-sm border rounded-md px-2 py-1 ${
                mode === "dark" ? "bg-[#343541] border-gray-700" : "bg-white border-gray-300"
              }`}
              title="What to search"
            >
              <option value="both">Movies + Songs</option>
              <option value="movie">Movies only</option>
              <option value="song">Songs only</option>
            </select>

            <div
              className={`px-3 py-1 rounded-full text-sm ${mode === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
              title="Logged in"
            >
                <div className="flex items-center gap-2 md:gap-3 p-2">
      {/* Profile Icon */}
      <div className="flex-shrink-0">
        <User size={24} className="text-white-500" />
      </div>

      {/* Username */}
      <span className="text-white-800 font-medium text-sm md:text-base truncate">
        {username}
      </span>
    </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className={`flex-1 overflow-y-auto p-4 space-y-4 ${mode === "dark" ? "" : ""}`}
        >
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={`p-4 flex gap-2 border-t ${mode === "dark" ? "bg-[#202123] border-gray-700" : "bg-white border-gray-200"}`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a movie, song, or message…"
            className={`flex-1 rounded-full px-4 py-2 focus:outline-none border ${
              mode === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-500 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamChatPage;
