import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'
import axios from 'axios';
import React, { useEffect, useState } from 'react'

const ReservationConfirm = () => {
  const [list, setList] = useState([]);

  useEffect(()=>{
        axios.get('http://localhost:8080/api/reservation').then((res) => {
            setList(res.data.content);
            console.log(res.data.content);
        })
        .catch((err) => {
            console.error(err)
        })
    },[])

  return (
    <div>
      <h1>예약 확정</h1>
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
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={[
          { title: '진료 예약', date: '2026-04-01' }
        ]}
    />
    </div>

  )
}

export default ReservationConfirm