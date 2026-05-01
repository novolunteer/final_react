import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MyReservation from './component/MyReservation';
import MyReception from './component/MyReception';

const MyPageLayout = () => {
  const { userId, name, roles } = useSelector((s) => s.auth);
  const navigate=useNavigate();

  return (
    <div className='mypage-panel'>
        <div className='mypage-box'>
            <div className='mypage-header'>
                <div>
                    <p><b>{name}</b> 님의 예약, 접수, 결제 정보를 한 눈에 확인하세요.</p>
                </div>
                <div>
                    <button type='button' onClick={() => {
                        navigate("/patient/information", {replace:true});
                    }}>내 정보</button>
                </div>
            </div>
            <div className='mypage-main'>
                <MyReservation/>
                <MyReception/>
            </div>
        </div>
    </div>
  )
}

export default MyPageLayout