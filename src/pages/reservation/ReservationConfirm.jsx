import FullCalendar from '@fullcalendar/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const ReservationConfirm = () => {
  const [list, setList] = useState([]);
  const [department, setDepartment] = useState([]);
  const [doctor, setDoctor] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // 날짜 클릭시
  const [timeSlots, setTimeSlots] = useState([]); // 9~18시 버튼

  useEffect(() => {
    axios.get('http://localhost:8080/api/department').then(res => {
      setDepartment(res.data.content);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedDept) {
      setDoctor([]);
      setSelectedDocs([]);
      return;
    }
    axios.get(`http://localhost:8080/api/doctor?departmentId=${selectedDept}`)
      .then(res => setDoctor(res.data.content))
      .catch(err => console.error(err));
  }, [selectedDept]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/reservation')
      .then(res => setList(res.data.content))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedDocs.length === 0) {
      setEvents([]);
      return;
    }

    Promise.all(
      selectedDocs.map(doctorId =>
        axios.get(`http://localhost:8080/api/reservation/schedule?doctorId=${doctorId}`)
      )
    )
      .then(responses => {
        const allEvents = responses.flatMap(res =>
          res.data.content.map(item => ({
            title: item.doctorName,
            start: item.startTime,
            end: item.endTime,
          }))
        );
        setEvents(allEvents);
      })
      .catch(err => console.error(err));
  }, [selectedDocs]);

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    setTimeSlots(slots);
  };

  const handleSlotClick = (time) => {
    console.log('선택한 날짜+시간:', selectedDate, time);
  };

  const ReceivedReservation=()=>{
    axios.get('http://localhost:8080/api/reservation')
      .then(res => setList(res.data.content))
      .catch(err => console.error(err));
  }

  const PendingReservation=()=>{
    axios.get('http://localhost:8080/api/reservation/pending')
      .then(res => setList(res.data.content))
      .catch(err => console.error(err));
  }

  const ConfirmedReservation=()=>{
    axios.get('http://localhost:8080/api/reservation/confirmed')
      .then(res => setList(res.data.content))
      .catch(err => console.error(err));
  }

  return (
  <div>
    <button onClick={ReceivedReservation}>신청된 예약</button>
    <button onClick={PendingReservation}>가예약</button>
    <button onClick={ConfirmedReservation}>확정된 예약</button>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <form>
          <label>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="">선택하세요</option>
              {department.map((dep) => (
                <option key={dep.departmentId} value={dep.departmentId}>
                  {dep.departmentName}
                </option>
              ))}
            </select>
          </label>

          {doctor.map((doc) => (
            <label key={doc.staffId} style={{ display: 'block', marginTop: '5px' }}>
              <input
                type="checkbox"
                checked={selectedDocs.includes(doc.staffId)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedDocs((prev) => [...prev, doc.staffId]);
                  else setSelectedDocs((prev) => prev.filter((id) => id !== doc.staffId));
                }}
              />
              {doc.name}
            </label>
          ))}
        </form>

    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
      <div>
      {!list || list.length === 0 ? (
        <p>예약 정보가 없습니다.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>진료과</th>
              <th>희망 의사</th>
              <th>희망 날짜</th>
              <th>증상</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.reservationId}>
                <td>{item.departmentName}</td>
                <td>{item.doctorName || '없음'}</td>
                <td>{item.preferredDate}</td>
                <td>{item.symptom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
     </div>

      <div style={{ flex: 2, minWidth: '400px', height: '600px' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          height="100%"
        />
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        {selectedDate && (
          <div>
            <h2>{selectedDate} 예약 가능 시간</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {timeSlots.map((time) => (
                <button key={time} onClick={() => handleSlotClick(time)}>
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  </div>
  );
};

export default ReservationConfirm;