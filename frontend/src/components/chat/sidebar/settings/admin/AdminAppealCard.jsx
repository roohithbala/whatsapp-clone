import React from "react";

const STATUS_STYLES = {
  pending: { badge: "bg-amber-500/20 text-amber-300", card: "bg-amber-500/5 border-amber-500/25" },
  approved: { badge: "bg-green-500/20 text-green-300", card: "bg-green-500/5 border-green-500/25 opacity-75" },
  denied:  { badge: "bg-red-500/20 text-red-400",    card: "bg-[var(--bg-hover)]/30 border-[var(--border-light)] opacity-75" },
};

const AdminAppealCard = ({ appeal, note, onNoteChange, actionLoadingId, onApprove, onDeny }) => {
  const styles = STATUS_STYLES[appeal.status] || STATUS_STYLES.denied;
  const isPending = appeal.status === "pending";

  return (
    <div className={`p-4 rounded-xl border transition ${styles.card}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
          {appeal.status}
        </span>
        <span className="text-[10px] text-[var(--text-secondary)]">
          {new Date(appeal.createdAt).toLocaleString()}
        </span>
      </div>

      {/* User */}
      <div className="text-xs text-[var(--text-secondary)] mb-1">
        User: <strong className="text-[var(--text-primary)]">{appeal.username || appeal.email}</strong>{" "}
        ({appeal.email})
      </div>

      {/* Reason */}
      <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] mb-3 whitespace-pre-wrap leading-relaxed">
        {appeal.reason}
      </div>

      {/* Admin response or actions */}
      {isPending ? (
        <div className="flex flex-col gap-2">
          <textarea
            rows={2}
            placeholder="Optional admin note / reason (sent to user)..."
            value={note || ""}
            onChange={(e) => onNoteChange(appeal._id, e.target.value)}
            className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--whatsapp-green)] resize-none transition"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(appeal._id)}
              disabled={actionLoadingId === appeal._id}
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition cursor-pointer text-center disabled:opacity-40"
            >
              {actionLoadingId === appeal._id ? "Processing..." : "✅ Approve & Unban"}
            </button>
            <button
              onClick={() => onDeny(appeal._id)}
              disabled={actionLoadingId === appeal._id}
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-600/80 hover:bg-red-700 text-white transition cursor-pointer text-center disabled:opacity-40"
            >
              ❌ Deny
            </button>
          </div>
        </div>
      ) : appeal.adminNote ? (
        <div
          className={`mt-1 p-2 rounded-lg text-[10px] border ${
            appeal.status === "approved"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <span className="font-bold uppercase tracking-wider">Admin Note:</span> {appeal.adminNote}
        </div>
      ) : null}
    </div>
  );
};

export default AdminAppealCard;
