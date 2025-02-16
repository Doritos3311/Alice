"use client"

{/*
  REQUERIMIENTOS: 
    Node.js Instalado
    Descargar libreria de OpenAI, unicamente si es descargado de GitHub
    Firebase instalado

  Iniciar Host Local
  Abrir Terminal: Crl+ñ
  Comando ejecutar: npm run dev
  Generar carpeta ejecutable(Despues de la finalizacion del proyecto): npm run build

  Descarga Openai:
  Comando ejecutable en Carpeta Main: npm install openai
  Reiniciar "Entorno de desarrollo integrado (IDE)"
*/}

{/* Importacion de Librerias */}
import { useState, useEffect } from "react"
import React from "react";

import AppContent from "../components/AppContent"
import LandingPage from "@/components/Landing Page/LandingPage";

//Enrutamiento


// Importaciones de Firebase
import { initializeApp } from "firebase/app"
import { getAuth, User } from "firebase/auth"
import { useAuthState } from "react-firebase-hooks/auth"


// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBl1TjSQX82qh60XGIHEtp_i9RCoTTFv_w",
  authDomain: "alice-a2dc3.firebaseapp.com",
  projectId: "alice-a2dc3",
  storageBucket: "alice-a2dc3.appspot.com",
  messagingSenderId: "543545407777",
  appId: "1:543545407777:web:65ab15a1f7f48c92336660",
  measurementId: "G-Y6TF6TB2HJ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Nota: Elimine la inicialización de analytics para evitar el error en entornos sin soporte para cookies

{/* Definicion de Tipos */}

//Autenticacion de Inicio de Sesion
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    console.log("Usuario autenticado con UID:", uid);

    // Aquí puedes llamar a las funciones para obtener o guardar datos
  } else {
    console.log("Ningún usuario autenticado.");
  }
});


{/* Configuracion de Items */}

export default function ContabilidadApp() {

  {/* Declaracion de Estados */}

  // Estado que controla la app o la landing page
  const [isClient, setIsClient] = useState(false);

  {/* Estado de tipo de Data */}

  // Estado de autenticación Landing Page
  const [user] = useAuthState(auth);

  // Estado para Modo Nocturno
  const [theme, setTheme] = React.useState('dark');

  const [isLoading, setIsLoading] = useState(true);

  {/* Funciones */}

  // Simula un tiempo de carga
  useEffect(() => {
    if (theme == "dark" || theme == "light") {
      console.log(theme)
    } else {
      setTheme("dark"); // Define el tema por defecto si no hay uno establecido
    }
    // Importar y registrar el componente grid de ldrs solo en el cliente
    import('ldrs').then(({ grid }) => {
      grid.register();
    });

    // Simula un tiempo de carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 segundos de carga

    return () => clearTimeout(timer); // Limpia el timer al desmontar el componente
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Evita renderizar en el servidor

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <l-grid size="160" speed="1.5" color="white"></l-grid>
      </div>
    );
  }

  return (
    <LandingPage
      theme={theme || "dark"}
      user={user}
      setIsLoginModalOpen={() => {}}
      setIsLogOutModalOpen={() => {}}
      setActiveTab={() => {}}
      onUpdateUserType={(newType) => console.log(newType)}
    />
  );
}