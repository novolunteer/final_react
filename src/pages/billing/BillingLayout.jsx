import React, { useState } from 'react'
import BillingList from './component/BillingList'
import PaymentList from './component/PaymentList'

const BillingLayout = () => {
  const [keyword, setKeyword]=useState("");
  const [searchInput, setSearchInput]=useState("");

  const handleSearch=()=>{
    setKeyword(searchInput.trim());
  }

  return (
    <div className='Billing-Layout'>
        <div className='Billing-Search-Area'>
          <div className='search-form'>
            <input type='text' placeholder='진료 번호와 환자 이름으로 검색해 보세요.'
              value={searchInput} onChange={(e)=>setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter'){
                  handleSearch();
                }
              }}/>
            <button type='button' onClick={handleSearch}>검색</button>
          </div>
        </div>
        <div className='Billing-Component'>
          <BillingList keyword={keyword}/>
          <PaymentList keyword={keyword}/>
        </div>
    </div>
  )
}

export default BillingLayout