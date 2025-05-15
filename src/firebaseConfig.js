import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

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
const database = getDatabase(app);
const auth = getAuth(app); 

export { database, auth }; 