import React, { useEffect, useMemo, useState } from 'react'
import RegisterButton from '../../../components/common/RegisterButton'
import SearchBar from '../../../components/common/SearchBar';
import CommonTable from '../../../components/common/CommonTable';
import CommonModal from '../../../components/common/CommonModal';
import StaffScheduleForm from '../../../components/form/StaffScheduleForm';
import { deleteSchedule, getScheduleList, registerSchedule, updateSchedule } from '../../../api/hr/staffScheduleApi';
import { getStaffList } from '../../../api/hr/staffApi';

const initialForm={
    scheduleId:"",
    departmentId:"",
    staffId:"",
    wordDate:"",
    scheduleTypeId:"",
    status:"TEMP",
};

const columns = [
    { key:"workDate", title:"날짜"},
    { key:"staffName", title:"직원명"},
    { key:"departmentName", title:"부서명"},
    { key:"Typename", title:"근무유형"},
    { key:"status", title:"상태"},
    { key:"action", title:"관리"},
];

const StaffSchedulePage = () => {

    const [scheduleList, setScheduleList]=useState([]);
    const [departmentList, setDepartmentList]=useState([]);
    const [staffList, setStaffList]=useState([]);
    const [scheduleTypeList, setScheduleTypeList]=useState([]);

    const [searchKeyword, setSearchKeyword]=useState("");
    const [open,setOpen]=useState(false);
    const [formData, setFormData]=useState(initialForm);
    const [isEdit, setIsEdit]=useState(false);

    useEffect(()=>{
        fetchInitData();
    },[]);

    const fetchInitData=async()=>{
        try{
            const [scheduleData, departmentData, staffData, scheduleTypeData]=
            await Promise.all([
                getScheduleList(),
                getDepartmentList(),
                getStaffList(),
                getScheduleTypeList(),
            ]);

            setScheduleList(scheduleData || []);
            setDepartmentList(departmentData || []);
            setStaffList(staffData || []);
            setScheduleTypeList(scheduleTypeData || []);
        }catch(error){
            console.error("초기 데이터 로드 실패", error);
            alert("데이터를 불러오는 중 오류가 발생했습니다");
        }
    };

    const fetchScheduleData = async()=>{
        try{
            const data=await getScheduleList();
            setScheduleList(data || []);
        }catch (error){
            console.error("스케줄목록 조회 실패",  error);
        }
    };

    const filteredScheduleList = useMemo(()=>{
        if(!searchKeyword.trim())
            return scheduleList;

        return scheduleList.filter((item)=>
        (item.staffName || "").includes(searchKeyword.trim())
    );
    }, [scheduleList, searchKeyword]);

    const handleOpen = ()=>{
        setIsEdit(false);
        setFormData(initialForm);
        setOpen(true);
    };

    const handleClose = () =>{
        setOpen(false);
        setFormData(initialForm);
        setIsEdit(false);
    };

    const handleSearch = () =>{

    }

    const handleResetSearch = () => {
        setSearchKeyword("");
    };

    const hasDuplicateSchedule = (target) => {
        return scheduleList.some(
            (item)=>
                String(item.staffId)==String(target.staffId)&&
            item.workDate == target.workDate &&
            String(item.scheduleId) != String(target.scheduleId || "") 
        );
    };

    const handleSubmit = async(submitData) => {
        try{
            if(hasDuplicateSchedule(submitData)){
                alert("같은 직원의 같은 날짜 스케줄이 이미 등록되어 있습니다");
                return;
            }
            if(isEdit){
                await updateSchedule(submitData.scheduleId, submitData);
                alert("수정완료");
            }else{
                await registerSchedule(submitData);
                alert("등록완료");
            }
            handleClose();
            fetchScheduleData();
        }catch (error){
            console.error("저장실패", error);
            alert("저장 중 오류가 발생했습니다");
        }
    };

    const handleDelete = async(row) => {
        const confirmDelete = window.confirm("삭제하시겠습니까?");
        if(!confirmDelete) return;

        try{
            await deleteSchedule(row.scheduleId);
            alert("삭제완료");
            fetchScheduleData();
        }catch(error){
            console.error("삭제실패",error);
            alert("삭제 중 오류가 발생했습니다");
        }
    };

    const handleEdit = (row) => {
        setIsEdit(true);
        setFormData({
            scheduleId:row.scheduleId,
            departmentId: row.departmentId || "",
            staffId: row.staffId || "",
            workDate: row.wordDate || "",
            scheduleTypeId: row.scheduleTypeId || "",
            status: row.status || "TEMP",
            action:(
                <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button" onClick={() => handleEdit(item)}>
                    수정
                    </button>
                    <button type="button" onClick={() => handleDelete(item)}>
                    삭제
                    </button>
                </div>
            )
        });
        setOpen(true);
    };


  return (
    <div style={styles.container}>
        <div style={styles.header}>
            <h2>직원 스케줄 관리</h2>
            <RegisterButton onClick={handleOpen}>개별등록</RegisterButton>
            <button onClick={handleOpen}>일괄등록</button>
            <button onClick={handleOpen}>자동등록</button>
            <button onClick={handleOpen}>자동화 조건 등록</button>
        </div>

        <div style={styles.topBar}>
            <SearchBar
            value={searchKeyword}
            onChange={(e)=> setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            placeholder="직원의 이름을 입력하세요"
            />
            <button type='button' onClick={handleResetSearch}>
                전체보기
            </button>

            <CommonTable columns={columns} data={scheduleList}/>

            <CommonModal open={open} onClose={handleClose}>
                <StaffScheduleForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onClose={handleClose}
                departmentList={departmentList}
                staffList={staffList}
                scheduleTypeList={scheduleTypeList}
                isEdit={isEdit}
                />
            </CommonModal>
        </div>

        
    </div>
  )
}

export default StaffSchedulePage

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