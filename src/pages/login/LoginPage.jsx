import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginPost } from '../../api/userApi'
import { loginSuccess } from '../../store/authSlice'
import "./loginPage.css"

const LoginPage = () => {
  const [email, setEmail]=useState("")
  const [password, setPassword]=useState("")

  const dispatch=useDispatch();
  const navigate=useNavigate();

  const handleLogin=async()=>{
    try{
        const data=await loginPost({"email":email, "password":password});
        alert("로그인 성공!");
        dispatch(loginSuccess(data));
        console.log("session ==> ", sessionStorage.getItem("userId"));
        setEmail("")
        setPassword("")
        navigate("/", {replace:true})
    }catch (error){
        alert("로그인 실패!");
        console.log(error);
    }
  }

  return (
    <div className='login-panel'>
        <div className='login-area'>
            <div className='login-header'>
                <h1>회원 로그인</h1>
            </div>
            <div className='login-main'>
                <form className='login-form'>
                    <div className='login-input-box'>
                        <label>이메일</label>
                        <input type='email' value={email}
                            onChange={(e)=>{setEmail(e.target.value)}}
                            placeholder='이메일을 입력하세요'
                            className='login-input'/>
                    </div>
                    <div className='login-input-box'>
                        <label>비밀번호</label>
                        <input type='password' value={password}
                            onChange={(e)=>{setPassword(e.target.value)}}
                            placeholder='비밀번호를 입력하세요'
                            className='login-input'/>
                    </div>
                    <div className='login-button-box'>
                        <button type='button' onClick={handleLogin}
                            className='login-btn'>
                                로그인
                        </button>
                    </div>
                </form>
            </div>
            <div className='login-footer'>
                <div className='join-box'>
                    <span>아직 계정이 없으신가요?</span>
                    <button type='button'
                        className='join-page-btn'
                        onClick={()=>{
                            navigate("/join", {replace: true});
                        }}
                    >
                        회원 가입
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default LoginPage