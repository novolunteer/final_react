import { getMyPaymentList, getMyReceptions } from '@/api/patientApi';
import { useMutation, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'

const MyReception = () => {
    const [page, setPage]=useState(0);
    const [sort, setSort]=useState("DESC");
    const [openPaymentList, setOpenPaymentList]=useState(false);
    const [paymentList, setPaymentList]=useState(null);
    const [paymentError, setPaymentError]=useState("");
    const [paymentPage, setPaymentPage]=useState(0);
    const [paymentSort, setPaymentSort]=useState("paymentId,desc");
    const [receptionId, setReceptionId]=useState("");
  
    const { data, isLoading, isError } = useQuery({
        queryKey: ['reception', page, sort],
        queryFn: () => getMyReceptions(page, sort)
    });

    const paymentMutation=useMutation({
        mutationFn: ({ page, sort, receptionId }) => getMyPaymentList(page, sort, receptionId),
        onSuccess: (response) => {
            setPaymentList(response);
        },
        onError: () => {
            setPaymentError("결제 내역을 불러오지 못했습니다.");
        }
    });

    const showPaymentList=(id)=>{
        setReceptionId(Number(id));

        paymentMutation.mutate({
            page: paymentPage,
            sort: paymentSort,
            receptionId: Number(id)
        });

        setOpenPaymentList(true);
    }

    useEffect(() => {
        if(!receptionId) return;

        paymentMutation.mutate({
            page: paymentPage,
            sort: paymentSort,
            receptionId
        });
    }, [paymentPage, paymentSort])

    const closePaymentList=(e)=>{
        e.stopPropagation();
        setReceptionId("");
        setOpenPaymentList(false);
        setPaymentList(null);
        setPaymentPage(0);
        setPaymentSort("paymentId,desc");
    }

  return (
    <div>
        <div>
            <div>
                {
                    isLoading ? (
                        <div>
                            <p>불러오는 중...</p>
                        </div>
                    ) : isError ? (
                        <div>
                            <p>접수 내역을 불러오지 못했습니다.</p>
                        </div>
                    ) : (
                        <div>
                            {
                                data?.content.length === 0 ? (
                                    <div>
                                        <p>접수 내역이 없습니다.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div>
                                            <select value={sort} onChange={(e) => setSort(e.target.value)}>
                                                <option value="DESC">최신순</option>
                                                <option value="ASC">등록순</option>
                                            </select>
                                        </div>
                                        {
                                            data?.content.map((d, i) => {

                                                return (
                                                    <div key={d.receptionId} onClick={() => showPaymentList(d.receptionId)}>
                                                        <div>
                                                            <div>
                                                                <span>{d.departmentName}</span><span>{d.status === "COMPLETED" ? "진료 완료":"알 수 없음"}</span>
                                                            </div>
                                                            <div>
                                                                <p>{d.symptom}</p>
                                                            </div>
                                                            <div>
                                                                <span>{d.doctorName}</span><span>{dayjs(d.receptionDate).format("YYYY년 MM월 DD일")}</span>
                                                            </div>
                                                        </div>
                                                        {
                                                            openPaymentList && receptionId === Number(d.receptionId) && (
                                                                <div>
                                                                    {   
                                                                        paymentList === null ||
                                                                        paymentList?.content.length === 0 ? (
                                                                            <div>
                                                                                <p>결제 내역이 없습니다.</p>
                                                                            </div>
                                                                        ) : (
                                                                            <div>
                                                                                <div>
                                                                                    <select value={paymentSort} onChange={(e) => setPaymentSort(e.target.value)}>
                                                                                        <option value="paymentId,desc">최신순</option>
                                                                                        <option value="paymentId,asc">등록순</option>
                                                                                    </select>
                                                                                </div>
                                                                                {
                                                                                    paymentList?.content.map((p, i) => {

                                                                                        return (
                                                                                            <div key={p.paymentId}>
                                                                                                <div>
                                                                                                    <span>접수 번호: {d.receptionId}</span><span>{p.method}</span>
                                                                                                </div>
                                                                                                <div>
                                                                                                    <p>{p.amount}원</p>
                                                                                                </div>
                                                                                                <div>
                                                                                                    <span>{dayjs(p.paidAt).format("YYYY년 MM월 DD일 HH시 mm분 ss초")}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    })
                                                                                }
                                                                                <div>
                                                                                    <button type='button' disabled={paymentList?.first} onClick={() => setPaymentPage((p) => p - 1)}>이전</button>
                                                                                    <span>{paymentList?.number !== null ? paymentList.number + 1 : ""}</span>
                                                                                    <button type='button' disabled={paymentList?.last} onClick={() => setPaymentPage((p) => p + 1)}>다음</button>
                                                                                </div>
                                                                            </div>
                                                                       )
                                                                    }
                                                                    <div>
                                                                        <button type='button' onClick={closePaymentList}>닫기</button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>                                                    
                                                )
                                            })
                                        }
                                        <div>
                                            <button type='button' disabled={data?.first} onClick={() => setPage((p) => p - 1)}>이전</button>
                                            <span>{data?.number !== null ? data?.number + 1 : ""}</span>
                                            <button type='button' disabled={data?.last} onClick={() => setPage((p) => p + 1)}>다음</button>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>
        </div>
    </div>
  )
}

export default MyReception