import React from 'react';

const SidebarFilters = ({ quickFilter, setQuickFilter, setListScope, unreadCount }) => {
  return (
    <div className="sidebar-filters-row">
      <button
        type="button"
        className={`sidebar-chip ${quickFilter === "all" ? "active" : ""}`}
        onClick={() => {
          setQuickFilter("all");
          setListScope("all");
        }}
      >
        All
      </button>
      <button
        type="button"
        className={`sidebar-chip ${quickFilter === "unread" ? "active" : ""}`}
        onClick={() => setQuickFilter("unread")}
      >
        Unread {unreadCount > 0 ? unreadCount : ""}
      </button>
      <button
        type="button"
        className={`sidebar-chip ${quickFilter === "favorites" ? "active" : ""}`}
        onClick={() => setQuickFilter("favorites")}
      >
        Favorites
      </button>
      <button
        type="button"
        className={`sidebar-chip ${quickFilter === "groups" ? "active" : ""}`}
        onClick={() => setQuickFilter("groups")}
      >
        Groups
      </button>
      <button
        type="button"
        className={`sidebar-chip ${quickFilter === "communities" ? "active" : ""}`}
        onClick={() => setQuickFilter("communities")}
      >
        Communities
      </button>
    </div>
  );
};

export default SidebarFilters;
