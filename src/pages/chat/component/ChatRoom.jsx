import React, { useEffect, useRef, useState } from 'react'
import { chatRoomDetail } from '../../../api/chatApi';
import { Client } from '@stomp/stompjs';

const ChatRoom = ({ roomId }) => {
  const [room, setRoom]=useState(null)
  const [messageSlice, setMessageSlice]=useState({
    messages:[],
    hasNext:false,
    nextCursor:null
  });
  const [content, setContent]=useState("")

  const clientRef=useRef(null);

  const userId=Number(sessionStorage.getItem("userId"));
  const accessToken=sessionStorage.getItem("accessToken");
  
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

  },[roomId]);

  useEffect(()=>{
    if(!roomId || !accessToken) return;

    const client=new Client({
        brokerURL: 'ws://localhost:8080/ws',
        connectHeaders:{
            Authorization:`Bearer ${accessToken}`
        },
        reconnectDelay: 0,
        debug: (str) => {
            console.log(str)
        }
    });

    client.onConnect = () => {
        console.log("WEBSOCKET_CONNECTED");

        client.subscribe(`/topic/chat/room/${roomId}`, (message) => {
            const newMessage=JSON.parse(message.body);

            setMessageSlice(prev => ({
                ...prev, messages: [newMessage, ...prev.messages]
            }));
        });
    };

    client.onStompError = (error) => {
        console.error("STOMP_ERROR ==> ", error);
    };

    client.onWebSocketError = (error) => {
        console.error("WEBSOCKET_ERROR ==> ", error);
    };

    client.onWebSocketClose = (event) => {
        console.error("WEBSOCKET_CLOSE ==> ", event);
    };

    client.activate();
    clientRef.current=client;

    return ()=>{
        if(clientRef.current){
            clientRef.current.deactivate();
            clientRef.current=null;
        }
    };
  }, [roomId]);

  const sendMessage=()=>{
    const text=content.trim();

    if(!text){
        alert("메시지 내용을 입력하세요.");
        return;
    }

    if(!clientRef.current || !clientRef.current.connected){
        alert("웹소켓 연결이 아직 완료되지 않았습니다.");
        return;
    }

    try{
        clientRef.current.publish({
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