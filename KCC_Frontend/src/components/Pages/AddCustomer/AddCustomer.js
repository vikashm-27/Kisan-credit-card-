import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { SERVER_url } from "../../../config";
import {
  UserPlus,
  ShieldCheck,
  User,
  Phone,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Landmark,
  FileText,
  Check
} from "lucide-react";


import { useTranslation } from "react-i18next";
import "../shared/VerificationForm.css";
import "./AddCustomer.css";

const STEPS = [
  { id: 1, label: "Customer Info", icon: User },
  { id: 2, label: "Employment", icon: Briefcase },
  { id: 3, label: "Bank Details", icon: Landmark },
  { id: 4, label: "Preview", icon: FileText },
];

const AddCustomer = () => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [employmentType, setEmploymentType] = useState('salaried');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let user = localStorage.getItem("token");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    shouldUnregister: true,
    mode: "onTouched",
  });

  const nextStep = async () => {
    let fieldsToValidate = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['title', 'firstName', 'lastName', 'gender', 'options', 'phoneNumber', 'email'];
    } else if (currentStep === 2) {
      if (employmentType === 'salaried') {
        fieldsToValidate = ['employerName', 'employerType', 'netSalary', 'modeOfSalary', 'yearsInJob'];
      } else {
        fieldsToValidate = ['businessName', 'constitution', 'natureOfBusiness', 'annualTurnover', 'netProfit', 'premisesOwnership', 'yearsInBusiness'];
      }
    } else if (currentStep === 3) {
      fieldsToValidate = ['ifscCode', 'bankName', 'branchName', 'bankState', 'bankDistrict', 'bankType', 'accountType', 'accountNumber'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setValidationError("");
      setCurrentStep((prev) => prev + 1);
    } else {
       setValidationError(t('Please complete all required fields correctly.'));
       setTimeout(() => {
         const element = document.querySelector('.vf-error') || document.querySelector('.error');
         if (element) {
           element.scrollIntoView({ behavior: 'smooth', block: 'center' });
           element.focus?.();
         }
       }, 100);
    }
  };

  const prevStep = () => {
    setValidationError("");
    setCurrentStep((prev) => prev - 1);
  };

  const onInvalid = (formErrors) => {
    console.warn("Validation errors:", formErrors);
    const firstField = Object.keys(formErrors)[0];
    const message = formErrors[firstField]?.message || `Please check ${firstField}`;
    setValidationError(message);

    // Scroll to the first error element smoothly
    setTimeout(() => {
      const element = document.querySelector(`[name="${firstField}"]`) || document.querySelector('.vf-error') || document.querySelector('.error');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus?.();
      }
    }, 100);
  };

  const handleIfscChange = async (e) => {
    const code = e.target.value.toUpperCase();
    setValue('ifscCode', code, { shouldValidate: true });
    if (code.length === 11) {
      try {
        const response = await axios.get(`https://ifsc.razorpay.com/${code}`);
        const data = response.data;
        setValue('bankName', data.BANK || '', { shouldValidate: true });
        setValue('branchName', data.BRANCH || '', { shouldValidate: true });
        setValue('bankState', data.STATE || '', { shouldValidate: true });
        setValue('bankDistrict', data.DISTRICT || '', { shouldValidate: true });
      } catch (error) {
        console.error("Invalid IFSC or API error", error);
      }
    }
  };

  const onSubmit = async (data) => {
    setValidationError("");
    setIsSubmitting(true);
    try {
      const payload = { 
          ...data, 
          employmentType
      };
      const submitResponse = await axios.post(`${SERVER_url}/customerdetails`, payload);
      
      if (submitResponse.status === 200 && submitResponse.data.success) {
        const prevState = location.state || {};
        navigate("/customer/formgeneration", { state: { ...payload, ...prevState } });
      } else {
        setErrorMessage(t('add_customer.err_failed'));
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorMessage(t('add_customer.err_save'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vf-page add-cust-page">
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-blue">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <UserPlus size={14} />
              <span>Registration Module</span>
            </div>
            <h1 className="vf-header-title">{t('add_customer.title')}</h1>
            <p className="vf-header-desc">
              {t('add_customer.desc')}
            </p>
          </div>
        </div>
        <div className="vf-header-bg">
          <div className="vf-header-orb vf-header-orb-1" />
          <div className="vf-header-orb vf-header-orb-2" />
        </div>
      </div>

      <div className="vf-form-section add-cust-form-section">
        <div className={`vf-form-card add-cust-wide-card mounted`}>
          <div className="vf-form-card-header" style={{ justifyContent: "center", textAlign: "center", marginBottom: "15px" }}>
            <div className="vf-form-card-icon blue">
              <User size={20} />
            </div>
            <div>
              <h2 className="vf-form-card-title">{t('add_customer.info_title')}</h2>
              <p className="vf-form-card-subtitle">{t('add_customer.info_subtitle')}</p>
            </div>
          </div>

          <div className="vf-form-body">
            {/* Connected-Circle Stepper */}
            <div className="custom-stepper-container">
              {/* The background connecting line */}
              <div className="stepper-line-track">
                {/* Active Green Line overlay */}
                <div
                  className="stepper-line-progress"
                  style={{
                    width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {STEPS.map((step) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isClickable = step.id < currentStep;
                const IconComponent = isCompleted ? Check : step.icon;

                return (
                  <div
                    key={step.id}
                    className={`stepper-item ${isCurrent ? "active" : ""} ${
                      isCompleted ? "completed" : ""
                    }`}
                    onClick={() => {
                      if (isClickable) {
                        setValidationError("");
                        setCurrentStep(step.id);
                      }
                    }}
                    style={{ cursor: isClickable ? "pointer" : "default" }}
                    title={isClickable ? `Go back to ${step.label}` : undefined}
                  >
                    <div
                      className={`stepper-circle ${
                        currentStep >= step.id ? "active" : ""
                      }`}
                    >
                      <IconComponent size={20} />
                    </div>
                    <span
                      className={`stepper-label ${
                        currentStep >= step.id ? "active" : ""
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
              {errorMessage && (
                <div className="add-cust-alert-error">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: Customer Information */}
              <div className="step-section" style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                {/* Name Section */}
                  <div className="add-cust-form-grid">
                <div className="vf-field">
                  <label className="vf-label">
                    {t('add_customer_form.title_label')} <span className="vf-required">*</span>
                  </label>
                  <select
                    className={`vf-input ${errors.title ? "error" : ""}`}
                    {...register("title", {
                      required: "Required",
                      validate: (value) => value !== "select" || "Required",
                    })}
                  >
                    <option value="select">{t('add_customer_form.select_title')}</option>
                    <option value="Mr">Mr.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Mrs">Mrs.</option>
                  </select>
                </div>

                <div className="vf-field">
                  <label className="vf-label">
                    {t('add_customer_form.first_name')} <span className="vf-required">*</span>
                  </label>
                  <input
                    className={`vf-input ${errors.firstName ? "error" : ""}`}
                    placeholder={t('add_customer_form.first_name_ph')}
                    {...register("firstName", {
                      required: "First Name is required",
                      maxLength: {
                        value: 25,
                        message: "Max length is 25 characters",
                      },
                    })}
                  />
                  {errors.firstName && <span className="vf-error">{errors.firstName.message}</span>}
                </div>

                <div className="vf-field">
                  <label className="vf-label">{t('add_customer_form.middle_name')}</label>
                  <input
                    className="vf-input"
                    placeholder={t('add_customer_form.optional')}
                    {...register("middleName", {
                      maxLength: {
                        value: 25,
                        message: "Max length is 25 characters",
                      },
                    })}
                  />
                </div>

                <div className="vf-field">
                  <label className="vf-label">
                    {t('add_customer_form.last_name')} <span className="vf-required">*</span>
                  </label>
                  <input
                    className={`vf-input ${errors.lastName ? "error" : ""}`}
                    placeholder={t('add_customer_form.last_name_ph')}
                    {...register("lastName", {
                      required: "Last Name is required",
                      maxLength: {
                        value: 25,
                        message: "Max length is 25 characters",
                      },
                    })}
                  />
                  {errors.lastName && <span className="vf-error">{errors.lastName.message}</span>}
                </div>
              </div>

              {/* Gender and Category */}
              <div className="add-cust-form-grid grid-2">
                <div className="vf-field">
                  <label className="vf-label">
                    {t('add_customer_form.gender')} <span className="vf-required">*</span>
                  </label>
                  <div className="add-cust-radio-group">
                    <label className="add-cust-radio-item">
                      <input
                        type="radio"
                        value="male"
                        {...register("gender", { required: "Required" })}
                      />
                      <span>{t('add_customer_form.male')}</span>
                    </label>
                    <label className="add-cust-radio-item">
                      <input
                        type="radio"
                        value="female"
                        {...register("gender", { required: "Required" })}
                      />
                      <span>{t('add_customer_form.female')}</span>
                    </label>
                    <label className="add-cust-radio-item">
                      <input
                        type="radio"
                        value="other"
                        {...register("gender", { required: "Required" })}
                      />
                      <span>{t('add_customer_form.other')}</span>
                    </label>
                  </div>
                  {errors.gender && <span className="vf-error">{errors.gender.message}</span>}
                </div>

                <div className="vf-field">
                  <label className="vf-label">
                    {t('add_customer_form.category')} <span className="vf-required">*</span>
                  </label>
                  <select
                    className={`vf-input ${errors.options ? "error" : ""}`}
                    {...register("options", {
                      required: "Category is required",
                      validate: (value) => value !== "select" || "Category is required",
                    })}
                  >
                    <option value="select">{t('add_customer_form.select_category')}</option>
                    <option value="individual">Individual Identification</option>
                    <option value="public">Public Identification</option>
                    <option value="private">Private Identification</option>
                    <option value="proprietor">Proprietor Identification</option>
                  </select>
                  {errors.options && <span className="vf-error">{errors.options.message}</span>}
                </div>
              </div>

              {/* Contact Section */}
              <div className="add-cust-form-grid grid-2">
                <div className="vf-field">
                  <label className="vf-label">
                    {t('add_customer_form.phone_number')} <span className="vf-required">*</span>
                  </label>
                  <div className="vf-input-wrapper">
                    <input
                      className={`vf-input ${errors.phoneNumber ? "error" : ""}`}
                      placeholder={t('add_customer_form.phone_ph')}
                      {...register("phoneNumber", {
                        required: "Phone Number is required",
                        minLength: { value: 10, message: "Min length is 10 digits" },
                        pattern: {
                          value: /^\d{10}$/,
                          message: "Invalid format",
                        },
                      })}
                    />
                    <Phone className="add-cust-input-icon" size={16} />
                  </div>
                  {errors.phoneNumber && <span className="vf-error">{errors.phoneNumber.message}</span>}
                </div>

                <div className="vf-field">
                  <label className="vf-label">
                    {t('add_customer_form.email')} <span className="vf-required">*</span>
                  </label>
                  <div className="vf-input-wrapper">
                    <input
                      className={`vf-input ${errors.email ? "error" : ""}`}
                      placeholder={t('add_customer_form.email_ph')}
                      {...register("email", {
                        required: "Email ID is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message: "Invalid email",
                        },
                      })}
                    />
                    <Mail className="add-cust-input-icon" size={16} />
                  </div>
                  {errors.email && <span className="vf-error">{errors.email.message}</span>}
                </div>
              </div>
              </div>

              {/* STEP 2: Employment Section */}
              <div className="step-section" style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                <h3 className="vf-form-card-title" style={{ fontSize: '18px', marginBottom: '16px' }}>{t('employment_details.header')}</h3>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px', width: 'fit-content', margin: '0 auto 24px auto' }}>
                  <button 
                    type="button" 
                    onClick={() => setEmploymentType('salaried')}
                    style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', fontWeight: '500', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: employmentType === 'salaried' ? '#2563eb' : 'transparent', color: employmentType === 'salaried' ? 'white' : '#4b5563', boxShadow: employmentType === 'salaried' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                  >
                    {t('employment_details.salaried')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEmploymentType('self-employed')}
                    style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', fontWeight: '500', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: employmentType === 'self-employed' ? '#2563eb' : 'transparent', color: employmentType === 'self-employed' ? 'white' : '#4b5563', boxShadow: employmentType === 'self-employed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                  >
                    {t('employment_details.self_employed')}
                  </button>
                </div>

                {employmentType === 'salaried' && (
                  <div className="add-cust-form-grid grid-2">
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.employer_name')} <span className="vf-required">*</span></label>
                      <input className={`vf-input ${errors.employerName ? "error" : ""}`} placeholder={t('employment_details.employer_name_ph')} {...register("employerName", { required: "Employer Name is required" })} />
                      {errors.employerName && <span className="vf-error">{errors.employerName.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.employer_type')} <span className="vf-required">*</span></label>
                      <select className={`vf-input ${errors.employerType ? "error" : ""}`} {...register("employerType", { required: "Employer Type is required" })}>
                        <option value="">{t('employment_details.select_type')}</option>
                        <option value="govt">{t('employment_details.type_govt')}</option>
                        <option value="mnc">{t('employment_details.type_mnc')}</option>
                        <option value="pvt">{t('employment_details.type_pvt')}</option>
                      </select>
                      {errors.employerType && <span className="vf-error">{errors.employerType.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.net_salary')} <span className="vf-required">*</span></label>
                      <input className={`vf-input ${errors.netSalary ? "error" : ""}`} type="number" placeholder={t('employment_details.net_salary_ph')} {...register("netSalary", { required: "Net Monthly Salary is required" })} />
                      {errors.netSalary && <span className="vf-error">{errors.netSalary.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.mode_of_salary')} <span className="vf-required">*</span></label>
                      <select className={`vf-input ${errors.modeOfSalary ? "error" : ""}`} {...register("modeOfSalary", { required: "Mode of Salary is required" })}>
                        <option value="">{t('employment_details.select_mode')}</option>
                        <option value="bank">{t('employment_details.mode_bank')}</option>
                        <option value="cash">{t('employment_details.mode_cash')}</option>
                      </select>
                      {errors.modeOfSalary && <span className="vf-error">{errors.modeOfSalary.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.years_in_job')} <span className="vf-required">*</span></label>
                      <input className={`vf-input ${errors.yearsInJob ? "error" : ""}`} type="number" placeholder="e.g., 3" {...register("yearsInJob", { required: "Years in Job is required" })} />
                      {errors.yearsInJob && <span className="vf-error">{errors.yearsInJob.message}</span>}
                    </div>
                  </div>
                )}

                {employmentType === 'self-employed' && (
                  <div className="add-cust-form-grid grid-2">
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.business_name')} <span className="vf-required">*</span></label>
                      <input className={`vf-input ${errors.businessName ? "error" : ""}`} placeholder={t('employment_details.business_name_ph')} {...register("businessName", { required: "Business Name is required" })} />
                      {errors.businessName && <span className="vf-error">{errors.businessName.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.constitution')} <span className="vf-required">*</span></label>
                      <select className={`vf-input ${errors.constitution ? "error" : ""}`} {...register("constitution", { required: "Constitution is required" })}>
                        <option value="">{t('employment_details.select_type')}</option>
                        <option value="proprietor">Sole Proprietorship</option>
                        <option value="partnership">Partnership</option>
                        <option value="pvt_ltd">Private Limited</option>
                      </select>
                      {errors.constitution && <span className="vf-error">{errors.constitution.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.nature_of_business')} <span className="vf-required">*</span></label>
                      <select className={`vf-input ${errors.natureOfBusiness ? "error" : ""}`} {...register("natureOfBusiness", { required: "Nature of Business is required" })}>
                        <option value="">{t('employment_details.select_type')}</option>
                        <option value="agriculture">Agriculture / Allied</option>
                        <option value="trading">Trading / Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="services">Services</option>
                      </select>
                      {errors.natureOfBusiness && <span className="vf-error">{errors.natureOfBusiness.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.annual_turnover')} <span className="vf-required">*</span></label>
                      <input className={`vf-input ${errors.annualTurnover ? "error" : ""}`} type="number" placeholder="₹" {...register("annualTurnover", { required: "Annual Turnover is required" })} />
                      {errors.annualTurnover && <span className="vf-error">{errors.annualTurnover.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.net_profit')} <span className="vf-required">*</span></label>
                      <input className={`vf-input ${errors.netProfit ? "error" : ""}`} type="number" placeholder="₹" {...register("netProfit", { required: "Net Annual Profit is required" })} />
                      {errors.netProfit && <span className="vf-error">{errors.netProfit.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.premises')} <span className="vf-required">*</span></label>
                      <select className={`vf-input ${errors.premisesOwnership ? "error" : ""}`} {...register("premisesOwnership", { required: "Premises Ownership is required" })}>
                        <option value="">Select Ownership</option>
                        <option value="owned">Owned</option>
                        <option value="rented">Rented</option>
                      </select>
                      {errors.premisesOwnership && <span className="vf-error">{errors.premisesOwnership.message}</span>}
                    </div>
                    <div className="vf-field">
                      <label className="vf-label">{t('employment_details.years_in_business')} <span className="vf-required">*</span></label>
                      <input className={`vf-input ${errors.yearsInBusiness ? "error" : ""}`} type="number" placeholder="e.g., 5" {...register("yearsInBusiness", { required: "Years in Business is required" })} />
                      {errors.yearsInBusiness && <span className="vf-error">{errors.yearsInBusiness.message}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: Bank Details Section */}
              <div className="step-section" style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                <h3 className="vf-form-card-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Bank Details</h3>
                <div className="add-cust-form-grid grid-2">
                  <div className="vf-field">
                    <label className="vf-label">IFSC Code <span className="vf-required">*</span></label>
                    <input className={`vf-input ${errors.ifscCode ? "error" : ""}`} placeholder="e.g., SBIN0000001" {...register("ifscCode", { required: "IFSC Code is required", onChange: handleIfscChange })} />
                    {errors.ifscCode && <span className="vf-error">{errors.ifscCode.message}</span>}
                  </div>
                  <div className="vf-field">
                    <label className="vf-label">Bank Name <span className="vf-required">*</span></label>
                    <input className={`vf-input ${errors.bankName ? "error" : ""}`} placeholder="Bank Name" {...register("bankName", { required: "Bank Name is required" })} />
                    {errors.bankName && <span className="vf-error">{errors.bankName.message}</span>}
                  </div>
                  <div className="vf-field">
                    <label className="vf-label">Branch Name <span className="vf-required">*</span></label>
                    <input className={`vf-input ${errors.branchName ? "error" : ""}`} placeholder="Branch Name" {...register("branchName", { required: "Branch Name is required" })} />
                    {errors.branchName && <span className="vf-error">{errors.branchName.message}</span>}
                  </div>
                  <div className="vf-field">
                    <label className="vf-label">Bank State <span className="vf-required">*</span></label>
                    <input className={`vf-input ${errors.bankState ? "error" : ""}`} placeholder="Bank State" {...register("bankState", { required: "Bank State is required" })} />
                    {errors.bankState && <span className="vf-error">{errors.bankState.message}</span>}
                  </div>
                  <div className="vf-field">
                    <label className="vf-label">Bank District <span className="vf-required">*</span></label>
                    <input className={`vf-input ${errors.bankDistrict ? "error" : ""}`} placeholder="Bank District" {...register("bankDistrict", { required: "Bank District is required" })} />
                    {errors.bankDistrict && <span className="vf-error">{errors.bankDistrict.message}</span>}
                  </div>
                  <div className="vf-field">
                    <label className="vf-label">Bank Type <span className="vf-required">*</span></label>
                    <select className={`vf-input ${errors.bankType ? "error" : ""}`} {...register("bankType", { required: "Bank Type is required" })}>
                      <option value="">Select Bank Type</option>
                      <option value="public">Public Sector</option>
                      <option value="private">Private Sector</option>
                      <option value="cooperative">Co-operative</option>
                      <option value="rrb">RRB</option>
                    </select>
                    {errors.bankType && <span className="vf-error">{errors.bankType.message}</span>}
                  </div>
                  <div className="vf-field">
                    <label className="vf-label">Account Type <span className="vf-required">*</span></label>
                    <select className={`vf-input ${errors.accountType ? "error" : ""}`} {...register("accountType", { required: "Account Type is required" })}>
                      <option value="">Select Account Type</option>
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                      <option value="loan">Loan</option>
                    </select>
                    {errors.accountType && <span className="vf-error">{errors.accountType.message}</span>}
                  </div>
                  <div className="vf-field">
                    <label className="vf-label">Account Number <span className="vf-required">*</span></label>
                    <input className={`vf-input ${errors.accountNumber ? "error" : ""}`} type="text" placeholder="Account Number" {...register("accountNumber", { required: "Account Number is required" })} />
                    {errors.accountNumber && <span className="vf-error">{errors.accountNumber.message}</span>}
                  </div>
                </div>
              </div>

              {/* STEP 4: Preview & Submit */}
              <div className="step-section preview-section" style={{ display: currentStep === 4 ? 'block' : 'none', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                  <h3 className="vf-form-card-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Review Your Information</h3>
                  
                  <div className="preview-grid">
                    <div><strong>Name:</strong> {getValues('title')} {getValues('firstName')} {getValues('lastName')}</div>
                    <div><strong>Email:</strong> {getValues('email')}</div>
                    <div><strong>Phone:</strong> {getValues('phoneNumber')}</div>
                    <div><strong>Gender:</strong> {getValues('gender')}</div>
                    <div><strong>Category:</strong> {getValues('options')}</div>
                    <div><strong>Employment Type:</strong> {employmentType}</div>
                    {employmentType === 'salaried' ? (
                      <>
                        <div><strong>Employer:</strong> {getValues('employerName')}</div>
                        <div><strong>Net Salary:</strong> ₹{getValues('netSalary')}</div>
                      </>
                    ) : (
                      <>
                        <div><strong>Business:</strong> {getValues('businessName')}</div>
                        <div><strong>Turnover:</strong> ₹{getValues('annualTurnover')}</div>
                      </>
                    )}
                    <div><strong>Bank:</strong> {getValues('bankName')} ({getValues('ifscCode')})</div>
                    <div><strong>Account No:</strong> {getValues('accountNumber')}</div>
                  </div>
                </div>

              {/* Bottom Error Feedback */}
              {(validationError || errorMessage) && (
                <div className="add-cust-alert-error" style={{ margin: "20px 0 0 0" }}>
                  <AlertCircle size={18} />
                  <span>{validationError || errorMessage}</span>
                </div>
              )}

              <div className="form-navigation-buttons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                {currentStep > 1 ? (
                  <button type="button" onClick={prevStep} className="add-cust-back-btn">
                    <ChevronLeft size={18} />
                    <span>Back</span>
                  </button>
                ) : <div></div>}
                
                {currentStep < 4 && (
                  <button type="button" onClick={nextStep} className="vf-submit-btn blue add-cust-submit-btn">
                    <span>Next</span>
                    <ChevronRight size={18} />
                  </button>
                )}

                {currentStep === 4 && (
                  <button className="vf-submit-btn blue add-cust-submit-btn" type="submit" disabled={isSubmitting}>
                    <span>{isSubmitting ? "Processing..." : "Generate Application Form"}</span>
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="vf-security-footer add-cust-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            Customer data is stored securely in compliance with the RBI Digital Lending Guidelines.
            Encrypted during transit and at rest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
