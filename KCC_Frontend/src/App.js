import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";
import LandingPage from "./components/Pages/LandingPage/LandingPage";
import Home from "./components/Home";
import Menubar from "./components/Menubar/Menubar.js";
import Chatbot from "./components/Chatbot/Chatbot.jsx";
import AddCustomer from "./components/Pages/AddCustomer/AddCustomer.js";
import Admin from "./components/Pages/Admin/Admin.jsx";
import UserManagement from "./components/Pages/UserManagement/UserManagement.jsx";
import DeleteCustomer from "./components/Pages/DeleteCustomer/DeleteCustomer.jsx";
import UpdateCustomer from "./components/Pages/UpdateCustomer/UpdateCustomer.jsx";
import DashBoard from "./components/Pages/Dashboard/DashBoard.jsx";
import Reports from "./components/Pages/Reports/Reports.jsx";
import Kyc from "./components/Pages/AddCustomer/Kyc.js";
import FormGeneration from "./components/Pages/AddCustomer/FormGeneration.js";
import AadharKyc from "./components/Pages/AadharKyc/AadharKyc.js";
import VoterIdKyc from "./components/Pages/VoterIdKyc/VoterIdKyc.js";
import PanCardKyc from "./components/Pages/PanKyc/PanCardKyc.js";
import ForgotPassword from "./components/Forgotpassword/Forgot_Password.js";
import ResetPassword from "./components/ResetPassword/Reset_Password.js";
import Twofactor from "./components/Twofactor/Twofactor.js";
import ErrorComponent from "./components/ErrorComponent/ErrorComponent.js";
import UserReports from "./components/Pages/Userlogs/UserReports.jsx";
import Gstin from "./components/Pages/GSTIN/Gstin.jsx";
import { GstInReports } from "./components/Pages/GSTIN Reports/GstInReports.jsx";
import { Cibil } from "./components/Pages/CIBIL/Cibil.jsx";
import KCCLandVerification from "./components/Pages/LandVerification/KCCLandVerification";
import CustomerWelcome from "./components/Pages/CustomerWelcome/CustomerWelcome.jsx";
import UserSessions from "./components/Pages/UserSessions/UserSessions.jsx";
import LoanCalculator from "./components/Pages/LoanCalculator/LoanCalculator.jsx";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resetpassword/:id/:token" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/twofactor" element={<Twofactor />} />
          <Route path="/home" element={<Home />} />
          <Route path="/customer" element={<Menubar />}>
            <Route index element={<CustomerWelcome />} />
            <Route
              path="/customer/land-verification"
              element={<KCCLandVerification />}
            />
            <Route path="/customer/addcustomer" element={<AddCustomer />} />
            <Route path="/customer/kyc" element={<Kyc />} />
            <Route path="/customer/cibil" element={<Cibil />} />
            <Route path="/customer/aadhar/kyc" element={<AadharKyc />} />
            <Route path="/customer/voterid/kyc" element={<VoterIdKyc />} />
            <Route path="/customer/pancard/kyc" element={<PanCardKyc />} />
            <Route path="/customer/gstin/kyc" element={<Gstin />} />
            <Route path="/customer/admin" element={<Admin />} />
            <Route path="/customer/admin/user-management" element={<UserManagement />} />
            <Route
              path="/customer/loan-calculator"
              element={<LoanCalculator />}
            />
            <Route
              path="/customer/deletecustomer"
              element={<DeleteCustomer />}
            />
            <Route
              path="/customer/updatecustomer"
              element={<UpdateCustomer />}
            />
            <Route path="/customer/dashboard" element={<DashBoard />} />
            <Route path="/customer/kyclogs" element={<Reports />} />
            <Route path="/customer/user/logs" element={<UserReports />} />
            <Route path="/customer/gstlogs" element={<GstInReports />} />
            <Route path="/customer/users" element={<UserSessions />} />
          </Route>
          <Route path="/customer/formgeneration" element={<FormGeneration />} />

          <Route path="*" element={<ErrorComponent />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
