import React, { useEffect, useState } from "react";
import StaffForm from "../../components/staff/StaffForm";
import CommonModal from "../../components/common/CommonModal";
import CommonTable from "../../components/common/CommonTable";
import RegisterButton from "../../components/common/RegisterButton";
import SearchBar from "../../components/common/SearchBar";
import {
  getStaffList,
  registerStaff,
  updateStaff,
  deleteStaff,
} from "../../api/staffApi";

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [originalStaffList, setOriginalStaffList] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchCandidates, setSearchCandidates] = useState([]);

  const handleOpen = () => {
    setSelectedStaff(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStaff(null);
  };

  const handleDelete = async (staffId) => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await deleteStaff(staffId);
      await loadStaffList();
    } catch (error) {
      console.error("직원 삭제 실패", error);
    }
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
        managerId: item.managerId,
        jobType: item.jobType,
        position: item.position,
        name: item.name,
        phone: item.phone,
        address: item.address,
        action: (
          <div style={{ display: "flex", gap: "6px" }}>
            <button type="button" onClick={() => handleEdit(item)}>
              수정
            </button>
            <button type="button" onClick={() => handleDelete(item.staffId)}>
              삭제
            </button>
          </div>
        ),
      }));

      setStaffList(mappedData);
      setOriginalStaffList(mappedData);
    } catch (error) {
      console.error("직원 목록 조회 실패", error);
    }
  };

  useEffect(() => {
    loadStaffList();
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

  const handleSearch = () => {
    const keyword = searchKeyword.trim();

    if (!keyword) {
      setStaffList(originalStaffList);
      return;
    }

    const matched = originalStaffList.filter((item) => item.name === keyword);

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
    setStaffList(originalStaffList);
    setSearchCandidates([]);
    setSearchModalOpen(false);
  };

  const columns = [
    { key: "id", title: "번호" },
    { key: "userId", title: "사용자ID" },
    { key: "departmentId", title: "부서ID" },
    { key: "managerId", title: "담당자ID" },
    { key: "jobType", title: "직종" },
    { key: "position", title: "직급" },
    { key: "name", title: "이름" },
    { key: "phone", title: "전화번호" },
    { key: "address", title: "주소" },
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
        />
      </CommonModal>

      <CommonModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      >
        <h3>동명이인 선택</h3>
        <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
          {searchCandidates.map((staff) => (
            <button
              key={staff.staffId}
              type="button"
              onClick={() => handleSelectCandidate(staff)}
              style={styles.candidateButton}
            >
              {staff.name} / {staff.departmentId} / {staff.jobType} / {staff.phone}
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