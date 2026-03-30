import React, { useEffect, useRef, useState } from 'react'
import { chatRoomDetail, markAsRead } from '../../../api/chatApi';

const ChatRoom = ({ roomId, clientRef, connected, onReadRoom }) => {
  const [room, setRoom]=useState(null)
  const [messageSlice, setMessageSlice]=useState({
    messages:[],
    hasNext:false,
    nextCursor:null
  });
  const [content, setContent]=useState("")

  const subscriptionRef=useRef(null);

  const userId=Number(sessionStorage.getItem("userId"));
  
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

            await markAsRead(roomId);
            onReadRoom(roomId);

        }catch(error){
            console.log(error);
        }
    }

    setContent("");
    getChatRoomDetail();

  },[roomId]);

  useEffect(()=>{
    const client=clientRef.current;

    if(!roomId || !client || !connected) return;

    if(subscriptionRef.current){
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current=null;
    }

    subscriptionRef.current=client.subscribe(`/topic/chat/room/${roomId}`,async (message) => {
        const newMessage=JSON.parse(message.body);

        setMessageSlice(prev => ({
            ...prev,
            messages:[newMessage, ...prev.messages]
        }));

        await markAsRead(roomId);
        onReadRoom(roomId);
    });

    return ()=>{
        if(subscriptionRef.current){
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current=null;
        }
    };
  }, [roomId, clientRef, connected]);

  const sendMessage=()=>{
    const text=content.trim();
    const client=clientRef.current;

    if(!text){
        alert("메시지 내용을 입력하세요.");
        return;
    }

    if(!client || !connected){
        alert("웹소켓 연결이 아직 완료되지 않았습니다.");
        return;
    }

    try{
        client.publish({
            destination: `/app/chat/send/user`,
            body:JSON.stringify({
                roomId:roomId,
                content:text
            })
        });

        setContent("")
    }catch(error){
        console.log(error);
        alert("메시지 전송이 실패했습니다. 오류 로그를 확인하세요.");
    }

  };

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