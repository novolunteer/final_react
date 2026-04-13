import axios from 'axios';
import React, { useEffect, useState } from 'react'
import jwtAxios from '../../api/jwtAxios';
import styles from './ReservationPage.module.css';

const ReservationPage = () => {
  const [department,setDepartment]=useState([]);
  const [doctor,setDoctor]=useState([]);
  const [selectedDoc,setSelectedDoc]=useState("");
  const [selectedDept,setSelectedDept]=useState("");
  const [selectedDate,setSelectedDate]=useState("");
  const [symptom, setSymptom] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(()=>{
      jwtAxios.get('http://localhost:8080/api/department').then((res) => {
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

    jwtAxios.get(`http://localhost:8080/api/staff/doctor?departmentId=${selectedDept}`)
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

    jwtAxios.post('http://localhost:8080/api/reservation', reservationData)
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
      <div className={styles.reservationContainer}>
        <h1 className={styles.reservationTitle}>예약</h1>

        <form>
          <div className={styles.formGroup}>
            <label className={styles.label}>진료과</label>
            <select
              className={styles.select}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">선택하세요</option>
              {department.map(dep => (
                <option key={dep.departmentId} value={dep.departmentId}>
                  {dep.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>희망 의사</label>
            <select
              className={styles.select}
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(Number(e.target.value))}
            >
              <option value="">희망 의사 없음</option>
              {doctor.map(doc => (
                <option key={doc.staffId} value={doc.staffId}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>희망 날짜</label>
            <input
              className={styles.input}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>희망 시간</label>
            <input
              className={styles.input}
              type="time"
              step="3600"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>증상</label>
            <textarea
              className={styles.textarea}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              rows={4}
              placeholder="증상을 자세히 입력해주세요"
            />
          </div>

          <button
            className={styles.button}
            type="button"
            onClick={submitHandler}
          >
            예약하기
          </button>
        </form>
      </div>
  )
}

export default ReservationPage