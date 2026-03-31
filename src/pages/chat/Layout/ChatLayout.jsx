import React, { useCallback, useEffect, useRef, useState } from 'react'
import ChatRoomList from '../component/ChatRoomList'
import ChatRoom from '../component/ChatRoom'
import "./chatLayout.css"
import { Client } from '@stomp/stompjs'
import { chatRoomList, getStaffList } from '../../../api/chatApi'
import { useSelector } from 'react-redux'

const ChatLayout = () => {
  const [selectedRoomId, setSelectedRoomId]=useState(null);
  const [connected, setConnected]=useState(false);
  const [rooms, setRooms]=useState([]);
  const [staffList, setStaffList]=useState([]);

  const clientRef=useRef(null);
  const accessToken=sessionStorage.getItem("accessToken");
  const userId=useSelector(state=>state.auth.userId);

  const getRooms=useCallback(
    async()=>{
        try{
            const roomRes=await chatRoomList();
            setRooms(roomRes);

            const staffRes=await getStaffList();
            setStaffList(staffRes);

            if(selectedRoomId && !roomRes.some(room => room.roomId === selectedRoomId)){
                setSelectedRoomId(null);
            }

        }catch(error){
            console.log(error);
        }
  },[selectedRoomId]);  

  useEffect(()=>{
    getRooms();
  },[getRooms]);

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

        client.subscribe(`/topic/chat/list/${userId}`,(message)=>{
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

        client.subscribe(`/topic/chat/room-created/${userId}`, (message) => {
            const room=JSON.parse(message.body);

            setRooms(prev => {
                const exists=prev.some(r => Number(r.roomId) === Number(room.roomId));
                if(exists) return prev;
                return [room, ...prev];
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
    }, [accessToken, userId]);

    useEffect(()=>{
        const client=clientRef.current;
        if(!client || !connected) return;

        const roomListSubscription=client.subscribe(
            '/user/queue/chat/list',
            async (message) => {
                const payload=JSON.parse(message.body);

                if(payload.type === 'ROOM_LIST_REFRESH'){
                    await getRooms();
                }
            }
        );

        return ()=>{
            roomListSubscription.unsubscribe();
        };
    },[connected, getRooms])

    const handleReadRoom=(roomId)=>{
        setRooms(prevRooms => 
            prevRooms.map(room => 
                Number(room.roomId) === Number(roomId)
                ? {...room, unreadCount: 0}
                : room
            )
        );
    };

    const handleLeaveRoomSuccess=async() => {
        setSelectedRoomId(null);
        
        try{
            const res=await chatRoomList();
            setRooms(res);
        }catch(error){
            console.log(error);
        }
    }

  return (
    <div className='chatArea'>
        <div className='chatRoomListArea'>
            <ChatRoomList rooms={rooms} selectedRoomId={selectedRoomId} 
                onSelectRoom={setSelectedRoomId} staffList={staffList}
                setStaffList={setStaffList} setRooms={setRooms}/>
        </div>
        <div className='chatRoomArea'>
            <ChatRoom roomId={selectedRoomId} onReadRoom={handleReadRoom}
              clientRef={clientRef} connected={connected}
              onLeaveRoom={handleLeaveRoomSuccess}/>
        </div>
    </div>
  )
}

export default ChatLayout