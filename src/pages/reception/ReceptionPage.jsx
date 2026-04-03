import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

const ReceptionPage = () => {
    const [status, setStatus]=useState("");
    const [name, setName]=useState("");
    const [debouncedName, setDebouncedName] = useState("");
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    
    useEffect(() => {
      setPage(0);
    }, [status, debouncedName]);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedName(name);
      }, 500);

      return () => clearTimeout(timer);
    }, [name]);

    const confirmedHandler=(receptionId)=>{
        axios.get(`http://localhost:8080/api/administration/recieved?receptionId=${receptionId}`).then((res) => {
            alert("접수 완료")
            queryClient.invalidateQueries({ queryKey: ['receptionList'] });
        })
        .catch((err) => {
            console.error(err)
        })
    }

    const cancelHandler=()=>{

    }

    const fetchReceptionList = ({ status, name, page }) => {
      return axios.get('http://localhost:8080/api/reception', {
        params: {
          status: status || undefined,
          name: name,
          page: page,
          size: 3
        }
      }).then(res => {
        return res.data;
      });
    };

    const { data , isLoading } = useQuery({
      queryKey: ['receptionList', status, debouncedName, page],
      queryFn: () => fetchReceptionList({ status, name: debouncedName, page }),
      placeholderData: (prev) => prev, 
    });

    const list = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

  return (
    <div>
        <h1>접수</h1>
      {/* 상태 버튼 */}
      <div style={statusBar}>
        <button onClick={() => setStatus("")} style={btn}>전체</button>
        <button onClick={() => setStatus("PENDING")} style={btn}>미접수</button>
        <button onClick={() => setStatus("RECEIVED")} style={btn}>접수</button>
        <button onClick={() => setStatus("CONSULTING")} style={btn}>진료중</button>
        <button onClick={() => setStatus("COMPLETED")} style={btn}>완료</button>
      </div>
        이름 검색 <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        <br />

          {isLoading && <p>불러오는 중...</p>}
        <table border="1">
        <thead>
          <tr>
            <th>접수번호</th>
            <th>환자</th>
            <th>의사</th>
            <th>예약시간</th>
            <th>접수상태</th>
            <th>접수</th>
            <th>취소</th>
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
              <td><button type='button' onClick={()=>cancelHandler(item.receptionId)}>취소</button></td>
            </tr>
          ))}
        </tbody>
      </table>
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
  )
}

const btn = {
  marginRight: '10px',
  padding: '6px 12px',
  cursor: 'pointer'
};

const statusBar = {
  marginBottom: '15px'
};

export default ReceptionPage