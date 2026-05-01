import { getMyReservations } from '@/api/patientApi';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useState } from 'react'

const statusMap={
    "RECEIVED": "신청",
    "PENDING": "가예약",
    "CONFIRMED": "확정",
    "COMPLETED": "진료 완료",
    "CANCELED": "취소"
}

const MyReservation = () => {
  const [page, setPage]=useState(0);
  const [sort, setSort]=useState("reservationId,desc");
  const [status, setStatus]=useState("");

  const { data, isLoading, isError }=useQuery({
    queryKey: ['reservation', page, sort, status],
    queryFn: () => getMyReservations(page, sort, status)
  });

  return (
    <div>
        <div>
            <div>
                <div>
                    <select onChange={(e) => setSort(e.target.value)} value={sort}>
                        <option value="reservationId,desc">최신순</option>
                        <option value="reservationId,asc">등록순</option>
                    </select>
                </div>
                <div>
                    <button type='button' onClick={() => setStatus("")}>전체</button>
                    <button type='button' onClick={() => setStatus("RECEIVED")}>신청</button>
                    <button type='button' onClick={() => setStatus("PENDING")}>가예약</button>
                    <button type='button' onClick={() => setStatus("CONFIRMED")}>확정</button>
                    <button type='button' onClick={() => setStatus("COMPLETED")}>진료 완료</button>
                    <button type='button' onClick={() => setStatus("CANCELED")}>취소</button>
                </div>
            </div>
            <div>
                {isLoading ? (
                    <div>
                        <p>불러오는 중...</p>
                    </div>
                ) : isError ? (
                        <div>
                            <p>예약 내역을 불러오지 못했습니다.</p>
                        </div>
                ) : (
                    <div>
                        { data?.content?.length === 0 ?  (
                            <div>
                                <p>예약 내역이 없습니다.</p>
                            </div>
                        ) : (
                            data.content.map((d, i) => {
                                const status=statusMap[String(d.status)] ?? "알 수 없음";
                                const canCancel=status === "신청" || status === "가예약";

                                return (
                                    <div key={d.reservationId}>
                                        <div>
                                            <span>{d.departmentName}</span><span>{status}</span>
                                            {
                                                canCancel && (
                                                    <button type='button'>취소</button>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <p>{d.symptom}</p>
                                        </div>
                                        <div>
                                            <span>{d.doctorName}</span><span>{dayjs(d.createdAt).format("YYYY년 MM월 DD일 HH시 mm분 ss초")}</span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div>
                            <button type='button' disabled={data?.first} onClick={() => setPage((p) => p - 1)}>이전</button>
                            <span>{data?.number !== null ? data?.number + 1 : ""}</span>
                            <button type='button' disabled={data?.last} onClick={() => setPage((p) => p + 1)}>다음</button>
                        </div>  
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default MyReservation