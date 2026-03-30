import React, { useEffect, useRef, useState } from 'react'
import ChatRoomList from '../component/ChatRoomList'
import ChatRoom from '../component/ChatRoom'
import "./chatLayout.css"
import { Client } from '@stomp/stompjs'
import { chatRoomList } from '../../../api/chatApi'

const ChatLayout = () => {
  const [selectedRoomId, setSelectedRoomId]=useState(null);
  const [connected, setConnected]=useState(false);
  const [rooms, setRooms]=useState([]);

  const clientRef=useRef(null);
  const accessToken=sessionStorage.getItem("accessToken");

  useEffect(()=>{
    const getRooms=async()=>{
        try{
            const res=await chatRoomList();
            setRooms(res);
        }catch(error){
            console.log(error);
        }
    };

    getRooms();
  },[]);

  useEffect(()=>{
      if(!accessToken) return;
  
      const client=new Client({
          brokerURL: 'ws://localhost:8080/ws',
          connectHeaders:{
              Authorization:`Bearer ${accessToken}`
          },
          reconnectDelay: 5000,
          debug: (str) => {
              console.log(str)
          }
      });
  
      client.onConnect = () => {
        console.log("WEBSOCKET_CONNECTED");
        setConnected(true);

        client.subscribe("/topic/chat/list",(message)=>{
            const dto=JSON.parse(message.body);
            console.log("LIST MESSAGE => ", dto);

            setRooms(prevRooms => {
                const exists = prevRooms.some(
                    room => Number(room.roomId) === Number(dto.roomId)
                );

                if (!exists) {
                    return prevRooms;
                }

                const updatedRooms=prevRooms.map(room => {
                    if(Number(room.roomId) === Number(dto.roomId)){
                        const isCurrentRoom=Number(selectedRoomId) === Number(dto.roomId);

                        return {
                            ...room,
                            lastMessageText: dto.content,
                            lastMessageAt: dto.createdAt,
                            unreadCount: isCurrentRoom ? 0 : (room.unreadCount || 0) + 1
                        };
                    }

                    return room;
                });

                updatedRooms.sort(
                    (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
                );

                return [...updatedRooms];
            });
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
          setConnected(false)
      };
  
      client.activate();
      clientRef.current=client;
  
      return ()=>{
          if(clientRef.current){
              clientRef.current.deactivate();
              clientRef.current=null;
          }
      };
    }, [accessToken, selectedRoomId]);

    const handleReadRoom=(roomId)=>{
        setRooms(prevRooms => 
            prevRooms.map(room => 
                Number(room.roomId) === Number(roomId)
                ? {...room, unreadCount: 0}
                : room
            )
        );
    };

  return (
    <div className='chatArea'>
        <div className='chatRoomListArea'>
            <ChatRoomList rooms={rooms} selectedRoomId={selectedRoomId} 
                onSelectRoom={setSelectedRoomId}/>
        </div>
        <div className='chatRoomArea'>
            <ChatRoom roomId={selectedRoomId} onReadRoom={handleReadRoom}
              clientRef={clientRef} connected={connected}/>
        </div>
    </div>
  )
}

export default ChatLayout