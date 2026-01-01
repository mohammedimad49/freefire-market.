// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6JrAc6pjWVhCWjB_sy__vCwKP5WtZFZI",
  authDomain: "freefire-market-e5467.firebaseapp.com",
  projectId: "freefire-market-e5467",
  storageBucket: "freefire-market-e5467.firebasestorage.app",
  messagingSenderId: "709503936604",
  appId: "1:709503936604:web:c8e78641ca29d3e77dde99",
  measurementId: "G-B9C97HCBEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
