import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit3,
  Send,
  MessageSquare,
  LogOut,
  Search,
  Menu,
  X,
  Copy,
  Check,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
  CornerDownLeft,
  Sparkles,
} from "lucide-react";
import useAuth from "../../auth/hooks/useAuth";
import NexoraLogo, { NexoraIcon } from "../../../components/NexoraLogo";
import {
  getChats,
  createNewChat,
  getChatDetails,
  sendChatMessage,
  deleteChatById,
  updateChatTitle,
} from "../services/chat.api";

// Starter prompt suggestions for new chats
const SUGGESTIONS = [
  {
    icon: ShieldCheck,
    title: "JWT Authentication Flow",
    desc: "Explain secure cookie-based auth in Node & Express",
    prompt: "Can you explain how JWT authentication with HTTP-only cookies works in Express.js with a clear code example?",
  },
  {
    icon: Code2,
    title: "REST API with Mongoose",
    desc: "Create a simple CRUD API structure",
    prompt: "Show me a clean and modern example of building a REST API in Node.js using Express and Mongoose models.",
  },
  {
    icon: Layers,
    title: "React State Architecture",
    desc: "When to use Redux Toolkit vs useState vs Context",
    prompt: "Explain when to use Redux Toolkit versus useState or Context API in React applications.",
  },
  {
    icon: Cpu,
    title: "Debug Async JavaScript",
    desc: "Common async/await and Promise gotchas",
    prompt: "What are the most common async/await pitfalls in JavaScript and how do I avoid them with clean patterns?",
  },
];

/**
 * Formatted message renderer: parses code blocks, inline code, bold text, and paragraphs
 */
const FormattedMessage = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-zinc-200">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let language = "code";
          let code = part.slice(3, -3).trim();

          if (lines.length > 1 && /^[a-zA-Z0-9_-]+$/.test(lines[0].trim())) {
            language = lines[0].trim();
            code = lines.slice(1).join("\n");
          }

          return (
            <div
              key={index}
              className="my-3 overflow-hidden rounded-xl border border-[#41494F]/80 bg-[#070B0D] shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[#41494F]/80 bg-[#070B0D] px-4 py-2 text-xs text-[#6D7C83]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#DB2D28]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#6D7C83]/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#41494F]" />
                  </div>
                  <span className="font-mono text-[#6D7C83] lowercase">{language}</span>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(code, index)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs text-[#6D7C83] transition hover:bg-[#41494F]/40 hover:text-white"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-zinc-200">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        return (
          <div key={index} className="whitespace-pre-wrap">
            {part.split("\n\n").map((paragraph, pIdx) => (
              <p key={pIdx} className="mb-2.5 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const user = useSelector((state) => state.auth?.user);

  // Chat state
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  // Loading & UI states
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Inline chat title rename state
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        setIsLoadingChats(true);
        const data = await getChats();
        setChats(data || []);

        if (data && data.length > 0) {
          selectChat(data[0]._id);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchUserChats();
  }, []);

  const selectChat = async (chatId) => {
    if (chatId === activeChatId) return;

    setActiveChatId(chatId);
    setIsSidebarOpen(false);
    setIsLoadingMessages(true);

    try {
      const data = await getChatDetails(chatId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const newChat = await createNewChat("New Chat");
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat._id);
      setMessages([]);
      setIsSidebarOpen(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage("");
    setIsSending(true);

    let currentChatId = activeChatId;

    if (!currentChatId) {
      try {
        const newChat = await createNewChat("New Chat");
        currentChatId = newChat._id;
        setActiveChatId(newChat._id);
        setChats((prev) => [newChat, ...prev]);
      } catch (err) {
        console.error("Failed to initialize new chat:", err);
        setIsSending(false);
        return;
      }
    }

    const temporaryUserMessage = {
      _id: "temp-" + Date.now(),
      chat: currentChatId,
      content: text,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temporaryUserMessage]);

    try {
      const response = await sendChatMessage(currentChatId, text);

      setMessages((prev) => [
        ...prev.filter((m) => m._id !== temporaryUserMessage._id),
        response.userMessage,
        response.aiMessage,
      ]);

      if (response.chat && response.chat.title) {
        setChats((prev) =>
          prev.map((c) =>
            c._id === currentChatId
              ? { ...c, title: response.chat.title, updatedAt: response.chat.updatedAt }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          _id: "err-" + Date.now(),
          chat: currentChatId,
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          role: "ai",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;

    try {
      await deleteChatById(chatId);
      const remainingChats = chats.filter((c) => c._id !== chatId);
      setChats(remainingChats);

      if (activeChatId === chatId) {
        if (remainingChats.length > 0) {
          selectChat(remainingChats[0]._id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditTitleValue(chat.title);
  };

  const handleSaveRename = async (e, chatId) => {
    e.stopPropagation();
    if (!editTitleValue.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      const updated = await updateChatTitle(chatId, editTitleValue.trim());
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, title: updated.title } : c))
      );
    } catch (error) {
      console.error("Failed to update chat title:", error);
    } finally {
      setEditingChatId(null);
    }
  };

  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.success) {
      navigate("/login", { replace: true });
    }
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChat = chats.find((c) => c._id === activeChatId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070B0D] text-zinc-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* -------------------- SIDEBAR -------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-76 flex-col border-r border-[#41494F]/70 bg-[#070B0D] transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#41494F]/70 px-4">
          <NexoraLogo size="md" subtitle="AI Workspace" />

          <button
            type="button"
            className="rounded-lg p-1.5 text-[#6D7C83] hover:bg-[#41494F]/30 hover:text-white md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#DB2D28] to-[#A41715] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#DB2D28]/20 transition hover:brightness-110"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} />
              New Chat
            </span>
            <span className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-white/90">
              New
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[#6D7C83]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#41494F] bg-[#070B0D] py-2 pl-8 pr-8 text-xs text-zinc-200 placeholder-[#6D7C83] outline-none transition focus:border-[#DB2D28]/60 focus:ring-1 focus:ring-[#DB2D28]/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-[#6D7C83] hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
          <div className="mb-2 px-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6D7C83]">
            Recent Conversations
          </div>

          {isLoadingChats ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-10 animate-pulse rounded-xl bg-[#41494F]/30"
                />
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6D7C83]">
              {searchQuery ? "No matching conversations." : "No chats yet. Start one!"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => {
                const isActive = chat._id === activeChatId;
                const isEditing = chat._id === editingChatId;

                return (
                  <div
                    key={chat._id}
                    onClick={() => selectChat(chat._id)}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "border border-[#DB2D28]/40 bg-[#40080A]/40 font-medium text-white shadow-sm"
                        : "border border-transparent text-[#6D7C83] hover:bg-[#41494F]/20 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <MessageSquare
                        size={15}
                        className={isActive ? "text-[#DB2D28]" : "text-[#6D7C83]"}
                      />

                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(e, chat._id);
                            if (e.key === "Escape") setEditingChatId(null);
                          }}
                          onBlur={(e) => handleSaveRename(e, chat._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded bg-[#070B0D] px-1 py-0.5 text-xs text-white outline-none ring-1 ring-[#DB2D28]"
                        />
                      ) : (
                        <span className="truncate text-xs sm:text-sm">
                          {chat.title}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="ml-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, chat)}
                          title="Rename"
                          className="rounded p-1 text-[#6D7C83] hover:bg-[#41494F]/40 hover:text-white"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteChat(e, chat._id)}
                          title="Delete"
                          className="rounded p-1 text-[#6D7C83] hover:bg-[#DB2D28]/20 hover:text-[#DB2D28]"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Footer Profile & Logout */}
        <div className="border-t border-[#41494F]/70 bg-[#070B0D] p-3">
          <div className="flex items-center justify-between rounded-xl border border-[#41494F]/60 bg-[#070B0D] p-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#DB2D28] to-[#A41715] text-xs font-semibold text-white shadow-sm">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-200">
                  {user?.username || "Learner"}
                </p>
                <p className="truncate font-mono text-[10px] text-[#6D7C83]">
                  {user?.email || "user@nexora.ai"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-1.5 text-[#6D7C83] transition hover:bg-[#DB2D28]/20 hover:text-[#DB2D28]"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* -------------------- MAIN CHAT CONTAINER -------------------- */}
      <main className="flex flex-1 flex-col overflow-hidden bg-[#070B0D]">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-[#41494F]/70 bg-[#070B0D]/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-1.5 text-[#6D7C83] hover:bg-[#41494F]/40 hover:text-white md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white sm:text-base">
                  {activeChat?.title || "New Conversation"}
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#6D7C83]">
                <span className="flex items-center gap-1 text-[#DB2D28]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#DB2D28]" />
                  Gemini 2.5 Flash
                </span>
                <span>•</span>
                <span>Context-Aware Memory</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewChat}
              className="hidden items-center gap-1.5 rounded-xl border border-[#41494F] bg-[#070B0D] px-3.5 py-1.5 font-mono text-xs font-medium text-zinc-200 shadow-sm transition hover:border-[#DB2D28]/50 hover:text-white sm:flex"
            >
              <Plus size={14} className="text-[#DB2D28]" />
              New Chat
            </button>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {isLoadingMessages ? (
              <div className="flex h-64 items-center justify-center font-mono text-sm text-[#6D7C83]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-ping rounded-full bg-[#DB2D28]" />
                  Loading conversation...
                </div>
              </div>
            ) : messages.length === 0 ? (
              /* Empty State / Welcome Screen */
              <div className="flex flex-col items-center justify-center pt-8 text-center sm:pt-14">
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#DB2D28] to-[#A41715] blur-xl opacity-25" />
                  <NexoraIcon size={56} className="relative shadow-2xl" />
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DB2D28]/40 bg-[#40080A]/40 px-3.5 py-1 font-mono text-xs font-medium text-[#DB2D28]">
                  <Sparkles size={12} />
                  Engineered with Three.js & Gemini AI
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  What would you like to build today?
                </h1>
                <p className="mt-2 max-w-md text-sm text-[#6D7C83]">
                  Nexora provides intelligent code generation, architecture planning, debugging, and software tutoring.
                </p>

                {/* Suggestions Grid */}
                <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((s, idx) => {
                    const IconComponent = s.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(s.prompt)}
                        className="group flex flex-col items-start rounded-2xl border border-[#41494F]/80 bg-[#070B0D]/80 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#DB2D28]/50 hover:bg-[#40080A]/20 hover:shadow-xl"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DB2D28]/15 text-[#DB2D28] group-hover:bg-[#DB2D28]/25">
                          <IconComponent size={16} />
                        </div>
                        <span className="mt-3 text-sm font-semibold text-zinc-200 group-hover:text-white">
                          {s.title}
                        </span>
                        <span className="mt-1 text-xs text-[#6D7C83]">
                          {s.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Messages Stream */
              messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message._id || Math.random()}
                    className={`flex gap-3 sm:gap-4 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#070B0D] shadow-md ring-1 ring-[#DB2D28]/40">
                        <NexoraIcon size={20} />
                      </div>
                    )}

                    <div className="max-w-[85%] space-y-1.5 sm:max-w-[78%]">
                      <div
                        className={`rounded-2xl px-5 py-4 ${
                          isUser
                            ? "rounded-tr-xs bg-gradient-to-r from-[#DB2D28] to-[#A41715] text-white shadow-lg shadow-[#DB2D28]/20"
                            : "rounded-tl-xs border border-[#41494F]/80 bg-[#070B0D] text-zinc-100 shadow-md backdrop-blur-sm"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-[15px]">
                            {message.content}
                          </p>
                        ) : (
                          <FormattedMessage content={message.content} />
                        )}
                      </div>

                      {!isUser && (
                        <div className="flex items-center gap-2 px-1 font-mono text-[11px] text-[#6D7C83]">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(message._id, message.content)}
                            className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-[#41494F]/30 hover:text-white"
                          >
                            {copiedMessageId === message._id ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* AI Thinking Animation */}
            {isSending && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#070B0D] ring-1 ring-[#DB2D28]/40">
                  <NexoraIcon size={20} />
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-xs border border-[#41494F]/80 bg-[#070B0D] px-4 py-3 font-mono text-xs text-[#6D7C83] shadow-md">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#DB2D28] [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#DB2D28] [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#DB2D28]" />
                  </div>
                  <span>Nexora is crafting your answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-[#41494F]/70 bg-[#070B0D]/90 p-4 backdrop-blur-md sm:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="mx-auto max-w-3xl"
          >
            <div className="relative flex items-center rounded-2xl border border-[#41494F] bg-[#070B0D] shadow-2xl transition focus-within:border-[#DB2D28]/60 focus-within:ring-2 focus-within:ring-[#DB2D28]/20">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Nexora a question or request code... (Shift+Enter for newline)"
                className="w-full resize-none bg-transparent py-3.5 pl-4 pr-14 text-sm text-zinc-100 placeholder-[#6D7C83] outline-none sm:text-base"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#DB2D28] to-[#A41715] text-white shadow-md shadow-[#DB2D28]/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between px-1 font-mono text-[11px] text-[#6D7C83]">
              <span className="flex items-center gap-1">
                <CornerDownLeft size={11} /> Enter to send • Shift + Enter for new line
              </span>
              <span>Nexora • Powered by Gemini AI</span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
