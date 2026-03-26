import React, { useState } from 'react'

const RegisterButton = ({
    type="button",
    onClick,
}) => {

  return (
        <button type={type} onClick={onClick}>등록</button>
  )
}

export default RegisterButton