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
  const readSubscriptionRef=useRef(null);

  const userId=Number(sessionStorage.getItem("userId"));

  const applyReadStatus=(readStatus)=>{
    setMessageSlice(prev => ({
        ...prev,
        messages: prev.messages.map(msg => {
            //시스템 메시지는 제외
            if(msg.messageType !== 'USER'){
                return msg;
            }

            //읽은 당사자가 보낸 메시지 제외
            if(msg.senderId === readStatus.userId){
                return msg;
            }

            //읽은 범위 안에 있는 메시지면 unreadCount - 1
            if(msg.messageId <= readStatus.lastReadMessageId){
                return {
                    ...msg,
                    unreadCount : Math.max((msg.unreadCount ?? 0) - 1, 0)
                };
            }

            return msg;
        })
    }));
  };
  
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

    if(readSubscriptionRef.current){
        readSubscriptionRef.current.unsubscribe();
        readSubscriptionRef.current = null;
    }

    //새 메시지 구독
    subscriptionRef.current=client.subscribe(`/topic/chat/room/${roomId}`,async (message) => {
        const newMessage=JSON.parse(message.body);

        setMessageSlice(prev => ({
            ...prev,
            messages:[newMessage, ...prev.messages]
        }));

        await markAsRead(roomId);
        onReadRoom(roomId);
    });

    //읽음 이벤트 구독
    readSubscriptionRef.current=client.subscribe(`/topic/chat/room/${roomId}/read`,
        (message) => {
            const readStatus=JSON.parse(message.body);
            applyReadStatus(readStatus);
        }
    );

    return ()=>{
        if(subscriptionRef.current){
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current=null;
        }

        if(readSubscriptionRef.current){
            readSubscriptionRef.current.unsubscribe();
            readSubscriptionRef.current = null;
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
    return <div className='chat-room-empty'>
        <div className='chat-room-empty-box'>
            채팅방을 선택하세요
        </div>
    </div>
  }

  if(!room){
    return <div className='chat-room-empty'>
        <div className='chat-room-empty-box'>
            채팅방 정보를 불러오는 중...
        </div>
    </div>
  }

  const orderedMessages=[...messageSlice.messages].reverse();
  const lastMyUserMessageId=[...orderedMessages].reverse()
            .find(m => m.senderId === userId && m.messageType === 'USER')?.messageId ?? null;
  const shouldShowUnreadCount=(message, isMine) => {
    if(!isMine) return false;
    if(message.messageType !== 'USER') return false;
    if(!message.unreadCount || message.unreadCount <= 0) return false;

    if(room?.roomType === "DIRECT"){
        return message.messageId === lastMyUserMessageId;
    }

    return true;
  }

  return (
    <div className='chat-room-panel'>
        {
            userId && 
            <>
                <div className='chat-room-header'>
                    <p className='chat-room-header-title'>
                        {room.customRoomName ? room.customRoomName:room.roomName}
                    </p>
                </div>
                <div className='chat-message-area'>
                    {
                        orderedMessages != null &&
                        orderedMessages.map(m => {
                            const isMine=m.senderId === userId;

                            return (
                                <div key={m.messageId}
                                        className={isMine 
                                                    ? 'chat-message-row mine' 
                                                    : 'chat-message-row'}
                                    >
                                    {!isMine && <p className="chat-sender-name">{m.senderName}</p>}

                                    <div className='chat-message-content'>
                                        {shouldShowUnreadCount(m, isMine) && (
                                            <span className='chat-unread-count'>
                                                {m.unreadCount}    
                                            </span>
                                        )}
                                        <div className={isMine ? 'chat-bubble mine' : 'chat-bubble'}>
                                            <p>{m.content}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className='chat-input-area'>
                    <form className='chat-input-form'
                        onSubmit={(e)=>{
                        e.preventDefault();
                        sendMessage();
                    }}>
                        <input type='text' value={content} placeholder='메시지를 입력하세요.'
                            onChange={(e)=>{
                                setContent(e.target.value)
                            }}
                            className='chat-input'
                        />
                        <button type='submit'
                                className='chat-send-btn'>전송</button>
                    </form>
                </div>
            </>
        }
    </div>
  )
}

export default ChatRoom