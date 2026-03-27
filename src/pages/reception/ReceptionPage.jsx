import axios from 'axios';
import React, { useEffect, useState } from 'react'

const ReceptionPage = () => {
    const [list, setList]=useState([])

    useEffect(()=>{
        axios.get('http://localhost:8080/api/administration').then((res) => {
            setList(res.data.content);
            console.log(res.data.content);
        })
        .catch((err) => {
            console.error(err)
        })
    },[])

    const confirmedHandler=(receptionId)=>{
        axios.get(`http://localhost:8080/api/administration/recieved?receptionId=${receptionId}`).then((res) => {
            alert("접수 완료")
            window.location.reload();
        })
        .catch((err) => {
            console.error(err)
        })
    }

  return (
    <div>
        <h1>접수</h1>
        <table border="1">
        <thead>
          <tr>
            <th>접수번호</th>
            <th>환자</th>
            <th>의사</th>
            <th>예약시간</th>
            <th>접수상태</th>
            <th>접수</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.receptionId}>
              <td>{item.receptionId}</td>
              <td>{item.patientName}</td>
              <td>{item.doctorName}</td>
              <td>{item.reservationDate}</td>
              <td>{item.status}</td>
              <td><button type='button' onClick={()=>confirmedHandler(item.receptionId)}>확정</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReceptionPage