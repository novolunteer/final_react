import React, { useEffect, useRef, useState } from 'react'
import { chatRoomDetail, markAsRead } from '../../../api/chatApi';

const ChatRoom = ({ roomId, clientRef, connected, onReadRoom }) => {
  const [room, setRoom]=useState(null)
  const [messageSlice, setMessageSlice]=useState({
    messages:[],
    hasNext:false,
    nextCursor:null
  });

  const [loading, setLoading]=useState(false);
  const [loadingOld, setLoadingOld]=useState(false);
  const [content, setContent]=useState("");
  const [hasNewMessage, setHasNewMessage]=useState(false);


  const subscriptionRef=useRef(null);
  const readSubscriptionRef=useRef(null);
  const messageAreaRef=useRef(null);
  const firstLoadRef=useRef(true);

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
        setHasNewMessage(false);
        firstLoadRef.current=true;
        return;
    }

    const getChatRoomDetail=async()=>{
        try{
            setLoading(true);

            const data=await chatRoomDetail({
                roomId:roomId,
                cursor:null
            });

            setRoom(data.room);
            setMessageSlice(data.messages);
            onReadRoom(roomId);
            setHasNewMessage(false);
            firstLoadRef.current=true;
        }catch(error){
            console.log(error);
        }finally{
            setLoading(false);
        }
    };

    setContent("");
    getChatRoomDetail();

  },[roomId]);

  useEffect(()=>{
    if(!firstLoadRef.current) return;

    const container=messageAreaRef.current;
    if(!container) return;
    if(!messageSlice.messages.length) return;

    container.scrollTop=container.scrollHeight;
    firstLoadRef.current=false;
  },[messageSlice.messages]);

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
        const nearBottom=isNearBottom();
        const isMine=newMessage.senderId === userId;

        setMessageSlice(prev => ({
            ...prev,
            messages:[...prev.messages, newMessage]
        }));

        if(nearBottom || isMine){
            await markAsRead(roomId);
            onReadRoom(roomId);

            setTimeout(() => {
                const container = messageAreaRef.current;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 0);
        } else {
            setHasNewMessage(true);
        }
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

  const loadOlderMessages=async()=>{
    if(!roomId || loadingOld || !messageSlice.hasNext) return;

    const container=messageAreaRef.current;
    if(!container) return;

    const prevScrollHeight=container.scrollHeight;
    const prevScrollTop=container.scrollTop;

    try{
        setLoadingOld(true);

        const data=await chatRoomDetail({
            roomId:roomId,
            cursor:messageSlice.nextCursor
        });
        
        const olderSlice=data.messages;

        setMessageSlice(prev => ({
            ...prev,
            messages: [...olderSlice.messages, ...prev.messages],
            hasNext: olderSlice.hasNext,
            nextCursor: olderSlice.nextCursor
        }));

        setTimeout(()=>{
            const newScrollHeight=container.scrollHeight;
            container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
        }, 0);

    }catch(error){
        console.log(error);
    }finally{
        setLoadingOld(false);
    }
  }

  const isNearBottom=()=>{
    const container=messageAreaRef.current;
    if(!container) return false;

    return container.scrollHeight - container.scrollTop - container.clientHeight <= 80;
  }

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

  const handleScroll=async()=>{
    const container=messageAreaRef.current;
    if(!container) return;

    if(container.scrollTop <= 50){
        await loadOlderMessages();
    }

    const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <= 80;

    if(nearBottom && hasNewMessage){
        setHasNewMessage(false);
        await markAsRead(roomId);
        onReadRoom(roomId);
    }
  };

  const orderedMessages=messageSlice.messages;
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
                <div className='chat-message-area' ref={messageAreaRef}
                    onScroll={handleScroll}>
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
                {
                        hasNewMessage && (
                            <button
                                type='button'
                                className='new-message-alert'
                                onClick={async()=>{
                                    const container=messageAreaRef.current;
                                    if(container){
                                        container.scrollTop=container.scrollHeight;
                                    }

                                    setHasNewMessage(false);
                                    await markAsRead(roomId);
                                    onReadRoom(roomId);
                                }}    
                            >
                                새 메시지 ↓
                            </button>
                        )
                }
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