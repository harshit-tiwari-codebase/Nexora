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
 * Hamburger icon that morphs into an X (and back) based on `open`
 */
const MenuToggleIcon = ({ open }) => {
  const bar =
    "absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out motion-reduce:transition-none";
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span className={`${bar} ${open ? "top-[9px] rotate-45" : "top-1"}`} />
      <span className={`${bar} top-[9px] ${open ? "scale-x-0 opacity-0" : ""}`} />
      <span className={`${bar} ${open ? "top-[9px] -rotate-45" : "top-[14px]"}`} />
    </span>
  );
};

/**
 * Lightweight markdown renderer for AI replies:
 * headings, paragraphs, bullet/numbered lists, blockquotes, tables, hr,
 * fenced code blocks, inline code, bold, italic and links.
 */
const INLINE_REGEX =
  /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\s][^*\n]*\*)|(\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\))/g;

const renderInline = (text, keyPrefix) => {
  const nodes = [];
  let last = 0;
  let i = 0;
  let m;
  INLINE_REGEX.lastIndex = 0;

  while ((m = INLINE_REGEX.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i++}`;
    const token = m[0];

    if (m[1]) {
      nodes.push(
        <code
          key={key}
          className="rounded-md border border-[#41494F]/60 bg-[#41494F]/30 px-1.5 py-0.5 font-mono text-[0.85em] text-[#FF8A86] [overflow-wrap:anywhere]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (m[2]) {
      nodes.push(
        <strong key={key} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (m[3]) {
      nodes.push(
        <em key={key} className="italic text-zinc-100">
          {token.slice(1, -1)}
        </em>
      );
    } else if (m[4]) {
      nodes.push(
        <a
          key={key}
          href={m[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF6B66] underline decoration-[#DB2D28]/50 underline-offset-2 transition hover:text-white"
        >
          {m[5]}
        </a>
      );
    }
    last = m.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

const splitTableCells = (row) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

const TABLE_SEPARATOR = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const isBlockStart = (lines, i) => {
  const line = lines[i];
  return (
    /^\s*```/.test(line) ||
    /^#{1,4}\s+/.test(line) ||
    /^\s*([-*_])\1{2,}\s*$/.test(line) ||
    /^\s*>/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    (line.includes("|") && i + 1 < lines.length && TABLE_SEPARATOR.test(lines[i + 1]))
  );
};

const parseBlocks = (content) => {
  const lines = (content || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^\s*```(\S*)\s*$/);
    if (fence) {
      const codeLines = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "code", lang: fence[1] || "code", code: codeLines.join("\n") });
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && TABLE_SEPARATOR.test(lines[i + 1])) {
      const header = splitTableCells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitTableCells(lines[i]));
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join("\n") });
      continue;
    }

    // Bullet list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        const indent = lines[i].match(/^\s*/)[0].length;
        items.push({ indent, text: lines[i].replace(/^\s*[-*+]\s+/, "") });
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Numbered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        const indent = lines[i].match(/^\s*/)[0].length;
        items.push({ indent, text: lines[i].replace(/^\s*\d+[.)]\s+/, "") });
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph
    const paraLines = [];
    while (i < lines.length && lines[i].trim() && (paraLines.length === 0 || !isBlockStart(lines, i))) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: paraLines.join("\n") });
  }

  return blocks;
};

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-[#41494F]/80 bg-[#0B1013] shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-[#41494F]/60 bg-[#41494F]/15 px-3 py-1.5 sm:px-4">
        <span className="truncate font-mono text-xs lowercase text-[#6D7C83]">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 font-mono text-xs text-[#6D7C83] transition hover:bg-[#41494F]/40 hover:text-white"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-zinc-200 sm:p-4 sm:text-[13px]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const HEADING_STYLES = {
  1: "text-xl font-bold text-white sm:text-2xl",
  2: "text-lg font-semibold text-white sm:text-xl",
  3: "text-base font-semibold text-white sm:text-lg",
  4: "text-sm font-semibold text-zinc-100 sm:text-base",
};

const FormattedMessage = ({ content }) => {
  const blocks = parseBlocks(content);

  return (
    <div className="min-w-0 space-y-3.5 break-words text-[15px] leading-7 text-zinc-200 [overflow-wrap:anywhere]">
      {blocks.map((block, idx) => {
        const key = `b-${idx}`;

        switch (block.type) {
          case "code":
            return <CodeBlock key={key} language={block.lang} code={block.code} />;

          case "heading":
            return (
              <div
                key={key}
                role="heading"
                aria-level={block.level}
                className={`${HEADING_STYLES[block.level]} !mt-5 leading-snug first:!mt-0`}
              >
                {renderInline(block.text, key)}
              </div>
            );

          case "hr":
            return <hr key={key} className="border-[#41494F]/60" />;

          case "quote":
            return (
              <blockquote
                key={key}
                className="whitespace-pre-wrap rounded-r-lg border-l-2 border-[#DB2D28]/70 bg-[#40080A]/20 py-2 pl-4 pr-3 text-zinc-300"
              >
                {renderInline(block.text, key)}
              </blockquote>
            );

          case "ul":
          case "ol": {
            const ListTag = block.type;
            return (
              <ListTag
                key={key}
                className={`space-y-1.5 pl-5 ${
                  block.type === "ul"
                    ? "list-disc marker:text-[#DB2D28]"
                    : "list-decimal marker:font-mono marker:text-[#6D7C83]"
                }`}
              >
                {block.items.map((item, itemIdx) => (
                  <li
                    key={`${key}-${itemIdx}`}
                    className="pl-1"
                    style={{
                      marginLeft: `${Math.min(Math.floor(item.indent / 2), 3)}rem`,
                    }}
                  >
                    {renderInline(item.text, `${key}-${itemIdx}`)}
                  </li>
                ))}
              </ListTag>
            );
          }

          case "table":
            return (
              <div key={key} className="w-full overflow-x-auto rounded-xl border border-[#41494F]/70">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#41494F]/25 text-zinc-100">
                    <tr>
                      {block.header.map((cell, cIdx) => (
                        <th key={cIdx} className="whitespace-nowrap px-3 py-2 font-semibold">
                          {renderInline(cell, `${key}-h${cIdx}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-t border-[#41494F]/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 align-top text-zinc-300">
                            {renderInline(cell, `${key}-${rIdx}-${cIdx}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return (
              <p key={key} className="whitespace-pre-wrap">
                {renderInline(block.text, key)}
              </p>
            );
        }
      })}
    </div>
  );
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  // Auto-grow the textarea (up to a max height) as the user types
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [inputMessage]);

  // Lock body scroll while the mobile sidebar is open
  useEffect(() => {
    if (!isSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSidebarOpen]);

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
    if (chatId === activeChatId) {
      setIsSidebarOpen(false);
      return;
    }

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
    const text = (typeof textToSend === "string" ? textToSend : inputMessage).trim();
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
      const errorMessage =
        error.response?.data?.message ||
        "The message could not be sent. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          _id: "err-" + Date.now(),
          chat: currentChatId,
          content: errorMessage,
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
    <div className="dashboard-viewport flex w-full min-w-0 overflow-hidden bg-[#070B0D] text-zinc-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-14 z-40 bg-black/80 backdrop-blur-sm sm:top-16 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* -------------------- SIDEBAR -------------------- */}
      <aside
        className={`fixed bottom-0 left-0 top-14 z-50 flex w-[min(18rem,88vw)] shrink-0 flex-col sm:top-16 border-r border-[#41494F]/70 bg-[#070B0D] transition-transform duration-200 ease-in-out md:static md:top-auto md:w-72 md:translate-x-0 lg:w-80 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#41494F]/70 px-4 sm:h-16">
          <NexoraLogo size="md" subtitle="AI Workspace" />

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
              className="w-full rounded-xl border border-[#41494F] bg-[#070B0D] py-2 pl-8 pr-8 text-base text-zinc-200 placeholder-[#6D7C83] outline-none transition focus:border-[#DB2D28]/60 focus:ring-1 focus:ring-[#DB2D28]/30 sm:text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-[#6D7C83] hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-1 scrollbar-thin">
          <div className="mb-2 px-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#6D7C83]">
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
                        className={`shrink-0 ${isActive ? "text-[#DB2D28]" : "text-[#6D7C83]"}`}
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
                          className="w-full min-w-0 rounded bg-[#070B0D] px-1 py-0.5 text-base text-white outline-none ring-1 ring-[#DB2D28] sm:text-xs"
                        />
                      ) : (
                        <span className="truncate text-sm">{chat.title}</span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="ml-2 flex shrink-0 items-center gap-0.5 transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, chat)}
                          title="Rename"
                          aria-label="Rename chat"
                          className="rounded p-1.5 text-[#6D7C83] hover:bg-[#41494F]/40 hover:text-white"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteChat(e, chat._id)}
                          title="Delete"
                          aria-label="Delete chat"
                          className="rounded p-1.5 text-[#6D7C83] hover:bg-[#DB2D28]/20 hover:text-[#DB2D28]"
                        >
                          <Trash2 size={14} />
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
        <div className="shrink-0 border-t border-[#41494F]/70 bg-[#070B0D] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#41494F]/60 bg-[#070B0D] p-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#DB2D28] to-[#A41715] text-xs font-semibold text-white shadow-sm">
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
              aria-label="Logout"
              className="shrink-0 rounded-lg p-2 text-[#6D7C83] transition hover:bg-[#DB2D28]/20 hover:text-[#DB2D28]"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* -------------------- MAIN CHAT CONTAINER -------------------- */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#070B0D]">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#41494F]/70 bg-[#070B0D]/90 px-3 backdrop-blur-md sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={isSidebarOpen}
              className={`shrink-0 rounded-lg p-2 transition-colors hover:bg-[#41494F]/40 hover:text-white md:hidden ${
                isSidebarOpen ? "text-white" : "text-[#6D7C83]"
              }`}
              onClick={() => setIsSidebarOpen((open) => !open)}
            >
              <MenuToggleIcon open={isSidebarOpen} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white sm:text-base">
                {activeChat?.title || "New Conversation"}
              </h2>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#6D7C83] sm:gap-2 sm:text-[11px]">
                <span className="flex items-center gap-1 text-[#DB2D28]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#DB2D28]" />
                  Nexora AI
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Context-Aware Memory</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateNewChat}
            aria-label="New chat"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#41494F] bg-[#070B0D] p-2 font-mono text-xs font-medium text-zinc-200 shadow-sm transition hover:border-[#DB2D28]/50 hover:text-white sm:px-3.5 sm:py-1.5"
          >
            <Plus size={14} className="text-[#DB2D28]" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </header>

        {/* Message Area */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-8 sm:py-6">
          <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
            {isLoadingMessages ? (
              <div className="flex h-64 items-center justify-center font-mono text-sm text-[#6D7C83]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-ping rounded-full bg-[#DB2D28]" />
                  Loading conversation...
                </div>
              </div>
            ) : messages.length === 0 ? (
              /* Empty State / Welcome Screen */
              <div className="dashboard-welcome flex flex-col items-center justify-center pt-1 text-center sm:pt-14">
                <div className="dashboard-welcome-icon relative mb-3 sm:mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#DB2D28] to-[#A41715] opacity-25 blur-xl" />
                  <NexoraIcon size={48} className="relative shadow-2xl sm:h-14 sm:w-14" />
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DB2D28]/40 bg-[#40080A]/40 px-3 py-1 font-mono text-[11px] font-medium text-[#DB2D28] sm:px-3.5 sm:text-xs">
                  <Sparkles size={12} />
                  Your AI coding companion
                </div>

                <h1 className="mt-3 max-w-xl text-balance text-xl font-bold tracking-tight text-white sm:mt-4 sm:text-4xl">
                  What would you like to build today?
                </h1>
                <p className="dashboard-welcome-description mt-1.5 max-w-md px-2 text-xs text-[#6D7C83] sm:mt-2 sm:text-sm">
                  Nexora provides intelligent code generation, architecture planning, debugging, and software tutoring.
                </p>

                {/* Suggestions Grid */}
                <div className="dashboard-welcome-suggestions mt-4 grid w-full max-w-2xl grid-cols-2 gap-2 sm:mt-8 sm:gap-3">
                  {SUGGESTIONS.map((s, idx) => {
                    const IconComponent = s.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(s.prompt)}
                        className="group flex min-w-0 flex-col items-start rounded-2xl border border-[#41494F]/80 bg-[#070B0D]/80 p-2.5 text-left transition duration-200 hover:border-[#DB2D28]/50 hover:bg-[#40080A]/20 hover:shadow-xl active:scale-[0.98] sm:p-4 sm:hover:-translate-y-0.5"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DB2D28]/15 text-[#DB2D28] group-hover:bg-[#DB2D28]/25 sm:h-8 sm:w-8">
                          <IconComponent size={16} />
                        </div>
                        <span className="mt-2 text-xs font-semibold text-zinc-200 group-hover:text-white sm:mt-3 sm:text-sm">
                          {s.title}
                        </span>
                        <span className="mt-1 text-[10px] leading-snug text-[#6D7C83] sm:text-xs sm:leading-normal">{s.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Messages Stream */
              messages.map((message, index) => {
                const isUser = message.role === "user";
                const time = formatTime(message.createdAt);

                if (isUser) {
                  return (
                    <div key={message._id || `msg-${index}`} className="flex justify-end">
                      <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#DB2D28] to-[#A41715] px-3.5 py-3 text-white shadow-lg shadow-[#DB2D28]/20 sm:max-w-[78%] sm:px-5 sm:py-3.5">
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere] sm:text-[15px]">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={message._id || `msg-${index}`} className="flex gap-2.5 sm:gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#070B0D] shadow-md ring-1 ring-[#DB2D28]/40">
                      <NexoraIcon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] text-[#6D7C83]">
                        <span className="font-semibold text-zinc-300">Nexora</span>
                        {time && <span>{time}</span>}
                      </div>

                      <FormattedMessage content={message.content} />

                      <div className="mt-2.5 flex items-center gap-1 font-mono text-[11px] text-[#6D7C83]">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(message._id, message.content)}
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-[#41494F]/30 hover:text-white"
                        >
                          {copiedMessageId === message._id ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* AI Thinking Animation */}
            {isSending && (
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#070B0D] ring-1 ring-[#DB2D28]/40">
                  <NexoraIcon size={20} />
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded-2xl rounded-tl-xs border border-[#41494F]/80 bg-[#070B0D] px-4 py-3 font-mono text-xs text-[#6D7C83] shadow-md">
                  <div className="flex shrink-0 gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#DB2D28] [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#DB2D28] [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#DB2D28]" />
                  </div>
                  <span className="truncate">Nexora is crafting your answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="shrink-0 border-t border-[#41494F]/70 bg-[#070B0D]/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:px-8 sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="mx-auto w-full max-w-3xl"
          >
            <div className="relative flex items-end rounded-2xl border border-[#41494F] bg-[#070B0D] shadow-2xl transition focus-within:border-[#DB2D28]/60 focus-within:ring-2 focus-within:ring-[#DB2D28]/20">
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
                placeholder="Ask Nexora anything..."
                aria-label="Message Nexora"
                className="max-h-40 w-full resize-none bg-transparent py-3.5 pl-4 pr-14 text-base text-zinc-100 placeholder-[#6D7C83] outline-none"
              />

              <button
                type="submit"
                aria-label="Send message"
                disabled={!inputMessage.trim() || isSending}
                className="absolute bottom-2 right-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#DB2D28] to-[#A41715] text-white shadow-md shadow-[#DB2D28]/30 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="mt-2 hidden items-center justify-between px-1 font-mono text-[11px] text-[#6D7C83] sm:flex">
              <span className="flex items-center gap-1">
                <CornerDownLeft size={11} /> Enter to send • Shift + Enter for new line
              </span>
              <span>Nexora AI</span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;