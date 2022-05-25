import {initializeApp} from "firebase/app";

// TODO: Documentation for third parties performing self-hosting.
const firebaseConfig = {
  apiKey: "AIzaSyBnukWeCiIuA0GtK1SV5Nqg8yM3ivPFVNw",
  authDomain: "conote-59b80.firebaseapp.com",
  databaseURL: "https://conote-59b80-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "conote-59b80",
  storageBucket: "conote-59b80.appspot.com",
  messagingSenderId: "880007361431",
  appId: "1:880007361431:web:d0853c7ae10622cfc3cad2",
  measurementId: "G-X312DX9T0T"
};

export const app = initializeApp(firebaseConfig);