import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhy-n0-wKJO_JQbvmesEwphjmh7hP-6O8",
  authDomain: "kisan-credit-card-d8fd3.firebaseapp.com",
  projectId: "kisan-credit-card-d8fd3",
  storageBucket: "kisan-credit-card-d8fd3.appspot.com",
  messagingSenderId: "311672637975",
  appId: "1:311672637975:web:a3aea2aba41fe00d2e6a52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const googleAuthProvider = new GoogleAuthProvider();

export default app;