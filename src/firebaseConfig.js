import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC7YxMv3YSTCB6-0qKGvifK2cN_OYLuPxw",
  authDomain: "cast-solutions.firebaseapp.com",
  databaseURL: "https://cast-solutions-default-rtdb.firebaseio.com/",
  projectId: "cast-solutions",
  storageBucket: "cast-solutions.appspot.com",
  messagingSenderId: "373171539609",
  appId: "1:373171539609:web:48d6f29b431bfdfc55f208",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);