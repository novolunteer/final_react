import React, { useState } from 'react'
import ChatRoomList from '../component/ChatRoomList'
import ChatRoom from '../component/ChatRoom'
import "./chatLayout.css"

const ChatLayout = () => {
  const [selectedRoomId, setSelectedRoomId]=useState(null)

  return (
    <div className='chatArea'>
        <div className='chatRoomListArea'>
            <ChatRoomList selectedRoomId={selectedRoomId} 
                onSelectRoom={setSelectedRoomId}/>
        </div>
        <div className='chatRoomArea'>
            <ChatRoom roomId={selectedRoomId}/>
        </div>
    </div>
  )
}

export default ChatLayout