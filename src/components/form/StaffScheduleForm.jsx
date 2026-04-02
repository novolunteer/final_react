import React, { useMemo, useState } from 'react'

const StaffScheduleForm = ({
    formData,
    setFormData,
    onSubmit,
    onClose,
    departmentList,
    staffList,
    scheduleTypeList,
}) => {
    const [staffKeyword, setStaffKeyword] = useState("");

    const filteredStaffList = useMemo(()=>{
        return staffList.filter((staff)=>{
            const matchKeyword = (staff.name || "").includes(staffKeyword);
            const matchDepartment = formData.departmentId? String(staff.departmentId)== String (formData.departmentId) : true;

            return matchKeyword && matchDepartment;
        });
    },[staffList, staffKeyword, formData.departmentId]);

    const handleChange=(e)=>{
        const {name,value} = e.target;
        setFormData((prev)=>({
            ...prev,
            [name]:value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!formData.departmentId){
            alert("부서를 선택해주세요");
            return;
        }

        if(!formData.staffId){
            alert("직원을 선택해주세요");
            return;
        }

        if(!formData.workDate){
            alert("날짜를 선택해주세요");
            return;
        }
        if(!formData.scheduleTypeId){
            alert("근무유형을 선택해주세요");
            return;
        }
        onSubmit(formData);
    };
    


  return (
    <form onSubmit={handleSubmit}>
        <h3>직원 스케줄 등록</h3>

        <div style={styles.formGrid}>
            <div>
                <label>부서</label>
                <select
                name='departmentId'
                placeholder='부서명를 선택하세요'
                value={formData.departmentId || ""}
                onChange={handleChange}
                >
                    <option value="">부서선택</option>
                    {departmentList.map((dept)=>(
                        <option key={dept.departmentId} value={dept.departmentId}>
                            {dept.departmentName}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>직원검색</label>
                <input
                type='text'
                value={staffKeyword}
                onChange={(e)=> setStaffKeyword(e.target.value)}
                placeholder='직원명 검색'
                />
            </div>

            <div>
                <label>직원</label>
                <select
                name='staffId'
                value={formData.staffId ||""}
                onChange={handleChange}
                >
                    <option value="">직원선택</option>
                    {filteredStaffList.map((staff)=> (
                        <option key={staff.staffId} value={staff.staffId}>
                            {staff.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>날짜</label>
                <input
                type='date'
                name='workDate'
                value={formData.workDate ||""}
                onChange={handleChange}
                />
            </div>

            <div>
                <label>근무유형</label>
                <select
                name='scheduleTypeId'
                value={formData.scheduleTypeId || ""}
                onChange={handleChange}
                >
                    <option value="">근무유형 선택</option>
                    {scheduleTypeList.map((type)=>(
                        <option
                        key={type.scheduleTypeId}
                        value={type.scheduleTypeId}
                        >{type.typeName}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>상태</label>
                <select
                name='status'
                value={formData.status ||""}
                onChange={handleChange}
                >
                    <option value="TEMP">임시</option>
                    <option value="CONFIRMED">확정</option>
                </select>
            </div>

            <div style={styles.buttonBox}>
                <button type="submit">등록</button>
                <button type="button" onClick={onClose}>
                취소
                </button>
            </div>
        </div>
    </form>
  )
}

export default StaffScheduleForm

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