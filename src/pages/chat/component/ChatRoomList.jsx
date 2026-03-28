import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { chatRoomList } from '../../../api/chatApi'

const ChatRoomList = ({ selectedRoomId, onSelectRoom }) => {
  const [rooms, setRooms]=useState([])
  const userId=useSelector(state=>state.auth.userId)

  useEffect(()=>{
    chatRoomList().then((res)=>{
        setRooms(res)
    })
    .catch((error)=>{
        console.log(error)
    });
  },[])

  const formatDate=(dateTime)=>{
    if(!dateTime) return '';

    const now=new Date();
    const d=new Date(dateTime);

    //올해 이전
    if(d.getFullYear() < now.getFullYear()){
        return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    }

    //오늘
    const isToday=
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();

    if(isToday){
        return `${d.getHours()}시 ${String(d.getMinutes()).padStart(2, '0')}분`;
    }

    //올해지만 오늘 이전
    return `${d.getMonth()+1}월 ${d.getDate()}일`;
  }

  return (
    <div>
        <h1>채팅 목록</h1>
        {
            !userId ? null :
            rooms.length === 0 ?
            (<p>참여 중인 채팅방이 없습니다</p>)
            :(
                <div>
                {
                    rooms.map(r => {
                        return <div key={r.roomId} onClick={()=>onSelectRoom(r.roomId)}
                                    className={selectedRoomId === r.roomId 
                                            ? 'active-chat-room':'chat-room'}>
                            <div>
                                <div>
                                    <p>{r.customRoomName ?
                                     r.customRoomName:r.roomName}</p>
                                    {
                                        r.participantCount > 2 &&
                                        <span>{r.participantCount}</span>
                                    }
                                </div>
                                <div>
                                    {
                                        r.lastMessageAt ?
                                        <p>{formatDate(r.lastMessageAt)}</p>
                                        :null
                                    }
                                </div>        
                            </div>
                            <div>
                                <div>
                                    {
                                        r.lastMessageText ?
                                        <p>{r.lastMessageText}</p>
                                        :<p>아직 전송된 메시지가 없습니다</p>
                                    }
                                </div>
                                <div></div>
                            </div>    
                        </div>
                    })
                }
            </div>
            )
        }
    </div>
  )
}

export default ChatRoomList