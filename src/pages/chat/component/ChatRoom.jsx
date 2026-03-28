import React, { useEffect, useRef, useState } from 'react'
import { chatRoomDetail, sendUserMessage } from '../../../api/chatApi';

const ChatRoom = ({ roomId }) => {
  const [room, setRoom]=useState(null)
  const [messageSlice, setMessageSlice]=useState({
    messages:[],
    hasNext:false,
    nextCursor:null
  });
  const [content, setContent]=useState("")

  const clientRef=useRef(null);

  const userId=JSON.parse(sessionStorage.getItem("userId"));
  
  useEffect(()=>{
    if(!roomId){
        setRoom(null);
        setMessageSlice({
            messages:[],
            hasNext:false,
            nextCursor:null
        });
        setContent("");
        return
    }

    const getChatRoomDetail=async()=>{
        try{
            const data=await chatRoomDetail({
                roomId:roomId,
            });

            setRoom(data.room)
            setMessageSlice(data.messages)

        }catch(error){
            console.log(error);
        }
    }

    setContent("");
    getChatRoomDetail();

  },[roomId])

  const sendMessage=async()=>{
    if(!content.trim()){
        alert("메시지 내용을 입력하세요.");
        return;
    }

    try{
        const res=await sendUserMessage({
            roomId:roomId,
            content:content.trim()
        });

        setMessageSlice(prev => ({
            ...prev,
            messages:[res, ...prev.messages]
        }));

        console.log(res);
        setContent("")
    }catch(error){
        console.log(error);
        alert("메시지 전송이 실패했습니다. 오류 로그를 확인하세요.");
    }

  }

  if(!roomId){
    return <div>채팅방을 선택하세요</div>
  }

  if(!room){
    return <div>채팅방 정보를 불러오는 중...</div>
  }

  return (
    <div>
        {
            userId && 
            <div>
                <div>
                    <p>{room.customRoomName ? room.customRoomName:room.roomName}</p>
                </div>
                <div>
                    {
                        [...messageSlice.messages].reverse().map(m => {
                            return <div key={m.messageId}>
                                    <p>{m.senderName}</p>
                                    <span
                                        className={m.senderId === userId ? 'message-is-mine':'message'}>
                                        <p>{m.content}</p>
                                    </span>
                                </div>
                        })
                    }
                </div>
                <div>
                    <form onSubmit={(e)=>{
                        e.preventDefault();
                        sendMessage();
                    }}>
                        <input type='text' value={content}
                            onChange={(e)=>{
                                setContent(e.target.value)
                            }}/>
                        <button type='submit'>전송</button>
                    </form>
                </div>
            </div>
        }
    </div>
  )
}

export default ChatRoom