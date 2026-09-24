import React, { useState } from "react";
import "../Offline/Offline.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const AadharUpload = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("aadharNumber", data.aadharNumber);
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://192.168.10.64:3003/upload", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      console.log("Server Response:", responseData);
      console.log(data);

      navigate("/display", { state: { responseData } });
    } catch (error) {
      console.error("Error occurred", error);
    }
  };

  return (
    <div className="card">
      <div className="card-container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>Offline KYC</h1>
          <div>
            <input
              type="text"
              placeholder="Enter Full Name"
              {...register("username", {
                required: "Username is required",
                pattern: {
                  value: /^[A-Za-z]+$/i,
                  message: "Username should only contain letters",
                },
                maxLength: {
                  value: 20,
                  message: "FullName must not exceed 20 characters",
                },
              })}
            />
            {errors.username && (
              <p className="error">{errors.username.message}</p>
            )}
            <input
              type="text"
              id="aadharNumber"
              name="aadharNumber"
              placeholder="Enter Aadhar Number"
              {...register("aadharNumber", {
                required: "Aadhar number is required",
                pattern: {
                  value: /^[2-9][0-9]{11}$/,
                  message: "Invalid Aadhar number",
                },
              })}
            />
            {errors.aadharNumber && (
              <p className="error">{errors.aadharNumber.message}</p>
            )}
            <div className="fileupload" style={{ marginLeft: "-30px" }}>
              <input
                type="file"
                id="file-upload-input"
                name="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AadharUpload;
