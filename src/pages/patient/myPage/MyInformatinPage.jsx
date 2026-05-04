import React, { useState } from 'react'

const MyInformatinPage = () => {
  const [email, setEmail]=useState("");
  const [password, setPassword]=useState("");
  const [name, setName]=useState("");
  const [rrn, setRrn]=useState("");
  const [phone, setPhone]=useState("");
  const [address, setAddress]=useState("");

  const isLocal = d.isLocal && (d.socialAccounts === null || d.socialAccounts.length === 0);
  const onlySocial = d.onlySocial && d.socialAccounts !== null && d.socialAccounts.length > 0 && (d.email === null || d.email === "");
  const hasSocial = d.hasSocial && d.email !== null && d.socialAccounts !== null && d.socialAccounts.length > 0;

  return (
    <div>
      <div>
        <div>
          <button>마이페이지</button>
        </div>
        <div>
          
        </div>
      </div>
    </div>
  )
}

export default MyInformatinPage