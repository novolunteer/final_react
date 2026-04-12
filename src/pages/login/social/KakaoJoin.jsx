import React, { useState } from 'react'

const KakaoJoin = () => {
  const [name, setName]=useState("");
  const [nameCheckResult, setNameCheckResult]=useState("");
  const [rrn, setRrn]=useState("");
  const [rrnChecked, setRrnChecked]=useState(false);
  const [rrnCheckResult, setRrnCheckResult]=useState("");
  
  return (
    <div className='kakao-login-panel'>
        <div className='kakao-login-box'>
            <div className='kakao-login-header'>
                <p>KAKAO 소셜 로그인</p>
            </div>
            <div className='kakao-login-form-box'>
                <form className='kakao-login-form'>
                    <div className='kakao-name-box'>
                        <label>이름</label>
                        <input type='text'/>
                    </div>
                    <div className='kakao-rrn-box'>
                        <label>주민등록번호</label>
                        <input type='text' placeholder='숫자만 입력하세요'
                            maxLength={13}/>
                        <button>
                            주민등록번호 조회
                        </button>
                    </div>
                    <div className='kakao-login-btn-box'>
                        <button type='button'
                            className='kakao-login-btn'>
                            확인
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}

export default KakaoJoin