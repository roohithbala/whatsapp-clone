import React, { useState, useEffect } from "react";
import api from "../../../../../services/api";

const fmt = (iso) =>
  new Date(iso).toLocaleString([], { dateStyle: "short", timeStyle: "short" });

const Avatar = ({ name, url, size = "w-10 h-10" }) => (
  <div
    className={`${size} rounded-full bg-[var(--whatsapp-teal)]/20 border border-[var(--border-light)] flex items-center justify-center text-sm font-bold text-[var(--whatsapp-green)] shrink-0 overflow-hidden`}
  >
    {url ? (
      <img src={url} alt={name} className="w-full h-full object-cover" />
    ) : (
      (name || "?").substring(0, 2).toUpperCase()
    )}
  </div>
);

export default function AdminGroupList({
  activeTab,
  setActiveTab,
  activeItem,
  setActiveItem,
  onRefreshTrigger
}) {
  const [groups, setGroups] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadList = async () => {
    setLoadingList(true);
    try {
      if (activeTab === "groups") {
        const r = await api.get("/admin/groups");
        setGroups(r.data || []);
      } else {
        const r = await api.get("/admin/channels");
        setChannels(r.data || []);
      }
    } catch (err) {
      console.error("Failed to load monitored items:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [activeTab, onRefreshTrigger]);

  const listItems = activeTab === "groups" ? groups : channels;
  const filteredItems = listItems.filter(item => {
    const q = searchQuery.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(q);
    const descMatch = item.description?.toLowerCase().includes(q);
    const commMatch = item.communityName?.toLowerCase().includes(q);
    return nameMatch || descMatch || commMatch;
  });

  return (
    <div className="flex-grow flex flex-col min-h-0 bg-[var(--bg-sidebar)]">
      {/* Search & Tabs */}
      <div className="p-4 border-b border-[var(--border-light)] space-y-3 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("groups"); setActiveItem(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "groups" ? "bg-[var(--whatsapp-teal)]/20 text-[var(--whatsapp-green)] border border-[var(--whatsapp-teal)]/30" : "bg-[var(--bg-input)]/30 border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
          >
            Groups
          </button>
          <button
            onClick={() => { setActiveTab("channels"); setActiveItem(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "channels" ? "bg-[var(--whatsapp-teal)]/20 text-[var(--whatsapp-green)] border border-[var(--whatsapp-teal)]/30" : "bg-[var(--bg-input)]/30 border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
          >
            Channels
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeTab === "groups" ? "groups..." : "channels..."}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-input)] text-xs text-[var(--text-primary)] px-3 py-2 rounded-xl outline-none border border-[var(--border-light)] focus:border-[var(--whatsapp-teal)] transition"
          />
        </div>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto space-y-0.5 p-2">
        {loadingList ? (
          <div className="text-center text-xs text-[var(--text-secondary)] py-8 animate-pulse">Loading list...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-xs text-[var(--text-secondary)] py-8">No matching items found.</div>
        ) : (
          filteredItems.map(item => {
            const itemId = item.groupId || item.channelId;
            const isSelected = activeItem && (activeItem.groupId === item.groupId || activeItem.channelId === item.channelId);
            return (
              <button
                key={itemId}
                onClick={() => setActiveItem(item)}
                className={`w-full flex gap-3 p-3 rounded-xl text-left transition ${isSelected ? "bg-[var(--bg-active)]" : "hover:bg-[var(--bg-hover)]"}`}
              >
                <Avatar name={item.name} url={item.avatarUrl} size="w-10 h-10" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-1.5">
                    <h4 className="text-xs font-bold truncate text-[var(--text-primary)]">{item.name}</h4>
                    {item.communityName && (
                      <span className="bg-amber-500/20 text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        👥 {item.communityName}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{item.description || "No description."}</p>
                  <div className="flex items-center justify-between text-[9px] text-[var(--text-secondary)] mt-1.5 border-t border-[var(--border-light)]/20 pt-1">
                    <span>
                      {activeTab === "groups"
                        ? `👥 ${item.memberCount} members`
                        : `📢 ${item.followerCount} followers`}
                    </span>
                    {item.lastMessage && (
                      <span className="opacity-80">
                        {fmt(item.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
