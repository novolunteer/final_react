import React, { useEffect, useState } from "react";

const initState = {
  staffId:"",
  userId: "",
  departmentId: "",
  managerId: "",
  position: "",
  jobType: "",
  name: "",
  phone: "",
  address: "",
};

const jobTypeOptions = [
  { value: "DOCTOR", label: "의사" },
  { value: "NURSE", label: "간호사" },
  { value: "RECEPTION", label: "원무직" },
  { value: "ADMIN", label: "행정직" },
];

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
  RECEPTION: [
    { value: "STAFF", label: "사원" },
    { value: "SENIOR", label: "주임" },
    { value: "ASSISTANT_MANAGER", label: "대리" },
    { value: "MANAGER", label: "팀장" },
    { value: "DIRECTOR", label: "부장" },
  ],
  ADMIN: [
    { value: "STAFF", label: "사원" },
    { value: "SENIOR", label: "주임" },
    { value: "ASSISTANT_MANAGER", label: "대리" },
    { value: "MANAGER", label: "팀장" },
    { value: "DIRECTOR", label: "부장" },
  ],
};

const StaffForm = ({ onSubmit, onClose , initialData}) => {
  const [form, setForm] = useState(initState);

  useEffect(()=> {
    if(initialData) {
      setForm({
        staffId: initialData.staffId || "",
        userId: initialData.userId || "",
        departmentId: initialData.departmentId || "",
        managerId: initialData.managerId || "",
        position: initialData.position || "",
        jobType: initialData.jobType || "",
        name: initialData.name || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
      });
    }else {
      setForm(initState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "jobType") {
      setForm({
        ...form,
        jobType: value,
        position: "",
      });
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestData = {
      staffId: form.staffId? Number(form.staffId) : null,
      userId: form.userId ? Number(form.userId) : null,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      managerId: form.managerId ? Number(form.managerId) : null,
      position: form.position,
      jobType: form.jobType,
      name: form.name,
      phone: form.phone,
      address: form.address,
    };

    onSubmit(requestData);
    setForm(initState);
  };

  const positionOptions = positionOptionsMap[form.jobType] || [];

  return (
    <form onSubmit={handleSubmit}>
      <h3>직원등록</h3>

      <div style={styles.formGrid}>
        <div>
          <label>사용자ID</label>
          <input
            type="number"
            name="userId"
            placeholder="userId"
            value={form.userId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>부서ID</label>
          <input
            type="number"
            name="departmentId"
            placeholder="departmentId"
            value={form.departmentId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>담당자ID</label>
          <input
            type="number"
            name="managerId"
            placeholder="managerId"
            value={form.managerId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>직종</label>
          <select name="jobType" value={form.jobType} onChange={handleChange}>
            <option value="">직종 선택</option>
            {jobTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>직급</label>
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            disabled={!form.jobType}
          >
            <option value="">
              {form.jobType ? "직급 선택" : "직종을 먼저 선택하세요"}
            </option>
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
        <button type="submit">등록</button>
        <button type="button" onClick={onClose}>
          취소
        </button>
      </div>
    </form>
  );
};

export default StaffForm;

const styles = {
  formGrid: {
    display: "grid",
    gap: "10px",
  },
  buttonBox: {
    marginTop: "16px",
    display: "flex",
    gap: "8px",
  },
};