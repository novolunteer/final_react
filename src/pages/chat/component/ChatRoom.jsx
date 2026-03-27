import React, { useEffect, useState } from 'react'
import { chatRoomDetail } from '../../../api/chatApi';

const ChatRoom = ({ roomId }) => {
  const [room, setRoom]=useState(null)
  const [participants, setParticipants]=useState([])
  const [messages, setMessages]=useState([])
  const [cursor, setCursor]=useState(null)
  const [content, setContent]=useState("")

  const user=JSON.parse(sessionStorage.getItem("user"));
  
  useEffect(()=>{
    if(!roomId){
        setRoom(null)
        setParticipants([])
        setMessages([])
        return
    }

    const getChatRoomDetail=async()=>{
        const data=await chatRoomDetail({
            roomId:roomId,
            cursor:cursor
        });
        setRoom(data.room)
        setParticipants(data.participants)
        setMessages(data.messages)
    }

    getChatRoomDetail();

  },[roomId])

  if(!roomId){
    return <div>채팅방을 선택하세요</div>
  }

  if(!room || !participants || !messages){
    return <div>채팅방 정보를 불러오는 중...</div>
  }

  return (
    <div>
        {
            user && 
            <div>
                <div>
                    <p>{room.customRoomName ? room.customRoomName:room.roomName}</p>
                </div>
                <div>
                    {
                        messages &&
                        messages.map(m => {
                            return <span key={m.messageId}
                                    className={m.mine ? 'message-is-mine':'message'}>
                                <p>{m.content}</p>
                            </span>
                        })
                    }
                </div>
                <div>
                    <form>
                        <input type='text' value={content}
                            onChange={(e)=>{
                                setContent(e.target.value)
                            }}/>
                        <button type='button'>전송</button>
                    </form>
                </div>
            </div>
        }
    </div>
  )
}

export default ChatRoom