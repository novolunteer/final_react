import React, { useEffect, useMemo, useState } from 'react'
import RegisterButton from '../../../components/common/RegisterButton'
import SearchBar from '../../../components/common/SearchBar';
import CommonTable from '../../../components/common/CommonTable';
import CommonModal from '../../../components/common/CommonModal';
import StaffScheduleForm from '../../../components/form/StaffScheduleForm';
import BulkScheduleForm from "../../../components/form/BulkScheduleForm";
import { bulkConfirmSchedule, bulkRegisterSchedule, confirmSchedule, deleteSchedule, getScheduleList, registerSchedule, updateSchedule } from '../../../api/hr/staffScheduleApi';
import { getStaffList } from '../../../api/hr/staffApi';
import { getDepartmentList } from "../../../api/hr/departmentApi";
import { getSchedulePolicyList } from "../../../api/hr/schedulePolicyApi";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from "@fullcalendar/daygrid";

const initialForm={
    scheduleId:"",
    departmentId:"",
    staffId:"",
    workDate:"",
    scheduleTypeId:"",
    status:"TEMP",
};

const initialBulkForm={
    departmentId:"",
    staffIds: [],
    startDate:"",
    endDate:"",
    scheduleTypeId:"",
    status:"TEMP"
}

const StaffSchedulePage = () => {

    const [scheduleList, setScheduleList]=useState([]);
    const [departmentList, setDepartmentList]=useState([]);
    const [staffList, setStaffList]=useState([]);
    const [scheduleTypeList, setScheduleTypeList]=useState([]);

    const [searchKeyword, setSearchKeyword]=useState("");
    const [open,setOpen]=useState(false);
    const [formData, setFormData]=useState(initialForm);
    const [isEdit, setIsEdit]=useState(false);
    const [selectedIds, setSelectedIds]=useState([]);

    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkFormData, setBulkFormData] = useState(initialBulkForm);
    const [selectedDate, setSelectedDate] = useState("");

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
                getSchedulePolicyList(),
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
        let result = scheduleList;

        if(searchKeyword.trim()){
        result = result.filter((item)=>
        (item.staffName || "").includes(searchKeyword.trim())
        );
    }

    if(selectedDate){
        result = result.filter((item)=> item.workDate == selectedDate);
    }
    return result;
    }, [scheduleList, searchKeyword, selectedDate]);

    const columns = [
    { key: "select", title:(
        <input
        type='checkbox'
        checked={
            filteredScheduleList.filter((item)=> item.status == "TEMP").length > 0 &&
            filteredScheduleList.filter((item)=> item.status == "TEMP").every((item)=> selectedIds.includes(item.scheduleId))
        }
        onChange={(e) => handleCheckAll(e.target.checked)}/>
    )},
    { key:"workDate", title:"날짜"},
    { key:"staffName", title:"직원명"},
    { key:"departmentName", title:"부서명"},
    { key:"typeName", title:"근무유형"},
    { key:"status", title:"상태"},
    { key:"action", title:"관리"},
];

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
            workDate: row.workDate || "",
            scheduleTypeId: row.scheduleTypeId || "",
            status: row.status || "TEMP",
        });
        setOpen(true);
    };

    const handleConfirm = async(scheduleId)=>{
        try{
            await confirmSchedule(scheduleId);
            alert("확정완료");
            fetchScheduleData();
        }catch (e) {
            console.error(e);
        }
    };

    const tableData = filteredScheduleList.map((item)=>({
        ...item,
        select:(
            item.status == "TEMP" ? (
                <input
                type='checkbox'
                checked={selectedIds.includes(item.scheduleId)}
                onChange={()=> handleCheck(item.scheduleId)}/>
            ) : null
        ),
        action:(
            <div style={{display:"flex", gap:"6px"}}>
                <button type='button' onClick={()=>handleEdit(item)}>수정</button>
                <button type='button' onClick={()=>handleDelete(item)}>삭제</button>
                {item.status =="TEMP" && (
                    <button type='button' onClick={()=>handleConfirm(item.scheduleId)}>확정</button>
                )}
            </div>
        ),
    }));

    const handleBulkConfirm = async()=>{
        if (selectedIds.length==0){
            alert("선택된 스케줄이 없습니다");
            return;
        }
        const confirmBulk = window.confirm("선택한 스케줄을 확정하시겠습니까?");
        if(!confirmBulk) return;

        try{
            await bulkConfirmSchedule(selectedIds);
            alert("스케줄 확정 완료");
            setSelectedIds([]);
            fetchScheduleData();
        }catch (error){
            console.error("스케줄 확정 실패", error);
            alert("스케줄 확정 중 오류가 발생했습니다");
        };
    };


    const events= scheduleList.map((item) => ({
        title: `${item.staffName || ""} ${item.typeName || ""}`,
        date: item.workDate,
    }));

    const handleCheck = (scheduleId)=>{
        setSelectedIds((prev)=>
        prev.includes(scheduleId)
        ? prev.filter((id)=> id != scheduleId)
        : [...prev, scheduleId]
        );
    };

    const handleCheckAll = (checked) =>{
        if(checked){
            const tempIds = filteredScheduleList
            .filter((item)=> item.status == "TEMP")
            .map((item)=> item.scheduleId);

        setSelectedIds(tempIds);
        }else {
            setSelectedIds([]);
        }
    };

    const handleBulkSubmit = async (formData)=>{
        try{
           const result= await bulkRegisterSchedule(formData);

            if(result.skippedList && result.skippedList.length >0){
                alert(
                    `${result.message}\n\n`+result.skippedList.map(item => `${item.staffName} / ${item.workDate} / ${item.reason}`)
                    .join("\n")
                );
            }else{
                alert(result.message);
            }
                
            fetchScheduleData();
            setBulkOpen(false);
        }catch (error){
            console.error("스케줄 일괄등록 실패", error);
            alert("스케줄 등록이 완료되지 않았습니다");
        }
    }
         
    const handleBulkOpen = () => {
        setBulkFormData(initialBulkForm);
        setBulkOpen(true);
    };

    const handleBulkClose = () => {
        setBulkFormData(initialBulkForm);
        setBulkOpen(false);
    }
  return (
    <div style={styles.container}>
        <div style={styles.header}>
            <h2>직원 스케줄 관리</h2>
            <RegisterButton onClick={handleOpen}>개별등록</RegisterButton>
            <button onClick={handleBulkOpen}>일괄등록</button>
            <button onClick={handleOpen}>자동등록</button>
            <button onClick={handleOpen}>자동화 조건 등록</button>
            <button onClick={handleBulkConfirm}>선택확정</button>
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
        </div>
        <div style={styles.content}>

            <div style={styles.calendar}>
                <FullCalendar
                plugins={[dayGridPlugin]}
                initialView='dayGridMonth'
                events={events}
                dateClick={(info)=>{
                    selectedDate(info.dateStr);
                }}
                />
            </div>

            <div style={styles.list}>
                <CommonTable columns={columns} data={tableData}/>
            </div>
            
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

            <CommonModal open={bulkOpen} onClose={handleBulkClose}>
                <BulkScheduleForm
                formData={bulkFormData}
                setFormData={setBulkFormData}
                onSubmit={handleBulkSubmit}
                onClose={handleBulkClose}
                departmentList={departmentList}
                staffList={staffList}
                scheduleTypeList={scheduleTypeList}
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
    content: {
    display: "flex",
    gap: "20px",
  },

  calendar: {
    flex: 1,
    background: "#fff",
    padding: "10px",
    borderRadius: "8px",
  },

  list: {
    flex: 1,
  },
};