import React from 'react'
import "./OTP.css" 
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';


const Otp = () => {
  const navigate = useNavigate();
    const { register, handleSubmit, formState: {errors} } = useForm();
    const onSubmit = (data) =>{
        console.log(data);
        navigate('/individual');
    }

  return (
    <div className='otp-card'>
        <div className='card-container'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <h1>OTP Verification</h1>
              <div>
                <input 
                type="text" 
                placeholder='Enter Full Name'
                {...register('username', {
                    required: 'FullName is required',
                maxLength: {
                    value: 20,
                    message: 'FullName must not exceed 20 characters',
                  },
                })}
                />
                 {errors.username && <p className='error'>{errors.username.message}</p>}
                <input
                    type="text"
                    id="aadharNumber"
                    name="aadharNumber"
                    placeholder="Enter Aadhar Number"
                    {...register('aadharNumber', {
                        required: 'Aadhar number is required',
                        pattern: {
                        value: /^[2-9][0-9]{11}$/,
                        message: 'Invalid Aadhar number',
                        },
                    })}
                    />
                   {errors.aadharNumber && <p className='error'>{errors.aadharNumber.message}</p>}
                   <input 
                type="number" 
                placeholder='Enter OTP'
                {...register('otp', {
                    required: 'OTP is required',
                maxLength: {
                    value: 6,
                    message: ' OTP must not exceed 6 characters',
                  },
                })}
                />
                 {errors.otp && <p className='error'>{errors.otp.message}</p>}
              </div>
                 <button className='submit-button'>Submit</button>
            </form>
        </div>
    </div>
  )
}

export default Otp