import React from 'react'

const MyInformatinPage = () => {
  const isLocal = d.isLocal && (d.socialAccounts === null || d.socialAccounts.length === 0);
  const onlySocial = d.onlySocial && d.socialAccounts !== null && d.socialAccounts.length > 0 && (d.email === null || d.email === "");
  const hasSocial = d.hasSocial && d.email !== null && d.socialAccounts !== null && d.socialAccounts.length > 0;

  return (
    <div>MyInformatinPage</div>
  )
}

export default MyInformatinPage