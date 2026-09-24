import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { httpPostService } from "../httpHandler";
const initialState = {
  status: false,
  user: {},
  isPasswordValid: 0,
};
//login
export const authLogin = createAsyncThunk(
  "authentication/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await httpPostService("login", data);
      if (response.success) {
        localStorage.setItem("token", response.jwtToken);
        if (response.sessionId) {
          localStorage.setItem("sessionId", response.sessionId);
        }
        return response;
      } else {
        return rejectWithValue(response.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Server error occurred");
    }
  }
);

// Microsoft SSO login
export const authMicrosoftLogin = createAsyncThunk(
  "authentication/microsoftLogin",
  async (tokenData, { rejectWithValue }) => {
    try {
      const response = await httpPostService("authMicrosoft", tokenData);
      if (response.success) {
        localStorage.setItem("token", response.jwtToken);
        if (response.sessionId) {
          localStorage.setItem("sessionId", response.sessionId);
        }
        return response;
      } else {
        return rejectWithValue(response.message || "Microsoft Login failed");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Server error occurred");
    }
  }
);

//register
export const authRegister = createAsyncThunk(
  "authentication/register",
  async (data) => {
    const response = await httpPostService("register", data);
    return response;
  }
  
);
// Forgot Password action
export const authForgotPassword = createAsyncThunk("forgotPassword", async (data) => {
    const response = await httpPostService("forgotpassword", { email: data.email });
    return response;
  });
  
  // Reset Password action
export const authResetPassword = createAsyncThunk(
  'resetPassword',
  async ({ id, token, password }) => {
    const response = await httpPostService(`resetpassword/${id}/${token}`, { password });
    return response.data; // Adjust this if the response structure is different
  }
);

export const userdetails = createSlice({
  name: "userdetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authLogin.pending, (state) => {
        state.status = false;
      })
      .addCase(authLogin.fulfilled, (state, action) => {
        state.status = true;
        state.user = action.payload;

        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(authMicrosoftLogin.pending, (state) => {
        state.status = false;
      })
      .addCase(authMicrosoftLogin.fulfilled, (state, action) => {
        state.status = true;
        state.user = action.payload;

        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(authRegister.pending, (state) => {
        state.status = false;
      })
      .addCase(authRegister.fulfilled, (state, action) => {
        state.status = true;
        // state.user = action.payload;
      })
      .addCase(authForgotPassword.pending, (state) => {
        state.forgotPasswordStatus = 'loading';
      })
      .addCase(authForgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordStatus = action.payload.success ? 'succeeded' : 'failed';
      })
      .addCase(authResetPassword.pending, (state) => {
        state.resetPasswordStatus = 'loading';
      })
      .addCase(authResetPassword.fulfilled, (state, action) => {
        state.status = true;
        // state.resetPasswordStatus='flase';
      });
  },
});

export const userData = (state) => state.userInfo;
export default userdetails.reducer;
