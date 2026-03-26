import React from 'react'

const CommonModal = ({open, onClose, children}) => {
    if(!open) return null;

  return (
    <div style={styles.overlay}>
        <div style={styles.modal}>
            <button onClick={onClose} style={styles.close}>X</button>
            {children} 
            
        </div>
    </div>
  )
}

export default CommonModal

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    minWidth: "300px",
  },
  close: {
    float: "right",
    cursor: "pointer",
  },
};