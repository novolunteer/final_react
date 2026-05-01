import React from "react";

const Pagination = ({ page, totalPages, onPageChange, variant = "default" }) => {
  if (totalPages <= 1) return null;

  const s = variant === "sub" ? subStyles : styles;

  return (
    <div style={s.wrap}>
      <button style={s.btn} onClick={() => onPageChange(page - 1)} disabled={page === 0}>
        이전
      </button>
      <span style={s.info}>
        {page + 1} / {totalPages}
      </span>
      <button style={s.btn} onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
        다음
      </button>
    </div>
  );
};

export default Pagination;

const styles = {
  wrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
  },
  btn: {
    minWidth: "64px",
    height: "34px",
    border: "1px solid #cfd8e3",
    borderRadius: "8px",
    background: "#fff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  info: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    minWidth: "52px",
    textAlign: "center",
  },
};

// 부서 내 직원 페이징용 - 작고 회색
const subStyles = {
  wrap: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "6px",
    marginTop: "6px",
    marginBottom: "4px",
  },
  btn: {
    minWidth: "44px",
    height: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
  },
  info: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#94a3b8",
    minWidth: "36px",
    textAlign: "center",
  },
};
