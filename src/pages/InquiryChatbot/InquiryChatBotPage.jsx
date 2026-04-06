import React, { useState } from 'react'

const InquiryChatBotPage = () => {
  const [question, setQuestion]=useState("");
  const [messages, setMessages]=useState({
    role:null,
    content:null
  });
  const [openPdfModal, setOpenPdfModal]=useState(false);
  const [selectedPdf, setSelectedPdf]=useState(null);

  const roles=sessionStorage.getItem("roles");
  const isAdmin=roles.includes("ADMIN");

  return (
    <div className='inquiry-chatbot-wrap'>
      <div className='inquiry-chatbot-header'>
        <div className='inquiry-chatbot-name'>
          <p>AI 문의 챗봇</p>
        </div>
        {
          isAdmin && (
            <div className='inquiry-chatbot-admin-area'>
              <button type='button' className='inquiry-chatbot-pdf-update-btn'
                onClick={()=>setOpenPdfModal(true)}>PDF 수정</button>
            </div>
          )
        }
      </div>
      <div className='inquiry-chatbot-body'>

      </div>
      <div className='inquiry-chatbot-footer'>
        <div className='inquiry-chatbot-form-wrap'>
          <form className='inquiry-chatbot-form'>
            <input type='text' placeholder='AI 챗봇에게 질문해보세요.' value={question}
                onChange={(e)=>setQuestion(e.target.value)} className='inquiry-chatbot-question-input'/>
            <button type='submit' className='inquiry-chatbot-submit-btn'>전송</button>
          </form>
        </div>
      </div>
      {
        openPdfModal && (
          <div className='pdf-modal-overlay' onClick={()=>setOpenPdfModal(false)}>
            <div className='pdf-modal-inner'>
              <form>
                <div className='inquiry-chatbot-pdf-input-wrap'>
                  <input type='file' value={selectedPdf}
                    onChange={(e)=>setSelectedPdf(e.target.files)}/>
                </div>
                <div className='inquiry-chatbot-pdf-button-wrap'>
                  <button type='button' onClick={()=>setOpenPdfModal(false)}>취소</button>
                  <button type='button'>확인</button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default InquiryChatBotPage