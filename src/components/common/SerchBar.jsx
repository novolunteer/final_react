import React from 'react'

const SerchBar = ({
    value,
    onChange,
    onSearch,
    placeholder,
}) => {

    const handleKeyDown= (e)=>{
        if(e.key == "Enter" && onSearch){
            onSearch();
        }
    };

  return (
    <div style={styles.container}>
        <input type='text'
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={styles.input}
        />
        <button type='button' onClick={onSearch} style={styles.button}>검색</button>
    </div>
  )
}

export default SerchBar

const styles = {
  container: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "16px",
  },
  input: {
    width: "280px",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    outline: "none",
  },
  button: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};