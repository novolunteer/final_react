import axios from 'axios';
import React, { useEffect, useState } from 'react'

const ReservationPage = () => {
  const [department,setDepartment]=useState([]);
  const [doctor,setDoctor]=useState([]);
  const [selectedDoc,setSelectedDoc]=useState("");
  const [selectedDept,setSelectedDept]=useState("");
  const [selectedDate,setSelectedDate]=useState("");
  const [symptom, setSymptom] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(()=>{
      axios.get('http://localhost:8080/api/department').then((res) => {
          setDepartment(res.data.content)
        })
        .catch((err) => {
          console.error(err)
        })
    },[])

  useEffect(()=>{
    if (!selectedDept) {
      setDoctor([]); 
      setSelectedDoc(""); 
      return;
    }

    axios.get(`http://localhost:8080/api/doctor?departmentId=${selectedDept}`)
      .then((res) => {
        setDoctor(res.data.content)
        console.log(res.data.content)
      })
      .catch((err) => console.error(err));
  },[selectedDept])

  const submitHandler = () => {
    const reservationData = {
      doctorId: selectedDoc || null, 
      departmentId: selectedDept,
      preferredDate: selectedDate
              ? selectedDate + (selectedTime ? `T${selectedTime}:00` : "T00:00:00")
              : null,
      symptom: symptom
    };

    axios.post('http://localhost:8080/api/reservation', reservationData)
      .then(res => {
        alert('예약이 완료되었습니다. 예약번호: '+res.data.reservationId);
        setSelectedDept("");
        setSelectedDoc("");
        setSelectedDate("");
        setSelectedTime("");
        setSymptom("");
      })
      .catch(err => {
        console.error('예약 실패:', err);
        alert('예약에 실패했습니다.');
      });
  };

  return (
    <div>
      <div>
        <h1>예약</h1>
        <form>
          <label>
          진료과 
          <select value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="">선택하세요</option>
              {department.map(dep => (
                <option key={dep.departmentId} value={dep.departmentId}>
                  {dep.departmentName}
                </option>
              ))}
          </select>
          </label><br />
          희망 의사 
          <select value={selectedDoc}
              onChange={(e) => setSelectedDoc(Number(e.target.value))}>
              <option value="">희망 의사 없음</option>
              {doctor.map(doc => (
                <option key={doc.staffId} value={doc.staffId}>
                  {doc.name}
                </option>
              ))}
          </select><br />
          <label>
            희망 날짜:
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label> <br />
          <label>
            희망 시간:
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </label><br />
          증상 <input type="text" 
                      value={symptom}
                      onChange={(e) => setSymptom(e.target.value)}/><br />
          <button type="button" onClick={submitHandler}>예약</button>
        </form>
        </div>
    </div>
  )
}

export default ReservationPage