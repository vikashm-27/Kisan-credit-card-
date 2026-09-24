import React,{useState} from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import './DisplayResult.css';

const DisplayResult = () => {
  const location = useLocation();
  const responseData = location.state.responseData;
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    navigate('/individual');
  };



  return (
    <div className="result-container">
      <h2>Response Data</h2>
      {JSON.stringify(responseData, null, 2)}

      {/* 22/12/23---- added the Confirm button with css */}
    
      {!confirmed && (
        <button className="confirm-button" onClick={() => setConfirmed(handleConfirm)}>Confirm</button>
      )}
    </div>
  );
};

export default DisplayResult;
