import React, { useEffect, useMemo, useState } from "react";
import StaffForm from "../../../components/form/StaffForm";
import CommonModal from "../../../components/common/CommonModal";
import CommonTable from "../../../components/common/CommonTable";
import RegisterButton from "../../../components/common/RegisterButton";
import SearchBar from "../../../components/common/SearchBar";
import {
  getStaffList,
  registerStaff,
  updateStaff,
  deleteStaff,
} from "../../../api/hr/staffApi";
import { getDepartmentList } from "../../../api/hr/departmentApi";

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [originalStaffList, setOriginalStaffList] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchCandidates, setSearchCandidates] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const handleOpen = () => {
    setSelectedStaff(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStaff(null);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setOpen(true);
  };

  const loadStaffList = async () => {
    try {
      const data = await getStaffList();

      const mappedData = data.map((item) => ({
        id: item.staffId,
        staffId: item.staffId,
        userId: item.userId,
        departmentId: item.departmentId,
        departmentName: item.departmentName,
        managerId: item.managerId,
        position: item.position,
        name: item.name,
        phone: item.phone,
        address: item.address,
        isActive: item.isActive,
        action: (
          <div style={{ display: "flex", gap: "6px" }}>
            <button type="button" disabled={item.isActive=="N"} onClick={() => handleEdit(item)}>
              수정
            </button>
          </div>
        ),
      }));

      setOriginalStaffList(mappedData);
      setStaffList(mappedData);
    } catch (error) {
      console.error("직원 목록 조회 실패", error);
    }
  };

  const loadDepartmentList = async () => {
    try {
      const data = await getDepartmentList();
      setDepartmentList(data || []);
    } catch (error) {
      console.error("부서 목록 조회 실패", error);
    }
  };

  useEffect(() => {
    loadStaffList();
    loadDepartmentList();
  }, []);

  const handleSubmit = async (staffData) => {
    try {
      if (selectedStaff) {
        await updateStaff(staffData);
      } else {
        await registerStaff(staffData);
      }

      await loadStaffList();
      handleClose();
    } catch (error) {
      console.error("직원 저장 실패", error);
    }
  };

  const sortedFilteredStaffList = useMemo(() => {
    let result = [...originalStaffList];

    if (selectedDepartmentId) {
      result = result.filter(
        (item) => String(item.departmentId) === String(selectedDepartmentId)
      );
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter((item) =>
        (item.name || "").toLowerCase().includes(keyword)
      );
    }

    result.sort((a, b) => {
      const nameCompare = (a.name || "").localeCompare(b.name || "", "ko");
      if (nameCompare !== 0) return nameCompare;

      return Number(a.staffId) - Number(b.staffId);
    });

    return result;
  }, [originalStaffList, selectedDepartmentId, searchKeyword]);

  useEffect(() => {
    setStaffList(sortedFilteredStaffList);
  }, [sortedFilteredStaffList]);

  const handleSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();

    let baseList = [...originalStaffList];

    if (selectedDepartmentId) {
      baseList = baseList.filter(
        (item) => String(item.departmentId) === String(selectedDepartmentId)
      );
    }

    if (!keyword) {
      const sortedList = baseList.sort((a, b) => {
        const nameCompare = (a.name || "").localeCompare(b.name || "", "ko");
        if (nameCompare !== 0) return nameCompare;

        return Number(a.staffId) - Number(b.staffId);
      });

      setStaffList(sortedList);
      return;
    }

    const matched = baseList
      .filter((item) => (item.name || "").toLowerCase().includes(keyword))
      .sort((a, b) => {
        const nameCompare = (a.name || "").localeCompare(b.name || "", "ko");
        if (nameCompare !== 0) return nameCompare;

        return Number(a.staffId) - Number(b.staffId);
      });

    if (matched.length === 0) {
      alert("검색 결과가 없습니다.");
      setStaffList([]);
      return;
    }

    if (matched.length === 1) {
      setStaffList(matched);
      return;
    }

    setSearchCandidates(matched);
    setSearchModalOpen(true);
  };

  const handleSelectCandidate = (staff) => {
    setStaffList([staff]);
    setSearchModalOpen(false);
    setSearchCandidates([]);
  };

  const handleResetSearch = () => {
    setSearchKeyword("");
    setSelectedDepartmentId("");
    setSearchCandidates([]);
    setSearchModalOpen(false);

    const resetList = [...originalStaffList].sort((a, b) => {
      const nameCompare = (a.name || "").localeCompare(b.name || "", "ko");
      if (nameCompare !== 0) return nameCompare;

      return Number(a.staffId) - Number(b.staffId);
    });

    setStaffList(resetList);
  };

  const sortedDepartmentList = useMemo(() => {
  return [...departmentList].sort((a, b) =>
    (a.departmentName || "").localeCompare(b.departmentName || "", "ko")
  );
}, [departmentList]);


  const columns = [
    { key: "id", title: "직원번호" },
    { key: "userId", title: "사용자ID" },
    { key: "departmentName", title: "부서명" },
    { key: "managerId", title: "담당직원ID" },
    { key: "position", title: "직급" },
    { key: "name", title: "이름" },
    { key: "phone", title: "전화번호" },
    { key: "address", title: "주소" },
    { key: "isActive", title:"상태"},
    { key: "action", title: "관리" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>직원 관리</h2>
        <RegisterButton onClick={handleOpen} />
      </div>

      <div style={styles.topBar}>
        <SearchBar
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
          placeholder="이름으로 검색"
        />

        <select
          value={selectedDepartmentId}
          onChange={(e) => setSelectedDepartmentId(e.target.value)}
          style={styles.select}
        >
          <option value="">전체부서</option>
          {sortedDepartmentList.map((dept) => (
            <option key={dept.departmentId} value={dept.departmentId}>
              {dept.departmentName}
            </option>
          ))}
        </select>

        <button type="button" onClick={handleResetSearch}>
          전체보기
        </button>
      </div>

      <CommonTable columns={columns} data={staffList} />

      <CommonModal open={open} onClose={handleClose}>
        <StaffForm
          onSubmit={handleSubmit}
          onClose={handleClose}
          initialData={selectedStaff}
          departmentList={departmentList}
          staffList={originalStaffList}
        />
      </CommonModal>

      <CommonModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      >
        <h3>동명이인 선택</h3>
        <p>직원번호 / 이름 / 부서명 / 전화번호</p>
        <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
          {searchCandidates.map((staff) => (
            <button
              key={staff.staffId}
              type="button"
              onClick={() => handleSelectCandidate(staff)}
              style={styles.candidateButton}
            >
              {staff.staffId} / {staff.name} / {staff.departmentName} / {staff.phone}
            </button>
          ))}
        </div>
      </CommonModal>
    </div>
  );
};

export default StaffPage;

const styles = {
  container: {
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  topBar: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  candidateButton: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },
};