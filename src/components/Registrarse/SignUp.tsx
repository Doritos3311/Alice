"use client"; // Asegúrate de que este componente se ejecute en el cliente

import React, { useState } from "react";
import { auth } from "../Firebase/firebase"; // Importa desde firebase.js
import { createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from "../hooks/use-toast"; // Asegúrate de que la ruta de importación sea correcta
import { useRouter } from "next/navigation"; // Importa useRouter para la navegación

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Inicializa useRouter

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica de campos
    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      // Crear usuario con Firebase
      await createUserWithEmailAndPassword(auth, email, password);

      // Mostrar notificación de éxito
      toast({
        title: "Registro exitoso",
        description: "Te has registrado correctamente.",
        variant: "default",
      });

      // Limpiar el formulario después del registro exitoso
      setEmail("");
      setPassword("");
      setError("");

      // Redirigir a la página principal después del registro exitoso
      router.push("/"); // Cambia "/" por la ruta que desees
    } catch (error: any) {
      // Manejo de errores
      console.error("Error al registrar usuario:", error);

      // Mostrar notificación de error
      toast({
        title: "Error",
        description: error.message || "Error al registrar usuario.",
        variant: "destructive",
      });

      // Mostrar el error en la interfaz
      setError(error.message || "Error al registrar usuario.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Registrarse</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default SignUp;