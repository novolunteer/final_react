import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './Reservation.css';

const fetchDepartments = () =>
  axios.get('http://localhost:8080/api/department').then(res => res.data.content ?? []);

const fetchDoctors = (departmentId) =>
  departmentId
    ? axios.get(`http://localhost:8080/api/doctor?departmentId=${departmentId}`).then(res => res.data.content ?? [])
    : Promise.resolve([]);

const fetchReservations = ({ status, departmentId }) => {
  let url = 'http://localhost:8080/api/reservation';
  if (status === 'PENDING') url += '/pending';
  if (status === 'CONFIRMED') url += '/confirmed';
  return axios
    .get(url, { params: departmentId ? { department: departmentId } : {} })
    .then(res => res.data.content ?? []);
};

const fetchSlots = ({ date, currentMonth, selectedDept, selectedDoc }) => {
  if (!currentMonth) return Promise.resolve([]);
  const isNextMonthOrLater = dayjs(currentMonth).isAfter(dayjs().endOf('month'));
  let url, params;

  if (date) {
    // 일별
    url = selectedDoc
      ? 'http://localhost:8080/api/slot/daily/doctor'
      : 'http://localhost:8080/api/slot/daily/department';
    params = selectedDoc ? { daily: date + 'T00:00:00', doctorId: selectedDoc } : { daily: date + 'T00:00:00', departmentId: selectedDept };
  } else {
    // 월별
    url = isNextMonthOrLater
      ? 'http://localhost:8080/api/slot/department'
      : selectedDoc
      ? 'http://localhost:8080/api/slot/doctor'
      : 'http://localhost:8080/api/slot/department';
    params = selectedDoc
      ? { monthly: currentMonth, doctorId: selectedDoc }
      : { monthly: currentMonth, departmentId: selectedDept };
  }

  return axios.get(url, { params }).then(res => res.data.content ?? []);
};

const ReservationConfirm = () => {
  const queryClient = useQueryClient();
  const calendarRef = useRef(null);

  const [status, setStatus] = useState('RECEIVED');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM-01T00:00:00'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  /* ========== Queries ========== */
  const { data: departments } = useQuery(['departments'], fetchDepartments);
  const { data: doctors } = useQuery(['doctors', selectedDept], () => fetchDoctors(selectedDept));
  const { data: reservations, isLoading: reservationsLoading } = useQuery(
    ['reservations', status, selectedDept],
    () => fetchReservations({ status, departmentId: selectedDept }),
    { keepPreviousData: true }
  );
  const { data: slots } = useQuery(
    ['slots', currentMonth, selectedDept, selectedDoc, selectedDate],
    () => fetchSlots({ currentMonth, selectedDept, selectedDoc, date: selectedDate }),
    { keepPreviousData: true }
  );

  /* ========== Mutations ========== */
  const reserveMutation = useMutation(
    (payload) => {
      const url =
        status === 'CONFIRMED'
          ? 'http://localhost:8080/api/reservation'
          : 'http://localhost:8080/api/reservation/confirm';
      return axios[status === 'CONFIRMED' ? 'put' : 'post'](url, payload);
    },
    {
      onSuccess: () => {
        alert(status === 'CONFIRMED' ? '예약 수정 완료!' : '예약 완료!');
        setSelectedRow(null);
        queryClient.invalidateQueries(['reservations']);
        queryClient.invalidateQueries(['slots']);
      },
    }
  );

  const cancelMutation = useMutation(
    (reservationId) => axios.get(`http://localhost:8080/api/reservation/delete?reservationId=${reservationId}`),
    {
      onSuccess: () => {
        alert('예약 취소 완료!');
        setSelectedRow(null);
        queryClient.invalidateQueries(['reservations']);
        queryClient.invalidateQueries(['slots']);
      },
    }
  );

  /* ========== Handlers ========== */
  const handleSlotClick = (hour) => {
    if (!selectedRow) return alert('예약할 행을 선택하세요!');
    const isNextMonthOrLater = dayjs(currentMonth).isAfter(dayjs().endOf('month'));
    if (!isNextMonthOrLater && !selectedDoc) return alert('이번 달 예약은 의사를 선택해야 합니다.');

    const payload = {
      reservationId: selectedRow,
      reservationDate: `${selectedDate}T${hour}:00`,
      doctorId: selectedDoc || null,
      departmentId: selectedDept,
    };
    reserveMutation.mutate(payload);
  };

  const handleCancel = (reservationId) => {
    cancelMutation.mutate(reservationId);
  };

  const handleRowClick = (item) => {
    setSelectedDept(item.departmentId);
    setSelectedDoc(item.doctorId ?? null);
    setSelectedRow(item.reservationId);

    const date = status === 'RECEIVED' ? item.preferredDate : item.reservationDate;
    setSelectedDate(date ? dayjs(date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));

    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(date);
    }
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
  };

  const handleDatesSet = (info) => {
    const monthStart = dayjs(info.view.currentStart).format('YYYY-MM-01T00:00:00');
    setCurrentMonth(prev => (prev === monthStart ? prev : monthStart));
    if (dayjs(monthStart).isAfter(dayjs().endOf('month'))) setSelectedDoc(null);
  };

  const getDate = (item) => (status === 'RECEIVED' ? item.preferredDate : item.reservationDate);

  /* ========== UI ========== */
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 상태 버튼 */}
      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => setStatus('RECEIVED')} style={{ marginRight: 10 }}>신청</button>
        <button onClick={() => setStatus('PENDING')} style={{ marginRight: 10 }}>가예약</button>
        <button onClick={() => setStatus('CONFIRMED')}>확정</button>
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: 20 }}>
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: 6 }}>
          <option value="">진료과 선택</option>
          {departments?.map(dep => (
            <option key={dep.departmentId} value={dep.departmentId}>{dep.departmentName}</option>
          ))}
        </select>

        {dayjs(currentMonth).isSame(dayjs(), 'month') && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label>
              <input type="radio" checked={selectedDoc === null} onChange={() => setSelectedDoc(null)} /> 전체
            </label>
            {doctors?.map(doc => (
              <label key={doc.staffId}>
                <input type="radio" checked={selectedDoc === doc.staffId} onChange={() => setSelectedDoc(doc.staffId)} /> {doc.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 메인 */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* 예약 테이블 */}
        <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 10, padding: 15, background: '#fafafa' }}>
          <h3>예약 목록</h3>
          {reservationsLoading ? <p>로딩중...</p> : reservations?.length === 0 ? <p>데이터 없음</p> :
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>진료과</th>
                  <th>{status === 'CONFIRMED' ? '예약 의사' : '희망 의사'}</th>
                  <th>{status === 'RECEIVED' ? '희망 날짜' : '예약 날짜'}</th>
                  <th>증상</th>
                  <th>취소</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(item => (
                  <tr
                    key={item.reservationId}
                    style={{ cursor: 'pointer', backgroundColor: selectedRow === item.reservationId ? '#d0f0fd' : 'transparent' }}
                    onClick={() => handleRowClick(item)}
                  >
                    <td>{item.departmentName}</td>
                    <td>{item.doctorName || '없음'}</td>
                    <td>{getDate(item)}</td>
                    <td>{item.symptom}</td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); handleCancel(item.reservationId); }}>취소</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>

        {/* 캘린더 */}
        <div style={{ flex: 2, border: '1px solid #ddd', borderRadius: 10, padding: 10, background: '#fff', height: 600 }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={slots?.map(slot => ({
              title: slot.available ? `가능 (${slot.totalCapacity}명)` : '불가',
              start: slot.date,
              color: slot.available ? '#69a56b' : '#ccc',
              allDay: true
            }))}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            ref={calendarRef}
            fixedWeekCount={false}
            validRange={{ start: dayjs().format('YYYY-MM-DD') }}
            dayCellClassNames={(info) => (selectedDate === dayjs(info.date).format('YYYY-MM-DD') ? ['selected-day'] : [])}
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationConfirm;