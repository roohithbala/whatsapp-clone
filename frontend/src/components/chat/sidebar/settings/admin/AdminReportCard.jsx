import React from "react";

const AdminReportCard = ({
  report,
  actionMessage,
  onActionMessageChange,
  actionLoadingId,
  onToggleSuspend,
  onResolve,
}) => {
  const isPending = report.status === "pending";

  return (
    <div
      className={`p-4 rounded-xl border transition ${
        isPending
          ? "bg-amber-500/5 border-amber-500/25"
          : "bg-[var(--bg-hover)]/30 border-[var(--border-light)] opacity-75"
      }`}
    >
      {/* Header row */}
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isPending
              ? "bg-amber-500/20 text-amber-300"
              : "bg-green-500/20 text-green-300"
          }`}
        >
          {report.status}
        </span>
        <span className="text-[10px] text-[var(--text-secondary)]">
          {new Date(report.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Parties */}
      <div className="text-xs text-[var(--text-secondary)] mb-1">
        Reporter:{" "}
        <strong className="text-[var(--text-primary)]">{report.reporter.username}</strong>{" "}
        ({report.reporter.email})
      </div>
      <div className="text-xs text-[var(--text-secondary)] mb-2">
        Reported User:{" "}
        <strong className="text-[var(--text-primary)]">{report.target.username}</strong>{" "}
        ({report.target.email})
      </div>

      {/* Reason */}
      <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-light)] text-xs font-mono text-[var(--text-primary)] mb-3 whitespace-pre-wrap leading-relaxed">
        {report.reason}
      </div>

      {/* Actions */}
      {isPending ? (
        <div className="flex flex-col gap-2">
          <textarea
            rows={3}
            placeholder="Type the action/notice message to send to the reported user..."
            value={actionMessage || ""}
            onChange={(e) => onActionMessageChange(report._id, e.target.value)}
            className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--whatsapp-green)] resize-none transition"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (report.target.isSuspended) {
                  onToggleSuspend(report.targetUserId);
                } else {
                  const reason = window.prompt(`Enter suspension reason for ${report.target.username}:`);
                  if (reason === null) return; // cancelled
                  onToggleSuspend(report.targetUserId, reason);
                }
              }}
              disabled={actionLoadingId === report.targetUserId}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                report.target.isSuspended
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {report.target.isSuspended ? "Unsuspend User" : "Suspend / Ban User"}
            </button>
            <button
              onClick={() => onResolve(report._id)}
              disabled={
                actionLoadingId === report._id || !(actionMessage || "").trim()
              }
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-[var(--whatsapp-green)]/90 hover:bg-[var(--whatsapp-green)] text-white transition cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLoadingId === report._id ? "Sending..." : "✉️ Resolve & Notify"}
            </button>
          </div>
        </div>
      ) : report.actionTaken ? (
        <div className="mt-1 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-[10px] text-green-400">
          <span className="font-bold uppercase tracking-wider">Action Sent:</span>{" "}
          {report.actionTaken}
        </div>
      ) : null}
    </div>
  );
};

export default AdminReportCard;
