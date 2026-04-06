import React, { useEffect, useState } from "react";

const initState = {
  staffId: "",
  userId: "",
  departmentId: "",
  managerId: "",
  position: "",
  name: "",
  phone: "",
  address: "",
};

const positionOptionsMap = {
  DOCTOR: [
    { value: "INTERN", label: "인턴" },
    { value: "RESIDENT", label: "레지던트" },
    { value: "FELLOW", label: "전임의" },
    { value: "SPECIALIST", label: "전문의" },
    { value: "PROFESSOR", label: "교수" },
    { value: "HEAD_DOCTOR", label: "과장" },
  ],
  NURSE: [
    { value: "NURSE", label: "일반 간호사" },
    { value: "CHARGE_NURSE", label: "책임 간호사" },
    { value: "HEAD_NURSE", label: "수간호사" },
    { value: "DIRECTOR_NURSE", label: "간호부장" },
  ],
  ADMIN: [
    { value: "STAFF", label: "사원" },
    { value: "SENIOR", label: "주임" },
    { value: "ASSISTANT_MANAGER", label: "대리" },
    { value: "MANAGER", label: "팀장" },
    { value: "DIRECTOR", label: "부장" },
  ],
};

const StaffForm = ({
  onSubmit,
  onClose,
  initialData,
  departmentList = [],
  staffList = [],
}) => {
  const [form, setForm] = useState(initState);

  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [managerKeyword, setManagerKeyword] = useState("");
  const [managerSearchResult, setManagerSearchResult] = useState([]);
  const [selectedManagerLabel, setSelectedManagerLabel] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        staffId: initialData.staffId || "",
        userId: initialData.userId || "",
        departmentId: initialData.departmentId || "",
        managerId: initialData.managerId || "",
        position: initialData.position || "",
        name: initialData.name || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
      });

      const selectedManager = staffList.find(
        (staff) => Number(staff.staffId) === Number(initialData.managerId)
      );

      setSelectedManagerLabel(
        selectedManager
          ? `${selectedManager.staffId} / ${selectedManager.name || ""}`
          : ""
      );
    } else {
      setForm(initState);
      setSelectedManagerLabel("");
      setManagerKeyword("");
      setManagerSearchResult([]);
    }
  }, [initialData, staffList]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "departmentId") {
      setForm((prev) => ({
        ...prev,
        departmentId: value,
        position: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManagerSearch = () => {
    const keyword = managerKeyword.trim().toLowerCase();

    if (!keyword) {
      setManagerSearchResult(staffList);
      return;
    }

    const result = staffList.filter((staff) =>
      `${staff.staffId} ${staff.name || ""} ${staff.position || ""}`
        .toLowerCase()
        .includes(keyword)
    );

    setManagerSearchResult(result);
  };

  const handleManagerSelect = (staff) => {
    setForm((prev) => ({
      ...prev,
      managerId: staff.staffId,
    }));

    setSelectedManagerLabel(`${staff.staffId} / ${staff.name || ""}`);
    setManagerModalOpen(false);
    setManagerKeyword("");
    setManagerSearchResult([]);
  };

  const selectedDepartment = departmentList.find(
    (dept) => Number(dept.departmentId) === Number(form.departmentId)
  );

  const departmentCategory = selectedDepartment?.departmentCategory || "";
  const positionOptions = positionOptionsMap[departmentCategory] || [];

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestData = {
      staffId: form.staffId ? Number(form.staffId) : null,
      userId: form.userId ? Number(form.userId) : null,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      managerId: form.managerId ? Number(form.managerId) : null,
      position: form.position,
      name: form.name,
      phone: form.phone,
      address: form.address,
    };

    onSubmit(requestData);

    setForm(initState);
    setSelectedManagerLabel("");
    setManagerKeyword("");
    setManagerSearchResult([]);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h3>직원등록</h3>

        <div style={styles.formGrid}>
          <div>
            <label>사용자ID</label>
            <input
              type="number"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              placeholder="임시 사용자ID 입력"
              disabled={!!initialData}
            />
          </div>

          <div>
            <label>부서명</label>
            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              disabled={!!initialData}
            >
              <option value="">부서 선택</option>
              {departmentList.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>담당직원ID</label>
            <div style={styles.searchRow}>
              <input
                type="text"
                value={selectedManagerLabel}
                placeholder="선택된 담당직원이 표시됩니다"
                readOnly
              />
              <button
                type="button"
                onClick={() => {
                  setManagerModalOpen(true);
                  setManagerKeyword("");
                  setManagerSearchResult(staffList);
                }}
              >
                검색
              </button>
            </div>
          </div>

          <div>
            <label>직급</label>
            <select
              name="position"
              value={form.position}
              onChange={handleChange}
            >
              <option value="">직급선택</option>
              {positionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>이름</label>
            <input
              type="text"
              name="name"
              placeholder="이름"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>전화번호</label>
            <input
              type="text"
              name="phone"
              placeholder="전화번호"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>주소</label>
            <input
              type="text"
              name="address"
              placeholder="주소"
              value={form.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={styles.buttonBox}>
          <button type="submit">{initialData ? "수정" : "등록"}</button>
          <button type="button" onClick={onClose}>
            취소
          </button>
        </div>
      </form>

      {managerModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.header}>
              <h3>담당직원 검색</h3>
              <button
                type="button"
                onClick={() => {
                  setManagerModalOpen(false);
                  setManagerKeyword("");
                  setManagerSearchResult([]);
                }}
              >
                X
              </button>
            </div>

            <div style={styles.searchRow}>
              <input
                type="text"
                value={managerKeyword}
                onChange={(e) => setManagerKeyword(e.target.value)}
                placeholder="이름 / ID / 직급 검색"
                style={modalStyles.searchInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManagerSearch();
                  }
                }}
              />
              <button type="button" onClick={handleManagerSearch}>
                검색
              </button>
            </div>

            <div style={modalStyles.listBox}>
              {managerSearchResult.length === 0 ? (
                <div style={modalStyles.emptyText}>검색 결과가 없습니다.</div>
              ) : (
                managerSearchResult.map((staff) => (
                  <div
                    key={staff.staffId}
                    style={modalStyles.listItem}
                    onClick={() => handleManagerSelect(staff)}
                  >
                    <div>
                      <strong>{staff.name || "-"}</strong>
                    </div>
                    <div>ID: {staff.staffId}</div>
                    <div>{staff.position || "-"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffForm;

const styles = {
  formGrid: {
    display: "grid",
    gap: "10px",
  },
  searchRow: {
    display: "flex",
    gap: "8px",
  },
  buttonBox: {
    marginTop: "16px",
    display: "flex",
    gap: "8px",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    width: "500px",
    maxWidth: "90%",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "80vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box",
  },
  listBox: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflowY: "auto",
    maxHeight: "320px",
  },
  listItem: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },
  emptyText: {
    padding: "20px",
    textAlign: "center",
    color: "#777",
  },
};