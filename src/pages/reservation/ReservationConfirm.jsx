import FullCalendar from '@fullcalendar/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import './Reservation.css'
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import jwtAxios from '../../api/jwtAxios';

const ReservationConfirm = () => {
  const [department, setDepartment] = useState([]);
  const [doctor, setDoctor] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDept, setSelectedDept] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [status, setStatus] = useState("RECEIVED");
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const calendarRef = useRef(null);
  const [name, setName] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(3);
  const queryClient = useQueryClient();
  const isRowClickRef = useRef(false);

  /* ================= API ================= */
  useEffect(() => {
    setPage(0);
  }, [debouncedName, selectedDept, status]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(name), 400);
    return () => clearTimeout(t);
  }, [name]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/department')
      .then(res => setDepartment(res.data.content ?? []))
      .catch(console.error);
  }, []);

  // 과, 의사, 선택 행 변화 시 슬롯 초기화
  useEffect(() => {
    setTimeSlots([]);
  }, [selectedDept, selectedDoc]);

  useEffect(() => {
    if (!selectedDept) {
      setDoctor([]);
      return;
    }

    axios.get(`http://localhost:8080/api/doctor?departmentId=${selectedDept}`)
      .then(res => {
        setDoctor(res.data.content ?? []);

        if (isRowClickRef.current) {
          isRowClickRef.current = false; 
          return;
        }

        setSelectedDoc(null);
      })
      .catch(console.error);
  }, [selectedDept]);

  useEffect(() => {
    if (!currentMonth) return;

    let url;
    let params;

    const isNextMonthOrLater =
      dayjs(currentMonth).isAfter(dayjs().endOf('month'));

      console.log("month:", currentMonth, "dept:", selectedDept, "month:", isNextMonthOrLater);

    if (isNextMonthOrLater) {
      url = "http://localhost:8080/api/slot/department";
      params = { monthly: currentMonth, departmentId: selectedDept };
    } else {
      url = selectedDoc
        ? "http://localhost:8080/api/slot/doctor"
        : "http://localhost:8080/api/slot/department";
      params = selectedDoc
        ? { monthly: currentMonth, doctorId: selectedDoc }
        : { monthly: currentMonth, departmentId: selectedDept };
    }

    axios.get(url, {params})
      .then(res => {
        const data = res.data.content ?? [];

          const slotEvents = data.map(slot => ({
            title: slot.available ? `가능 (${slot.totalCapacity}명)` : '불가',
            start: slot.date,
            color: slot.available ? "#69a56b" : "#ccc", // 초록/회색으로 구분
            allDay: true // 일 단위 표시
          }))
          setEvents(slotEvents);
      })
      .catch(console.error);
  }, [selectedDoc, currentMonth, selectedDept]);

  /* ================= 핸들러 ================= */
  const fetchReservationList = ({ status, dept, name, page }) => {
    let url = "http://localhost:8080/api/reservation";

    if (status === "PENDING") url += "/pending";
    if (status === "CONFIRMED") url += "/confirmed";

    return axios.get(url, {
      params: {
        department: dept || undefined,
        name: name,
        page: page,
        size: size
      }
    }).then(res => res.data);
  };

  const { data } = useQuery({
    queryKey: ['reservationList', status, selectedDept, debouncedName, page],
    queryFn: () => fetchReservationList({
      status,
      dept: selectedDept,
      name: debouncedName,
      page
    }),
    placeholderData: (prev) => prev,
  });

  const list = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    const dailyIso = info.dateStr + "T00:00:00";
    const isNextMonthOrLater = dayjs(info.dateStr).isAfter(dayjs().endOf('month'));

    const url = isNextMonthOrLater
    ? `http://localhost:8080/api/slot/daily/department`  // 다음 달 이상 → 과 전체
    : selectedDoc
    ? `http://localhost:8080/api/slot/daily/doctor`
    : `http://localhost:8080/api/slot/daily/department`;

    const params = isNextMonthOrLater
    ? { daily: dailyIso, departmentId: selectedDept }
    : selectedDoc
    ? { daily: dailyIso, doctorId: selectedDoc }
    : { daily: dailyIso, departmentId: selectedDept };

    axios.get(url, { params })
    .then(res => {
      const data = res.data.content ?? [];
      const slotsByHour = [];
        for (let h = 9; h <= 17; h++) {
          const slot = data.find(s => new Date(s.startTime).getHours() === h);
          slotsByHour.push({
            hour: h,
            capacity: slot ? slot.capacity : 3,  
            available: slot ? slot.available : true
          });
        }

        setTimeSlots(slotsByHour);
      })
    .catch(console.error);
  };

  const handleDatesSet = (info) => {
    const d = info.view.currentStart;
    const realMonth = dayjs(d);

    const formatted = realMonth.format('YYYY-MM-01T00:00:00');

    setCurrentMonth(prev => prev === formatted ? prev : formatted);

    if (dayjs(formatted).isAfter(dayjs().endOf('month'))) {
      setSelectedDoc(null);
    }
  };

    const handleEventClick = (info) => {
      const dateStr = dayjs(info.event.start).format('YYYY-MM-DD');
        setSelectedDate(dateStr);

        const dailyIso = dateStr + "T00:00:00";

        const url = selectedDoc
          ? `http://localhost:8080/api/slot/daily/doctor`
          : `http://localhost:8080/api/slot/daily/department`;

        const params = selectedDoc
          ? { daily: dailyIso, doctorId: selectedDoc }
          : { daily: dailyIso, departmentId: selectedDept };

        axios.get(url, { params })
          .then(res => {
            const data = res.data.content ?? [];
            const slotsByHour = [];
            for (let h = 9; h <= 17; h++) {
              const slot = data.find(s => new Date(s.startTime).getHours() === h);
              slotsByHour.push({
                hour: h,
                capacity: slot ? slot.capacity : 3,
                available: slot ? slot.available : true
              });
            }
            setTimeSlots(slotsByHour);
          })
          .catch(console.error);
    };

    const handleRowClick = (item) => {
      const docId = item.doctorId ?? null;

       isRowClickRef.current = true;

      setSelectedDept(item.departmentId);
      setSelectedDoc(docId);
      setSelectedRow(item.reservationId); 

      const date = getDate(item)
        ? dayjs(getDate(item)).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');
      setSelectedDate(date); // 날짜 상태 업데이트
      setTimeSlots([]); // 슬롯 초기화

      if (calendarRef.current) {
        calendarRef.current.getApi().gotoDate(date);
      }

      const dailyIso = date + "T00:00:00";
      const url = docId
        ? `http://localhost:8080/api/slot/daily/doctor`
        : `http://localhost:8080/api/slot/daily/department`;
      const params = docId
        ? { daily: dailyIso, doctorId: docId }
        : { daily: dailyIso, departmentId: item.departmentId };

      axios.get(url, { params })
        .then(res => {
          const data = res.data.content ?? [];
          const slotsByHour = [];
          for (let h = 9; h <= 17; h++) {
            if (h === 13) continue;
            const slot = data.find(s => new Date(s.startTime).getHours() === h);
            slotsByHour.push({
              hour: h,
              capacity: slot ? slot.capacity : 3,
              available: slot ? slot.available : true
            });
          }
          setTimeSlots(slotsByHour);
        })
        .catch(console.error);
    };

    const handleSlotClick = (hour) => {
      if (!selectedRow) return alert("예약할 행을 선택하세요!");

      const isNextMonthOrLater = dayjs(currentMonth).isAfter(dayjs().endOf('month'));

      if (!isNextMonthOrLater && !selectedDoc) {
        return alert("이번 달 예약은 의사를 선택해야 합니다.");
      }

      const dateTime = `${selectedDate}T${hour}:00`;

      const payload = {
        reservationId: selectedRow,
        reservationDate: dateTime,
        doctorId: selectedDoc || null,
        departmentId: selectedDept
      };

      const request =
        status === "CONFIRMED"
          ? axios.put('http://localhost:8080/api/reservation', payload)
          : axios.post('http://localhost:8080/api/reservation/confirm', payload);

      request
        .then(() => {
          alert(status === "CONFIRMED" ? "예약 수정 완료!" : "예약 완료!");
          setSelectedRow(null);

          refreshSlots(); 
          queryClient.invalidateQueries({
            queryKey: ['reservationList']
          });
          refreshCalendar();
        })
        .catch(console.error);
    };

    const refreshList = () => {
      let url = "http://localhost:8080/api/reservation";

      if (status === "PENDING") url += "/pending";
      if (status === "CONFIRMED") url += "/confirmed";

      axios.get(url, {
        params: selectedDept ? { department: selectedDept } : {}
      })
        .then(res => setList(res.data.content ?? []))
        .catch(console.error);
    };

    const refreshCalendar = () => {
      if (!currentMonth) return;

      let url;
      let params;

      const isNextMonthOrLater =
        dayjs(currentMonth).isAfter(dayjs().endOf('month'));

      if (isNextMonthOrLater) {
        url = "http://localhost:8080/api/slot/department";
        params = { monthly: currentMonth, departmentId: selectedDept };
      } else {
        url = selectedDoc
          ? "http://localhost:8080/api/slot/doctor"
          : "http://localhost:8080/api/slot/department";

        params = selectedDoc
          ? { monthly: currentMonth, doctorId: selectedDoc }
          : { monthly: currentMonth, departmentId: selectedDept };
      }

      axios.get(url, { params })
        .then(res => {
          const data = res.data.content ?? [];

          const slotEvents = data.map(slot => ({
            title: slot.available ? `가능 (${slot.totalCapacity}명)` : '불가',
            start: slot.date,
            color: slot.available ? "#69a56b" : "#ccc",
            allDay: true
          }));

          setEvents(slotEvents);
        })
        .catch(console.error);
    };

    const refreshSlots = () => {
      const dailyIso = selectedDate + "T00:00:00";

      const url = selectedDoc
        ? `http://localhost:8080/api/slot/daily/doctor`
        : `http://localhost:8080/api/slot/daily/department`;

      const params = selectedDoc
        ? { daily: dailyIso, doctorId: selectedDoc }
        : { daily: dailyIso, departmentId: selectedDept };

      axios.get(url, { params })
        .then(res => {
          const data = res.data.content ?? [];
          const slotsByHour = [];

          for (let h = 9; h <= 17; h++) {
            if (h === 13) continue;

            const slot = data.find(s => new Date(s.startTime).getHours() === h);

            slotsByHour.push({
              hour: h,
              capacity: slot ? slot.capacity : 3,
              available: slot ? slot.available : true
            });
          }

          setTimeSlots(slotsByHour);
        })
        .catch(console.error);
    };

  const handleCancel=(reservationId)=>{
    axios.get(`http://localhost:8080/api/reservation/delete?reservationId=${reservationId}`)
    .then(res => {
      alert("예약 취소 완료")
      setSelectedRow(null);
        setTimeSlots([]);

        // 2. 리스트 다시 가져오기
        let url = "http://localhost:8080/api/reservation";
        if (status === "PENDING") url += "/pending";
        if (status === "CONFIRMED") url += "/confirmed";

        axios.get(url, {
          params: selectedDept ? { department: selectedDept } : {}
        })
        .then(res => setList(res.data.content ?? []))
        .catch(console.error);
    })
    .catch(console.error);
  }

  const getDate = (item) => {
    if (status === "RECEIVED") return item.preferredDate;
    return item.reservationDate;
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

      {dayjs(currentMonth).isSame(dayjs(), 'month') && (
        <div style={doctorBox}>
          {/* 전체 보기 옵션 */}
          <label style={radioLabel}>
            <input
              type="radio"
              checked={selectedDoc === null}
              onChange={() => {
                setSelectedDoc(null)
              }}
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
      )}
      </div>

      {/* 메인 */}
      <div style={main}>

        {/* 예약 테이블 */}
        <div style={card}>
          <h3>예약 목록</h3>
          이름 검색 <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        <br />

          {list.length === 0 ? (
            <p>데이터 없음</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>진료과</th>
                  <th style={th}>{status === "CONFIRMED" ? "예약 의사" : "희망 의사"}</th>
                  <th style={th}>{status === "RECEIVED" ? "희망 날짜" : "예약 날짜"}</th>
                  <th style={th}>증상</th>
                  <th style={th}>취소</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.reservationId}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedRow === item.reservationId ? '#d0f0fd' : 'transparent'
                     }}
                    onClick={() => handleRowClick(item)}
                  >
                    <td style={td}>{item.departmentName}</td>
                    <td style={td}>{item.doctorName || '없음'}</td>
                    <td style={td}>{getDate(item)}</td>
                    <td style={td}>{item.symptom}</td>
                    <td style={td}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(item.reservationId);
                        }}
                      >
                        취소
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ marginTop: '10px' }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                이전
              </button>

              <span style={{ margin: '0 10px' }}>
                {page + 1} / {totalPages}
              </span>

              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                다음
              </button>
            </div>
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
            fixedWeekCount={false}
            ref={calendarRef}
            validRange={{
              start: dayjs().format('YYYY-MM-DD') // 오늘 이후만 선택 가능
            }}
            height="100%"
            dayCellClassNames={(info) => {
              const dateStr = dayjs(info.date).format('YYYY-MM-DD');
              return selectedDate === dateStr ? ['selected-day'] : [];
              }}
          />
        </div>

        {/* 시간 슬롯 */}
        <div style={slotGrid}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            {selectedDate ? `선택된 날짜: ${selectedDate}` : '날짜를 선택하세요'}
          </div>
          {/* 오전 슬롯 */}
          <div style={{gridColumn: '1 / -1', fontWeight: 'bold', marginBottom: '5px'}}>오전</div>
          {timeSlots
            .filter(slot => slot.hour < 13) // 12시 전 (오전)
            .map(slot => {
              const disabled = !slot.available || slot.capacity === 0;
              return (
              <button
                key={`${slot.hour}-${slot.capacity}-${slot.available}`}
                onClick={() => handleSlotClick(`${String(slot.hour).padStart(2,'0')}:00`)}
                style={{
                  ...slotBtn,
                  backgroundColor: disabled ? "#ccc" : "#69a56b",
                  color: disabled ? "#666" : "#fff",
                  cursor: disabled ? "not-allowed" : "pointer"
                }}
              >
                {`${String(slot.hour).padStart(2,'0')}:00 (${slot.capacity}명)`}
              </button>
            );
          })}

          {/* 점심 시간 표시 */}
          <div style={{gridColumn: '1 / -1', textAlign: 'center', margin: '5px 0', color: '#888'}}>
            점심시간
          </div>

          {/* 오후 슬롯 */}
          <div style={{gridColumn: '1 / -1', fontWeight: 'bold', marginBottom: '5px'}}>오후</div>
          {timeSlots
            .filter(slot => slot.hour > 13) // 12시 이후 (오후)
            .map(slot => {
              const disabled = !slot.available || slot.capacity === 0;
              return (
              <button
                key={slot.hour}
                onClick={() => handleSlotClick(`${String(slot.hour).padStart(2,'0')}:00`)}
                style={{
                  ...slotBtn,
                  backgroundColor: disabled ? "#ccc" : "#69a56b",
                  color: disabled ? "#666" : "#fff",
                  cursor: disabled ? "not-allowed" : "pointer"
                }}
              >
                {`${String(slot.hour).padStart(2,'0')}:00 (${slot.capacity}명)`}
              </button>
              )}
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
  gap: '10px',
  width: '300px'
};

const slotBtn = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  cursor: 'pointer',
  minWidth: '100px',
  minHeight: '40px'
};