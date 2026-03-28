import React, { useEffect, useRef, useState } from 'react'
import ChatRoomList from '../component/ChatRoomList'
import ChatRoom from '../component/ChatRoom'
import "./chatLayout.css"
import { Client } from '@stomp/stompjs'

const ChatLayout = () => {
  const [selectedRoomId, setSelectedRoomId]=useState(null);
  const [connected, setConnected]=useState(false);

  const clientRef=useRef(null);
  const accessToken=sessionStorage.getItem("accessToken");

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
    }, [accessToken]);

  return (
    <div className='chatArea'>
        <div className='chatRoomListArea'>
            <ChatRoomList selectedRoomId={selectedRoomId} 
                onSelectRoom={setSelectedRoomId}/>
        </div>
        <div className='chatRoomArea'>
            <ChatRoom roomId={selectedRoomId}
              clientRef={clientRef} connected={connected}/>
        </div>
    </div>
  )
}

export default ChatLayout