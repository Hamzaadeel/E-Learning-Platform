import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC1vbEwEYm9HjA8Q-Fol9oPEmc2VW0FyVw",
  authDomain: "e-learning-platform-ca3d7.firebaseapp.com",
  projectId: "e-learning-platform-ca3d7",
  storageBucket: "e-learning-platform-ca3d7.appspot.com",
  messagingSenderId: "342956020366",
  appId: "1:342956020366:web:962673b8bde805e29c6fdf",
  measurementId: "G-2D0YNZ5Y2R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
