import FullCalendar from '@fullcalendar/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';

const ReservationConfirm = () => {
  const [list, setList] = useState([]);
  const [department, setDepartment] = useState([]);
  const [doctor, setDoctor] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDept, setSelectedDept] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [status, setStatus] = useState("RECEIVED");
  const [currentMonth, setCurrentMonth] = useState(null);

  /* ================= API ================= */

  useEffect(() => {
    axios.get('http://localhost:8080/api/department')
      .then(res => setDepartment(res.data.content ?? []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDept) {
      setDoctor([]);
      setSelectedDoc(null);
      return;
    }

    axios.get(`http://localhost:8080/api/doctor?departmentId=${selectedDept}`)
      .then(res => {
        setDoctor(res.data.content ?? []);
        setSelectedDoc(null);
      })
      .catch(console.error);
  }, [selectedDept]);

  useEffect(() => {
    let url = "http://localhost:8080/api/reservation";

    if (status === "PENDING") url += "/pending";
    if (status === "CONFIRMED") url += "/confirmed";

    axios.get(url, {
      params: selectedDept ? { department: selectedDept } : {}
    })
      .then(res => setList(res.data.content ?? []))
      .catch(console.error);
  }, [status, selectedDept]);

  useEffect(() => {
    if (!currentMonth || !currentMonth) return;

    const url = selectedDoc
    ? "http://localhost:8080/api/slot/doctor"      // 의사별
    : "http://localhost:8080/api/slot/department"; // 과 전체

    const params = selectedDoc
      ? { monthly: currentMonth, doctorId: selectedDoc }
      : { monthly: currentMonth, departmentId: selectedDept };

    axios.get(url, {params})
      .then(res => {
        const data = res.data.content ?? [];

        setEvents(
          data.map(slot => ({
            title: slot.available ? `가능 (${slot.totalCapacity}명)` : '불가',
            start: slot.date,
            color: slot.available ? "#69a56b" : "#ccc", // 초록/회색으로 구분
            allDay: true // 일 단위 표시
          }))
        );
      })
      .catch(console.error);
  }, [selectedDoc, currentMonth, selectedDept]);

  /* ================= 핸들러 ================= */

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);

    const slots = [];
    for (let h = 9; h <= 18; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    setTimeSlots(slots);
  };

  const handleDatesSet = (info) => {
    const d = info.view.currentStart;

    const formatted =
      d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, '0') + "-01T00:00:00";

    setCurrentMonth(prev => prev === formatted ? prev : formatted);
  };

  const handleSlotClick = (time) => {
    console.log("선택:", selectedDate, time);
  };

  const handleEventClick = (info) => {
    const dateStr = info.event.startStr;

    setSelectedDate(dateStr);

    const slots = [];
    for (let h = 9; h <= 18; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    setTimeSlots(slots);
  };

  /* ================= UI ================= */

  return (
    <div style={container}>

      {/* 상태 버튼 */}
      <div style={statusBar}>
        <button onClick={() => setStatus("RECEIVED")} style={btn}>신청</button>
        <button onClick={() => setStatus("PENDING")} style={btn}>가예약</button>
        <button onClick={() => setStatus("CONFIRMED")} style={btn}>확정</button>
      </div>

      {/* 필터 */}
      <div style={filterBox}>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={select}
        >
          <option value="">진료과 선택</option>
          {department.map(dep => (
            <option key={dep.departmentId} value={dep.departmentId}>
              {dep.departmentName}
            </option>
          ))}
        </select>

        <div style={doctorBox}>
          {/* 전체 보기 옵션 */}
          <label style={radioLabel}>
            <input
              type="radio"
              checked={selectedDoc === null}
              onChange={() => setSelectedDoc(null)}
            />
            전체
          </label>

          {doctor.map(doc => (
            <label key={doc.staffId} style={radioLabel}>
              <input
                type="radio"
                checked={selectedDoc === doc.staffId}
                onChange={() => setSelectedDoc(doc.staffId)}
              />
              {doc.name}
            </label>
          ))}
        </div>
      </div>

      {/* 메인 */}
      <div style={main}>

        {/* 예약 테이블 */}
        <div style={card}>
          <h3>예약 목록</h3>

          {list.length === 0 ? (
            <p>데이터 없음</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>진료과</th>
                  <th style={th}>의사</th>
                  <th style={th}>날짜</th>
                  <th style={th}>증상</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.reservationId}>
                    <td style={td}>{item.departmentName}</td>
                    <td style={td}>{item.doctorName || '없음'}</td>
                    <td style={td}>{item.preferredDate}</td>
                    <td style={td}>{item.symptom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 캘린더 */}
        <div style={calendarBox}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            eventClick={handleEventClick} 
            validRange={{
              start: dayjs().format('YYYY-MM-DD') // 오늘 이후만 선택 가능
            }}
            height="100%"
          />
        </div>

        {/* 시간 슬롯 */}
        <div style={card}>
          <h3>시간 선택</h3>

          {selectedDate ? (
            <>
              <p>{selectedDate}</p>
              <div style={slotGrid}>
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => handleSlotClick(time)}
                    style={slotBtn}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>날짜 선택</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReservationConfirm;

/* ================= 스타일 ================= */

const container = {
  padding: '20px',
  fontFamily: 'sans-serif'
};

const statusBar = {
  marginBottom: '15px'
};

const btn = {
  marginRight: '10px',
  padding: '6px 12px',
  cursor: 'pointer'
};

const filterBox = {
  marginBottom: '20px'
};

const select = {
  padding: '6px',
  marginBottom: '10px'
};

const doctorBox = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

const radioLabel = {
  display: 'flex',
  gap: '5px'
};

const main = {
  display: 'flex',
  gap: '20px'
};

const card = {
  flex: 1,
  border: '1px solid #ddd',
  borderRadius: '10px',
  padding: '15px',
  background: '#fafafa'
};

const calendarBox = {
  flex: 2,
  border: '1px solid #ddd',
  borderRadius: '10px',
  padding: '10px',
  background: '#fff',
  height: '600px'
};

const table = {
  width: '100%',
  borderCollapse: 'collapse'
};

const th = {
  border: '1px solid #ddd',
  padding: '8px',
  background: '#eee'
};

const td = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center'
};

const slotGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px'
};

const slotBtn = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  cursor: 'pointer'
};