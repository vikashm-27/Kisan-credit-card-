// import React from 'react'
// import "./Voter.css" 
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';


// const Voter = () => {
//   const navigate = useNavigate();
//     const { register, handleSubmit, formState: {errors} } = useForm();
//     const onSubmit = (data) =>{
//         console.log(data);
//         navigate('/individual');
//     }

//   return (
//     <div className='voter-card'>
//         <div className='card-container'>
//             <form onSubmit={handleSubmit(onSubmit)}>
//               <h1>VoterId Verification</h1>
//               <div>
//                       <input 
//                     type="text" 
//                     placeholder='Enter FullName'
//                     {...register('username', {
//                         required: 'FullName is required',
//                         pattern: {
//                           value: /^[A-Za-z]+$/i,
//                           message: "Username should only contain letters",
//                         },
//                         maxLength: {
//                         value: 20,
//                         message: 'FullName must not exceed 20 characters',
//                         },
//                     })}
//                     />
//                     {errors.username && <p className='error'>{errors.username.message}</p>}
//                       <input
//                         type="text"
//                         id="voterIdNumber"
//                         name="voterIdNumber"
//                         placeholder="Enter Voter ID Number"
//                         {...register('voterIdNumber', {
//                           required: 'Voter ID number is required',
//                           pattern: {
//                             value: /^[a-zA-Z]{3}[0-9]{7}$/,
//                             message: 'Invalid Voter ID number EX: ABC1234567',
//                           },
//                         })}
//                       />
//                       {errors.voterIdNumber && <p className='error'>{errors.voterIdNumber.message}</p>}
//               </div>
//                  <button className='submit-button'>Submit</button>
//             </form>
//         </div>
//     </div>
//   )
// }

// export default Voter

