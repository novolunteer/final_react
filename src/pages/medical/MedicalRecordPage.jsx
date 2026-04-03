import axios from 'axios'
import React, { useEffect, useState } from 'react'

const MedicalRecordPage = () => {
      const [list, setList]=useState([])
      const [selectedPat,setSelectedPat]=useState("");

    useEffect(()=>{
        axios.get('http://localhost:8080/api/medicalrecord').then((res) => {
            setList(res.data.content);
          })
          .catch((err) => {
            console.error(err)
          })
      },[])

    useEffect(()=>{
      axios.get(`http://localhost:8080/api/medicalrecord?patientId=${selectedPat}`).then((res) => {
            setList(res.data.content);
          })
          .catch((err) => {
            console.error(err)
          })
      },[selectedPat])

    useEffect(()=>{
          axios.get('http://localhost:8080/api/medicalrecord').then((res) => {
              setList(res.data.content);
              console.log(res.data.content);
          })
          .catch((err) => {
              console.error(err)
          })
      },[])

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ width: "40%" }}>
        <h1>진료</h1>
        <table border="1">
        <thead>
          <tr>
            <th>예약번호</th>
            <th>환자</th>
            <th>접수상태</th>
            <th>진료기록보기</th>
          </tr>
        </thead>
        <tbody>
          {list?.map((item) => (
            <tr key={item.reservationId}>
              <td>{item.reservationId}</td>
              <td>{item.patientName}</td>
              <td>{item.status}</td>
              <td><button type='button' onClick={()=>confirmedHandler(item.reservationId)}>보기</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div style={{ width: "60%", borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
          <h1>진료 기록</h1>
        </div>
    </div>
  )
}

export default MedicalRecordPage