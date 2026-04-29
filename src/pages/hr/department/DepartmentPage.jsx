import { useEffect, useState } from "react";
import usePagination from "../../../hooks/usePagination";
import Pagination from "../../../components/common/Pagination";
import RegisterButton from "../../../components/common/RegisterButton";
import SearchBar from "../../../components/common/SearchBar";
import CommonTable from "../../../components/common/CommonTable";
import CommonModal from "../../../components/common/CommonModal";
import { getDepartmentList, registerDepartment, updateDepartment, deleteDepartment } from "../../../api/hr/departmentApi";
import DepartmentForm from "../../../components/form/DepartmentForm";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

const DepartmentPage = () => {
  const [departmentList, setDepartmentList]         = useState([]);
  const [originalDepartmentList, setOriginalDepartmentList] = useState([]);
  const [open, setOpen]                             = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchKeyword, setSearchKeyword]           = useState("");
  const { pagedData: pagedDeptList, page, setPage, totalPages } = usePagination(departmentList);

  useEffect(() => { loadDepartmentList(); }, []);

  const loadDepartmentList = async () => {
    try {
      const data = await getDepartmentList();
      const mapped = (Array.isArray(data) ? data : []).map(item => ({
        departmentId:       item.departmentId,
        departmentCategory: item.departmentCategory,
        departmentName:     item.departmentName,
        location:           item.location,
        status:             item.status,
        action: (
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-xs cursor-pointer"
              disabled={item.status === "N"} onClick={() => handleEdit(item)}>수정</Button>
            <Button size="sm" className="h-7 text-xs cursor-pointer bg-red-500 hover:bg-red-600"
              disabled={item.status === "N"} onClick={() => handleDelete(item.departmentId)}>삭제</Button>
          </div>
        ),
      }));
      setDepartmentList(mapped);
      setOriginalDepartmentList(mapped);
    } catch (err) { console.error("부서 목록 조회 실패", err); setDepartmentList([]); }
  };

  const handleOpen  = () => { setSelectedDepartment(null); setOpen(true); };
  const handleClose = () => { setOpen(false); setSelectedDepartment(null); };
  const handleEdit  = (dept) => { setSelectedDepartment(dept); setOpen(true); };

  const handleSubmit = async (data) => {
    try {
      if (selectedDepartment) await updateDepartment(data);
      else                    await registerDepartment(data);
      await loadDepartmentList();
      handleClose();
    } catch (err) { console.error("부서 저장 실패", err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try { await deleteDepartment(id); await loadDepartmentList(); }
    catch (err) { console.error("부서 삭제 실패", err); }
  };

  const handleSearch = () => {
    const kw = searchKeyword.replace(/\s/g,"").toLowerCase();
    if (!kw) { setDepartmentList(originalDepartmentList); return; }
    const matched = originalDepartmentList.filter(i => (i.departmentName||"").replace(/\s/g,"").toLowerCase().includes(kw));
    if (matched.length === 0) { alert("검색 결과가 없습니다"); setDepartmentList([]); return; }
    setDepartmentList(matched);
  };

  const handleResetSearch = () => { setSearchKeyword(""); setDepartmentList(originalDepartmentList); };

  const columns = [
    { key: "departmentId",       title: "번호" },
    { key: "departmentName",     title: "부서명" },
    { key: "departmentCategory", title: "카테고리" },
    { key: "location",           title: "위치" },
    { key: "status",             title: "상태" },
    { key: "action",             title: "관리" },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-zinc-900">부서 관리</h2>
        </div>
        <RegisterButton onClick={handleOpen} />
      </div>

      {/* 검색 */}
      <div className="flex items-center gap-2">
        <SearchBar value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
          onSearch={handleSearch} placeholder="부서명을 입력하세요" />
        <Button variant="outline" className="cursor-pointer" onClick={handleResetSearch}>전체보기</Button>
      </div>

      <CommonTable columns={columns} data={pagedDeptList} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <CommonModal open={open} onClose={handleClose} title={selectedDepartment ? "부서 수정" : "부서 등록"}>
        <DepartmentForm onSubmit={handleSubmit} onClose={handleClose} initialData={selectedDepartment} />
      </CommonModal>
    </div>
  );
};

export default DepartmentPage;
