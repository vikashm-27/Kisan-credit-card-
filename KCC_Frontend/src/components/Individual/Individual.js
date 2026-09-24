import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import "./Individual.css"
import { Link } from 'react-router-dom';
 
export default function Home() {
  const [selectverificationtype, setSelectVerificationType] = useState(null);
  const navigate = useNavigate();
 
  const types = [
    { name: 'Offline KYC', code: 'Ok' },
    { name: 'OTP Verification', code: 'Ov' },
    { name: 'Fingerprint Validation', code: 'Fv' }
  ];
 
  const cardStyle = {
    background:'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%',    
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100vh',
    
  };
 
  const cardContainerStyle = {
    margin: '4rem 4.5rem 4.5rem 4.5rem',
  };
 
const handleDropdownChange = (e) => {
  setSelectVerificationType(e.value);

  switch (e.value.code) {
    case 'Ok':
      navigate('/aadhar/offline');
      break;
    case 'Ov':
      navigate('/aadhar/otp');
      break;
    case 'Fv':
      navigate('/aadhar/fingerprint');
      break;
    default:
      break;
  }
};

 
  return (
    <>
      <Header/>
      <div style={cardStyle}>
        <Card className="w-full md:w-25rem" style={{ ...cardContainerStyle, height:'410px', padding: '3rem',boxShadow:'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
          <h1 className="pb-5 text-center">Aadhar Verification</h1>
          <Dropdown
            value={selectverificationtype}
            onChange={handleDropdownChange}
            options={types}
            optionLabel="name"
            placeholder="Validate User"
            className="w-full"
          />
        </Card>
        <Card className="w-full md:w-25rem" style={{ ...cardContainerStyle, padding: '3rem',boxShadow:'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
          <h1 className="pb-5 text-center">PAN Verification</h1>
           <Link to="/pan"><button className = "pan-button">Proceed Here</button></Link>
        </Card>
        <Card className="w-full md:w-25rem" style={{ ...cardContainerStyle, padding: '3rem',boxShadow:'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
          <h1 className="pb-5 text-center">VoterId Verification</h1>
          <Link to="/voter-id"> <button className = "voterid-button">Proceed Here</button></Link>
        </Card>
      </div>
      <Footer/>
    </>
  );
}