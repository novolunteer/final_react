import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginPost } from '../../api/userApi'
import { loginSuccess } from '../../store/authSlice'

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
    <div>
        <h1>로그인</h1>
        <form>
            <div>
                <label>이메일</label>
                <input type='email' value={email}
                    onChange={(e)=>{setEmail(e.target.value)}}/>
            </div>
            <div>
                <label>비밀번호</label>
                <input type='password' value={password}
                    onChange={(e)=>{setPassword(e.target.value)}}/>
            </div>
            <div>
                <button type='button' onClick={handleLogin}>로그인</button>
            </div>
        </form>
    </div>
  )
}

export default LoginPage