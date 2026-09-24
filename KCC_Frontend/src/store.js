import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Reducers/Auth";

const store = configureStore({
  reducer: {
    userInfo: authReducer,
  },
});

export default store;
