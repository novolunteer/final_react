import React from 'react'
import RegisterButton from '../../../components/common/RegisterButton'
import SearchBar from '../../../components/common/SearchBar';
import CommonTable from '../../../components/common/CommonTable';
import CommonModal from '../../../components/common/CommonModal';
import StaffScheduleForm from '../../../components/form/StaffScheduleForm';

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
];
const StaffSchedulePage = () => {
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
            <button type='button' onClick={handelResetSearch}>
                전체보기
            </button>

            <CommonTable columns={columns} data={scheduleList}/>

            <CommonModal open={open} onClose={handleClose}>
                <StaffScheduleForm
                onSubmit={handleSubmit}
                onClose={handleClose}
                initialForm={selectedSchedule}
                />
            </CommonModal>
        </div>

        
    </div>
  )
}

export default StaffSchedulePage