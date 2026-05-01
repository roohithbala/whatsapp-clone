import React from 'react';

const SidebarSearch = ({ railMode, searchTerm, setSearchTerm }) => {
  return (
    <div className="sidebar-search-wrap">
      <span className="header-icon search" aria-hidden="true" />
      <input
        type="text"
        className="sidebar-search-input"
        placeholder={
          railMode === "messages" ? "Search or start a new chat" :
          railMode === "archived" ? "Search archived chats" :
          "Search..."
        }
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
    </div>
  );
};

export default SidebarSearch;
