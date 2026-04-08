import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import { getBillingList } from '../../../api/billingApi';

const BillingList = ({ keyword }) => {
  const [page, setPage]=useState(0);
  const [sort, setSort]=useState("billingId,desc");

  useEffect(()=>{
    setPage(0);
  }, [keyword])

  const { data, isLoading, isError }=useQuery({
    queryKey: ['billingList', keyword, page, sort],
    queryFn: () => getBillingList(page, sort, keyword)
  });

  if(isLoading){
    return <div>청구 목록 불러오는 중...</div>;
  }

  if(isError){
    return <div>청구 목록을 불러오지 못했습니다!</div>
  }

  return (
    <div className='billing-list'>
      <div className='billing-sort-area'>
        <div className='billing-sort-box'>
          <select className='billing-sort-select' value={sort}
            onChange={(e)=>setSort(e.target.value)}>
            <option value='billingId,desc'>최신순</option>
            <option value='billingId,asc'>등록순</option>
          </select>
        </div>
      </div>
      <div className='billing-table-area'>
        <table className='billing-table'>
          <thead>
            <tr>
              <th>번호</th><th>환자</th><th>진료 번호</th><th>총 금액</th><th>처리 현황</th>
            </tr>
          </thead>
          <tbody>
            {
              data?.content?.length === 0 ? (
                <tr>
                  <td colSpan={5}>조회된 청구서가 없습니다!</td>
                </tr>
              ) : (
                data?.content?.map((billing, index) => (
                  <tr key={billing.billingId}>
                    <td>{(page * 10) + index + 1}</td><td>{billing.patientName}</td><td>{billing.recordId}</td>
                    <td>{billing.totalAmount}</td><td>{billing.status}</td>
                  </tr>
                ))
              )
            }
          </tbody>
        </table>
      </div>
      <div className='billing-paging-area'>
        <button type='button' onClick={() => setPage(prev => prev - 1)}
          disabled={data?.first}>
          이전
        </button>
        <span>
          {data ? `${data.number + 1} / ${data.totalPages}`:''}
        </span>
        <button type='button' onClick={()=>setPage(prev => prev + 1)}
          disabled={data?.last}>
          다음
        </button>
      </div>
    </div>
  )
}

export default BillingList