import React from "react";

const StatCard = ({ value, label, color = "text-[var(--text-primary)]", span = false }) => (
  <div
    className={`p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-sidebar-alt)] text-center ${
      span ? "col-span-2" : ""
    }`}
  >
    <span className={`text-2xl font-bold ${color}`}>{value}</span>
    <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-1">
      {label}
    </p>
  </div>
);

const AdminMetricsPanel = ({
  totalUsersCount,
  onlineUsersCount,
  pendingReportsCount,
  suspendedUsersCount,
  pendingAppealsCount,
}) => (
  <div className="flex flex-col gap-6">
    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 px-1">
      Moderator Insights
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <StatCard value={totalUsersCount} label="Total Users" />
      <StatCard value={onlineUsersCount} label="Online Now" color="text-green-400" />

      {/* Double-wide split card */}
      <div className="col-span-2 p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-sidebar-alt)]">
        <div className="flex justify-around items-center">
          <div className="text-center">
            <span className="text-2xl font-bold text-amber-400">{pendingReportsCount}</span>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-1">
              Pending Reports
            </p>
          </div>
          <div className="w-px h-10 bg-[var(--border-light)]" />
          <div className="text-center">
            <span className="text-2xl font-bold text-red-400">{suspendedUsersCount}</span>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-1">
              Banned Users
            </p>
          </div>
          <div className="w-px h-10 bg-[var(--border-light)]" />
          <div className="text-center">
            <span className="text-2xl font-bold text-purple-400">{pendingAppealsCount}</span>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-1">
              Open Appeals
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminMetricsPanel;
