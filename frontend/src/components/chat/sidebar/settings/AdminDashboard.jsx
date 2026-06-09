import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import AdminReportCard from "./admin/AdminReportCard";
import AdminUserRow from "./admin/AdminUserRow";
import AdminAppealCard from "./admin/AdminAppealCard";
import AdminMetricsPanel from "./admin/AdminMetricsPanel";
import AdminChatViewer from "./admin/AdminChatViewer";
import AdminGroupList from "./admin/AdminGroupList";
import AdminUserChatList from "./admin/AdminUserChatList";

// ── Shared tab button ──────────────────────────────────────────────────────────
const Tab = ({ id, label, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
      activeTab === id
        ? "border-b-2 border-[var(--whatsapp-green)] text-[var(--whatsapp-green)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`}
  >
    {label}
  </button>
);

// ── Loading spinner ────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-8 h-8 border-3 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
    <p className="text-xs text-[var(--text-secondary)]">Loading dashboard data...</p>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const AdminDashboard = ({ 
  onBack, onOpenGroupMonitor, onCloseGroupMonitor,
  adminActiveTab, setAdminActiveTab, adminActiveItem, setAdminActiveItem, adminListRefresh,
  userMonitorSubject, setUserMonitorSubject, setUserMonitorPartner
}) => {
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports]     = useState([]);
  const [users, setUsers]         = useState([]);
  const [appeals, setAppeals]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Per-item mutable state
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessages, setActionMessages]   = useState({});
  const [appealNotes, setAppealNotes]         = useState({});

  // ── Fetchers ─────────────────────────────────────────────────────────────────
  const fetchReports = async () => {
    try { setLoading(true); setError("");
      const res = await api.get("/admin/reports");
      setReports(res.data || []);
    } catch { setError("Failed to load administrative reports."); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { setLoading(true); setError("");
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch { setError("Failed to load users directory."); }
    finally { setLoading(false); }
  };

  const fetchAppeals = async () => {
    try { setLoading(true); setError("");
      const res = await api.get("/admin/appeals");
      setAppeals(res.data || []);
    } catch { setError("Failed to load ban appeals."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "reports") fetchReports();
    else if (activeTab === "users") fetchUsers();
    else if (activeTab === "appeals") fetchAppeals();
    else if (activeTab === "metrics") { fetchReports(); fetchUsers(); fetchAppeals(); }
  }, [activeTab]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleToggleSuspend = async (userId, reason) => {
    const target =
      users.find((u) => u.userId === userId) ||
      reports.find((r) => r.targetUserId === userId)?.target;
    if (!target) return;
    const actionText = target.isSuspended ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${actionText} this account?`)) return;
    try {
      setActionLoadingId(userId);
      const res = await api.post(`/admin/users/${userId}/toggle-suspend`, { reason });
      const updated = res.data.isSuspended;
      setUsers((p) => p.map((u) => u.userId === userId ? { ...u, isSuspended: updated } : u));
      setReports((p) => p.map((r) =>
        r.targetUserId === userId ? { ...r, target: { ...r.target, isSuspended: updated } } : r
      ));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update suspension status.");
    } finally { setActionLoadingId(null); }
  };

  const handleResolveReport = async (reportId) => {
    const msg = (actionMessages[reportId] || "").trim();
    if (!msg) { alert("Please enter an action message before resolving."); return; }
    if (!window.confirm(`Resolve and send this message to the reported user?\n\n"${msg}"`)) return;
    try {
      setActionLoadingId(reportId);
      await api.post(`/admin/reports/${reportId}/resolve`, { actionTaken: msg });
      setReports((p) => p.map((r) => r._id === reportId ? { ...r, status: "resolved", actionTaken: msg } : r));
      setActionMessages((p) => { const n = { ...p }; delete n[reportId]; return n; });
    } catch { alert("Failed to resolve report."); }
    finally { setActionLoadingId(null); }
  };

  const handleAppealAction = async (appealId, action) => {
    const note = (appealNotes[appealId] || "").trim();
    if (!window.confirm(`Are you sure you want to ${action} this appeal?`)) return;
    try {
      setActionLoadingId(appealId);
      await api.post(`/admin/appeals/${appealId}/${action}`, { adminNote: note });
      setAppeals((p) =>
        p.map((a) => a._id === appealId
          ? { ...a, status: action === "approve" ? "approved" : "denied", adminNote: note }
          : a
        )
      );
      setAppealNotes((p) => { const n = { ...p }; delete n[appealId]; return n; });
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} appeal.`);
    } finally { setActionLoadingId(null); }
  };

  // ── Derived counts ────────────────────────────────────────────────────────────
  const pendingReportsCount  = reports.filter((r) => r.status === "pending").length;
  const pendingAppealsCount  = appeals.filter((a) => a.status === "pending").length;
  const totalUsersCount      = users.length;
  const suspendedUsersCount  = users.filter((u) => u.isSuspended).length;
  const onlineUsersCount     = users.filter((u) => u.isOnline).length;

  const isLoading = loading && activeTab !== "metrics" && activeTab !== "groups";

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)] relative overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-light)] flex items-center gap-3 bg-[var(--bg-sidebar-alt)] shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Admin Panel</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-light)] bg-[var(--bg-sidebar-alt)] shrink-0">
        <Tab id="reports"  label={`Reports (${pendingReportsCount})`}  activeTab={activeTab} onClick={(id) => { setActiveTab(id); onCloseGroupMonitor?.(); }} />
        <Tab id="users"    label="Users"                               activeTab={activeTab} onClick={(id) => { setActiveTab(id); onCloseGroupMonitor?.(); }} />
        <Tab id="appeals"  label={`Appeals (${pendingAppealsCount})`}  activeTab={activeTab} onClick={(id) => { setActiveTab(id); onCloseGroupMonitor?.(); }} />
        <Tab
          id="groups"
          label="Groups & Channels"
          activeTab={activeTab}
          onClick={() => { setActiveTab("groups"); onOpenGroupMonitor?.(); }}
        />
        <Tab id="metrics"  label="Stats"                               activeTab={activeTab} onClick={(id) => { setActiveTab(id); onCloseGroupMonitor?.(); }} />
      </div>

      {/* Content — Groups tab shows the sidebar list; threads open in the main right panel */}
      {activeTab === "groups" ? (
        <AdminGroupList
          activeTab={adminActiveTab}
          setActiveTab={setAdminActiveTab}
          activeItem={adminActiveItem}
          setActiveItem={setAdminActiveItem}
          onRefreshTrigger={adminListRefresh}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 text-left">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {isLoading ? <Spinner /> : (
            <>
              {/* Reports Tab */}
              {activeTab === "reports" && (
                <div className="flex flex-col gap-3">
                  {reports.length === 0
                    ? <p className="text-xs text-[var(--text-secondary)] text-center py-10">No abuse reports logged yet.</p>
                    : reports.map((report) => (
                      <AdminReportCard
                        key={report._id}
                        report={report}
                        actionMessage={actionMessages[report._id]}
                        onActionMessageChange={(id, val) => setActionMessages((p) => ({ ...p, [id]: val }))}
                        actionLoadingId={actionLoadingId}
                        onToggleSuspend={handleToggleSuspend}
                        onResolve={handleResolveReport}
                      />
                    ))
                  }
                </div>
              )}


              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="flex flex-col gap-2">
                  {users.length === 0
                    ? <p className="text-xs text-[var(--text-secondary)] text-center py-10">No users found.</p>
                    : users.map((u) => (
                      <AdminUserRow
                        key={u.userId}
                        user={u}
                        actionLoadingId={actionLoadingId}
                        onToggleSuspend={handleToggleSuspend}
                        onViewChats={(user) => {
                          setUserMonitorSubject?.(user);
                          setUserMonitorPartner?.(null);
                        }}
                      />
                    ))
                  }
                </div>
              )}

              {/* Appeals Tab */}
              {activeTab === "appeals" && (
                <div className="flex flex-col gap-3">
                  {appeals.length === 0
                    ? <p className="text-xs text-[var(--text-secondary)] text-center py-10">No ban appeals submitted yet.</p>
                    : appeals.map((appeal) => (
                      <AdminAppealCard
                        key={appeal._id}
                        appeal={appeal}
                        note={appealNotes[appeal._id]}
                        onNoteChange={(id, val) => setAppealNotes((p) => ({ ...p, [id]: val }))}
                        actionLoadingId={actionLoadingId}
                        onApprove={(id) => handleAppealAction(id, "approve")}
                        onDeny={(id) => handleAppealAction(id, "deny")}
                      />
                    ))
                  }
                </div>
              )}

              {/* Metrics Tab */}
              {activeTab === "metrics" && (
                <AdminMetricsPanel
                  totalUsersCount={totalUsersCount}
                  onlineUsersCount={onlineUsersCount}
                  pendingReportsCount={pendingReportsCount}
                  suspendedUsersCount={suspendedUsersCount}
                  pendingAppealsCount={pendingAppealsCount}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* User Chat Monitor — shows sidebar list when a user is selected */}
      {userMonitorSubject && (
        <div className="absolute inset-0 flex flex-col z-10 bg-[var(--bg-sidebar)]">
          <AdminUserChatList
            subject={userMonitorSubject}
            activePartner={null}
            onSelectPartner={(partner) => setUserMonitorPartner?.(partner)}
            onBack={() => {
              setUserMonitorSubject?.(null);
              setUserMonitorPartner?.(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

