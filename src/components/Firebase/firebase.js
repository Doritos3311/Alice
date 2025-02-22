// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBl1TjSQX82qh60XGIHEtp_i9RCoTTFv_w",
  authDomain: "alice-a2dc3.firebaseapp.com",
  projectId: "alice-a2dc3",
  storageBucket: "alice-a2dc3.appspot.com",
  messagingSenderId: "543545407777",
  appId: "1:543545407777:web:65ab15a1f7f48c92336660",
  measurementId: "G-Y6TF6TB2HJ",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtén la instancia de autenticación
const auth = getAuth(app);

// Proveedor de Google
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider }; // Exporta auth y el proveedor de Google