import { useEffect, useState } from "react";
import CommonModal from "../common/CommonModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initState = {
  staffId: "", email: "", password: "", departmentId: "",
  managerId: "", position: "", name: "", phone: "", address: "", isActive: "Y",
};

const positionOptionsMap = {
  DOCTOR: [
    { value: "INTERN",      label: "인턴" },
    { value: "RESIDENT",    label: "레지던트" },
    { value: "FELLOW",      label: "전임의" },
    { value: "SPECIALIST",  label: "전문의" },
    { value: "PROFESSOR",   label: "교수" },
    { value: "HEAD_DOCTOR", label: "과장" },
  ],
  NURSE: [
    { value: "NURSE",          label: "일반 간호사" },
    { value: "CHARGE_NURSE",   label: "책임 간호사" },
    { value: "HEAD_NURSE",     label: "수간호사" },
    { value: "DIRECTOR_NURSE", label: "간호부장" },
  ],
  ADMIN: [
    { value: "STAFF",   label: "사원" },
    { value: "MANAGER", label: "팀장" },
    { value: "ADMIN",   label: "총관리자" },
  ],
};

const selectClass = "w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

const StaffForm = ({ onSubmit, onClose, initialData, departmentList = [], staffList = [] }) => {
  const [form, setForm]                           = useState(initState);
  const [managerModalOpen, setManagerModalOpen]   = useState(false);
  const [managerKeyword, setManagerKeyword]       = useState("");
  const [managerSearchResult, setManagerSearchResult] = useState([]);
  const [selectedManagerLabel, setSelectedManagerLabel] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        staffId: initialData.staffId || "", email: "", password: "",
        departmentId: initialData.departmentId || "", managerId: initialData.managerId || "",
        position: initialData.position || "", name: initialData.name || "",
        phone: initialData.phone || "", address: initialData.address || "",
        isActive: initialData.isActive ?? "Y",
      });
      const mgr = staffList.find(s => Number(s.staffId) === Number(initialData.managerId));
      setSelectedManagerLabel(mgr ? `${mgr.staffId} / ${mgr.name || ""}` : "");
    } else {
      setForm(initState); setSelectedManagerLabel(""); setManagerKeyword(""); setManagerSearchResult([]);
    }
  }, [initialData, staffList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "departmentId") { setForm(p => ({ ...p, departmentId: value, position: "" })); return; }
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleManagerSearch = () => {
    const kw = managerKeyword.trim().replace(/\s/g, "").toLowerCase();
    setManagerSearchResult(staffList.filter(s => {
      const t = `${s.staffId||""} ${s.name||""} ${s.position||""}`.replace(/\s/g,"").toLowerCase();
      return !kw || t.includes(kw);
    }));
  };

  const handleOpenManagerModal  = () => { setManagerModalOpen(true); setManagerKeyword(""); setManagerSearchResult(staffList); };
  const handleCloseManagerModal = () => { setManagerModalOpen(false); setManagerKeyword(""); setManagerSearchResult([]); };
  const handleManagerSelect = (staff) => {
    setForm(p => ({ ...p, managerId: staff.staffId }));
    setSelectedManagerLabel(`${staff.staffId} / ${staff.name || ""}`);
    handleCloseManagerModal();
  };

  const selectedDept      = departmentList.find(d => Number(d.departmentId) === Number(form.departmentId));
  const departmentCategory = selectedDept?.departmentCategory || "";
  const positionOptions   = positionOptionsMap[departmentCategory] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      staffId: form.staffId ? Number(form.staffId) : null,
      email: form.email || null, password: form.password || null,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      managerId: form.managerId ? Number(form.managerId) : null,
      position: form.position, name: form.name, phone: form.phone,
      address: form.address, isActive: form.isActive,
    });
    setForm(initState); setSelectedManagerLabel(""); setManagerKeyword(""); setManagerSearchResult([]);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-base font-semibold text-zinc-900">
          {initialData ? "직원 수정" : "직원 등록"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {!initialData && (
            <>
              <div className="space-y-1.5">
                <Label>이메일</Label>
                <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="이메일 입력" />
              </div>
              <div className="space-y-1.5">
                <Label>비밀번호</Label>
                <Input type="password" name="password" value={form.password} onChange={handleChange} placeholder="비밀번호 입력" />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>부서명</Label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange} disabled={!!initialData} className={selectClass}>
              <option value="">부서 선택</option>
              {departmentList.map(dept => (
                <option key={dept.departmentId} value={dept.departmentId}>{dept.departmentName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>직급</Label>
            <select name="position" value={form.position} onChange={handleChange} className={selectClass}>
              <option value="">직급 선택</option>
              {positionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>이름</Label>
            <Input type="text" name="name" placeholder="이름" value={form.name} onChange={handleChange} />
          </div>

          <div className="space-y-1.5">
            <Label>전화번호</Label>
            <Input type="text" name="phone" placeholder="전화번호" value={form.phone} onChange={handleChange} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>주소</Label>
            <Input type="text" name="address" placeholder="주소" value={form.address} onChange={handleChange} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>담당직원</Label>
            <div className="flex gap-2">
              <Input value={selectedManagerLabel} placeholder="담당직원을 검색하세요" readOnly className="flex-1" />
              <Button type="button" variant="outline" className="shrink-0 cursor-pointer" onClick={handleOpenManagerModal}>검색</Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>상태</Label>
            <select name="isActive" value={form.isActive} onChange={handleChange} className={selectClass}>
              <option value="Y">사용</option>
              <option value="N">비활성</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
          <Button type="button" variant="outline" className="cursor-pointer" onClick={onClose}>취소</Button>
          <Button type="submit" className="cursor-pointer">{initialData ? "수정" : "등록"}</Button>
        </div>
      </form>

      {/* 담당직원 검색 모달 */}
      <CommonModal open={managerModalOpen} onClose={handleCloseManagerModal} title="담당직원 검색">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={managerKeyword}
              onChange={(e) => setManagerKeyword(e.target.value)}
              placeholder="이름 / ID / 직급 검색"
              className="flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleManagerSearch(); } }}
            />
            <Button type="button" variant="outline" className="shrink-0 cursor-pointer" onClick={handleManagerSearch}>검색</Button>
          </div>
          <div className="border border-zinc-200 rounded-lg overflow-y-auto max-h-72 divide-y divide-zinc-100">
            {managerSearchResult.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">검색 결과가 없습니다.</p>
            ) : (
              managerSearchResult.map(staff => (
                <div key={staff.staffId} onClick={() => handleManagerSelect(staff)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{staff.name || "-"}</p>
                    <p className="text-xs text-zinc-400">ID: {staff.staffId} · {staff.position || "-"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CommonModal>
    </>
  );
};

export default StaffForm;
