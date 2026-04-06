import { useQuery } from '@tanstack/react-query';
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query';

const MedicalRecordPage = () => {
      const queryClient = useQueryClient();
      const [selectedPat,setSelectedPat]=useState("");
      const [status, setStatus]=useState("DIAGNOSIS");
      const [page, setPage] = useState(0);
      const [size] = useState(3); 
      const [selectedRecord, setSelectedRecord] = useState(null);
      const [isAdding, setIsAdding] = useState(false);
      const [showReasonModal, setShowReasonModal] = useState(false);
      const [reason, setReason] = useState("");
      const [pendingRecord, setPendingRecord] = useState(null);
      const [waitingPage, setWaitingPage] = useState(0);
      const [waitingSize] = useState(3);
      const [showStatusModal, setShowStatusModal] = useState(false);
      const [pendingReceptionId, setPendingReceptionId] = useState(null);
      const [pendingPatientId, setPendingPatientId] = useState(null);
      const [waitingStatus, setWaitingStatus] = useState("PENDING");
      const [newRecord, setNewRecord] = useState({
        title: "",
        content: "",
        isSensitive: false,
      });

    const {data: waitingData} = useQuery({
      queryKey: ["medicalRecords", waitingStatus, waitingPage, waitingSize],
      queryFn: async () =>{
        const res = await axios.get("http://localhost:8080/api/waitingList",{
          params:{
            page: waitingPage,
            size: waitingSize,
            status: waitingStatus,
          },
        });
        return res.data;
      }})

    const list = waitingData?.content || [];

    const { data: patientData } = useQuery({
      queryKey: ["patientInfo", selectedPat],
      queryFn: async () => {
        const res = await axios.get(
          "http://localhost:8080/api/medicalrecord/patientInfo",
          {
            params: { patientId: selectedPat },
          }
        );
        return res.data;
      },
      enabled: !!selectedPat,
    });

    const {
      data: recordData,
      isLoading: recordLoading,
    } = useQuery({
      queryKey: ["medicalRecord", selectedPat, status, page],
      queryFn: async () => {
        const res = await axios.get("http://localhost:8080/api/medicalrecord", {
          params: {
            patientId: selectedPat,
            status: status,
            page: page,
            size: size,
          },
        });
        return res.data;
      },
      enabled: !!selectedPat && !!status,
    });

    const recordList = recordData?.content || [];

    const handleAdd = async () => {
      try {
        await axios.post("http://localhost:8080/api/medicalrecord", {
          patientId: selectedPat,
          medicalRecordStatus: status,
          title: newRecord.title,
          content: newRecord.content,
          isSensitive: newRecord.isSensitive,
        });

        queryClient.invalidateQueries({ queryKey: ["medicalRecord"] });

        alert("추가 완료");

        setIsAdding(false);
        setNewRecord({ title: "", content: "", isSensitive: false });

      } catch (err) {
        console.error("🔥에러 확인:", err.response || err);
        console.error(err);
      }
    };

    const handleRecordClick = (item) => {
        if (item.isSensitive) {
          setPendingRecord(item);
          setShowReasonModal(true);
        } else {
          setSelectedRecord(item);
        }
      };

      const handleSubmitReason = async () => {
        try {
          await axios.post("http://localhost:8080/api/medicalrecord/access-log", {
            recordId: pendingRecord.medicalRecordId,
            reason: reason,
          });

          setSelectedRecord(pendingRecord);
          setShowReasonModal(false);
          setReason("");
          setPendingRecord(null);

        } catch (err) {
          console.error(err);
          alert("열람 기록 저장 실패");
        }
      };

      const handleChangeToInProgress = async () => {
        try {
          await axios.patch("http://localhost:8080/api/reception/status", null, {
            params: {
              receptionId: pendingReceptionId,
              status: "CONSULTING",
            },
          });

          setShowStatusModal(false);
          setPendingReceptionId(null);
          setPendingPatientId(null);

          queryClient.invalidateQueries({ queryKey: ["medicalRecords"] });

        } catch (err) {
          console.error(err);
          alert("상태 변경 실패");
        }
      };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ width: "40%" }}>
        <h1>진료</h1>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => { setWaitingStatus("RECEIVED"); setWaitingPage(0); }}
            style={{ fontWeight: waitingStatus === "RECEIVED" ? "bold" : "normal" }}
          >
            대기
          </button>
          <button
            onClick={() => { setWaitingStatus("CONSULTING"); setWaitingPage(0); }}
            style={{ fontWeight: waitingStatus === "CONSULTING" ? "bold" : "normal" }}
          >
            진료중
          </button>
          <button
            onClick={() => { setWaitingStatus("COMPLETED"); setWaitingPage(0); }}
            style={{ fontWeight: waitingStatus === "COMPLETED" ? "bold" : "normal" }}
          >
            완료
          </button>
        </div>
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
            <tr key={item.receptionId}>
              <td>{item.receptionId}</td>
              <td>{item.patientName}</td>
              <td>{item.status}</td>
              <td><button type='button'
                          onClick={() => {
                            setPendingReceptionId(item.receptionId);
                             setPendingPatientId(item.patientId); 
                             setSelectedPat(item.patientId);
                            setShowStatusModal(true);
                          }}
              >보기</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "10px" }}>
        <button
          disabled={waitingPage === 0}
          onClick={() => setWaitingPage((prev) => prev - 1)}
        >
          이전
        </button>

        <span style={{ margin: "0 10px" }}>
          {waitingPage + 1} / {waitingData?.totalPages || 1}
        </span>

        <button
          disabled={waitingPage + 1 >= (waitingData?.totalPages || 1)}
          onClick={() => setWaitingPage((prev) => prev + 1)}
        >
          다음
        </button>
      </div>
      </div>


      <div style={{ width: "60%", borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
        <h1>진료</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* 환자 정보 */}
          {patientData?.patient && (
            <div>
              <h3>환자 정보</h3>

              <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <th>이름</th>
                    <td>{patientData.patient.name}</td>
                    <th>전화번호</th>
                    <td>{patientData.patient.phone}</td>
                  </tr>
                  <tr>
                    <th>성별</th>
                    <td>{patientData.patient.gender}</td>
                    <th>혈액형</th>
                    <td>{patientData.patient.bloodType}</td>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <td colSpan="3">{patientData.patient.address}</td>
                  </tr>
                  <tr>
                    <th>키</th>
                    <td>{patientData.patient.height}</td>
                    <th>몸무게</th>
                    <td>{patientData.patient.weight}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 진료 기록 */}
          <div>
          <h3>진료 기록</h3>

          {/* 상태 버튼 */}
          <div style={{ marginBottom: "10px" }}>
            <button onClick={() => { setStatus("DIAGNOSIS"); setPage(0); }}>진료</button>
            <button onClick={() => { setStatus("TEST"); setPage(0); }}>검사</button>
            <button onClick={() => { setStatus("SURGERY"); setPage(0); }}>수술</button>
            <button onClick={() => { setStatus("PRESCRIPTION"); setPage(0); }}>처방</button>
            
            <button
              onClick={() => {
                setIsAdding(true);
                setSelectedRecord(null);
              }}
              disabled={!status}
            >
              추가
            </button>
          </div>

          {/* 테이블 */}
          <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>의사</th>
                <th>제목</th>
              </tr>
            </thead>
            <tbody>
              {recordList.map((item) => (
                <tr key={item.medicalRecordId}
                    onClick={() => handleRecordClick(item)}
                    style={{ cursor: "pointer" }}>
                  <td>{item.doctorName}</td>
                  <td>
                    {item.isSensitive ? "⚠ 민감 정보 포함" : item.title}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이징 */}
          <div style={{ marginTop: "10px" }}>
            <button
              disabled={page === 0}
              onClick={() => setPage((prev) => prev - 1)}
            >
              이전
            </button>

            <span style={{ margin: "0 10px" }}>
              {page + 1} / {recordData?.totalPages || 1}
            </span>

            <button
              disabled={page + 1 >= (recordData?.totalPages || 1)}
              onClick={() => setPage((prev) => prev + 1)}
            >
              다음
            </button>
          </div>
          <div style={{ marginTop: "20px" }}>
          <h3>내용</h3>

          {selectedRecord ? (
            <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
              
              {/* 1️⃣ 헤더 (진료과 / 담당의 + 날짜) */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                borderBottom: "1px solid #eee",
                paddingBottom: "8px"
              }}>
                <div style={{ fontWeight: "bold" }}>
                  {selectedRecord.departmentName || "-"} / {selectedRecord.doctorName || "-"}
                </div>

                <div style={{ fontSize: "14px", color: "#666" }}>
                  {selectedRecord.createAt
                    ? new Date(selectedRecord.createAt).toLocaleString()
                    : ""}
                </div>
              </div>

              {/* 2️⃣ 제목 */}
              <div style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "12px"
              }}>
                {selectedRecord.title}
              </div>

              {/* ⚠️ 민감 정보 표시 */}
              {selectedRecord.isSensitive && (
                <div style={{ color: "red", fontSize: "13px", marginBottom: "8px" }}>
                  ⚠ 민감 정보 포함
                </div>
              )}

              {/* 3️⃣ 내용 */}
              <div style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
                fontSize: "15px"
              }}>
                {selectedRecord.content}
              </div>

            </div>
          ) : (
            <p>기록을 선택하세요</p>
          )}
        </div>
        {isAdding && (
          <div style={{ border: "1px solid #ccc", padding: "15px", marginTop: "20px" }}>
            <h3>새 기록 추가 ({status})</h3>

            {/* 제목 */}
            <div style={{ marginBottom: "10px" }}>
              <label>제목</label><br />
              <input
                type="text"
                value={newRecord.title}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, title: e.target.value })
                }
                style={{ width: "100%", padding: "5px" }}
              />
            </div>

            {/* 내용 */}
            <div style={{ marginBottom: "10px" }}>
              <label>내용</label><br />
              <textarea
                value={newRecord.content}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, content: e.target.value })
                }
                rows={5}
                style={{ width: "100%", padding: "5px" }}
              />
            </div>

            {/* 민감 여부 */}
            <div style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={newRecord.isSensitive}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, isSensitive: e.target.checked })
                  }
                />
                민감 정보
              </label>
            </div>

            {/* 버튼 */}
            <button onClick={handleAdd}>저장</button>
            <button onClick={() => setIsAdding(false)}>취소</button>
          </div>
        )}
        </div>
        {showReasonModal && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px"
            }}>
              <h3>⚠ 민감 정보 열람</h3>

              <p style={{ fontSize: "14px", color: "red" }}>
                이 기록은 민감 정보입니다.<br />
                열람 사유는 로그로 저장됩니다.
              </p>

              <textarea
                placeholder="열람 사유 입력"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: "100%", marginTop: "10px" }}
              />

              <div style={{ marginTop: "10px" }}>
                <button onClick={handleSubmitReason} disabled={!reason}>
                  확인
                </button>
                <button onClick={() => setShowReasonModal(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {showStatusModal && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
              textAlign: "center"
            }}>
              <h3>진료 시작</h3>
              <p>진료중으로 변경하시겠습니까?</p>

              <div style={{ marginTop: "10px" }}>
                <button onClick={handleChangeToInProgress}>
                  예
                </button>
                <button onClick={() => setShowStatusModal(false)}>
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>


    </div>
  )
}

export default MedicalRecordPage