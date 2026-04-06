import React, { useEffect, useState } from "react";

const initState = {
  staffId:"",
  userId: "",
  departmentId: "",
  managerId: "",
  position: "",
  name: "",
  phone: "",
  address: "",
};


const positionOptionsMap = {
  "DOCTOR": [
    { value: "INTERN", label: "인턴" },
    { value: "RESIDENT", label: "레지던트" },
    { value: "FELLOW", label: "전임의" },
    { value: "SPECIALIST", label: "전문의" },
    { value: "PROFESSOR", label: "교수" },
    { value: "HEAD_DOCTOR", label: "과장" },
  ],
  "NURSE": [
    { value: "NURSE", label: "일반 간호사" },
    { value: "CHARGE_NURSE", label: "책임 간호사" },
    { value: "HEAD_NURSE", label: "수간호사" },
    { value: "DIRECTOR_NURSE", label: "간호부장" },
  ],
  "ADMIN": [
    { value: "STAFF", label: "사원" },
    { value: "SENIOR", label: "주임" },
    { value: "ASSISTANT_MANAGER", label: "대리" },
    { value: "MANAGER", label: "팀장" },
    { value: "DIRECTOR", label: "부장" },
  ],

};

const StaffForm = ({ onSubmit, 
                     onClose ,
                     initialData,
                     departmentList=[],
                     userList=[],
                     staffList=[],

  }) => {
  const [form, setForm] = useState(initState);
  const [userkeyword, setUserKeyword]= useState("");
  const [managerKeyword, setManagerKeyword] = useState("");

  useEffect(()=> {
    if(initialData) {
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
    }else {
      setForm(initState);
      setUserKeyword("");
      setManagerKeyword("");
    }
  }, [initialData]);

  const filteredUsers= userList.filter((user)=>
    `${user.userId} ${user.name || ""} ${user.email || ""}`
      .toLowerCase()
      .includes(userkeyword.toLowerCase())
      );

  const filteredManagers= staffList.filter((staff)=>
    `${staff.staffId} ${staff.name||""}`
    .toLowerCase()
    .includes(managerKeyword.toLowerCase())  
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name=="departmentId"){
    setForm({
      ...form,
      departmentId : value,
      position : "",
    });
      return;
    }
    setForm((prev)=>({
      ...prev,
      [name]:value,
    }));
  };

  const selectedDepartment=departmentList.find(
    (dept)=>dept.departmentId == Number(form.departmentId)
  );

  const departmentCategory = selectedDepartment?.departmentCategory || "";
  
  const positionOptions = positionOptionsMap[departmentCategory] || [];
  const handleSubmit = (e) => {
    e.preventDefault();

    

    const requestData = {
      staffId: form.staffId? Number(form.staffId) : null,
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
  };


  return (
    <form onSubmit={handleSubmit}>
      <h3>직원등록</h3>

      <div style={styles.formGrid}>
        <div>
          <label>사용자ID</label>
          <input
            type="text"
            placeholder="이름 / 이메일 / ID 검색"
            value={userkeyword}
            onChange={(e)=>setUserKeyword(e.target.value)}
            disabled={!!initialData}
          />
            <select
            name="userId"
            value={form.userId}
            onChange={handleChange}
            disabled={!!initialData}
            >
            <option value="">사용자 선택</option>
            {filteredUsers.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.userId} / {user.name} / {user.email}
           </option>
             ))}
           </select>
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
          <input
            type="number"
            name="managerId"
            placeholder="담당직원ID"
            value={form.managerId}
            onChange={handleChange}
          />
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