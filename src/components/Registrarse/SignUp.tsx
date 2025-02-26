// SignUp.js
"use client";

import React, { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../Firebase/firebase"; // Importa auth y googleProvider
import { toast } from "../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Importa useRouter
import { motion } from "framer-motion"; // Importa motion desde framer-motion
import styles from "./SingUp.module.css"; // Importa los estilos CSS Modules
import { Toaster } from "../ui/toaster";

// Componente para los paths animados del fondo
const FloatingPaths = ({ position }: { position: number }) => {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}> {/* Fondo detrás de todo */}
      <svg className="w-full h-full text-slate-950 dark:text-white" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si el usuario está autenticado, redirige a la ruta "/"
        router.push("/");
      }
    });

    // Limpia el listener cuando el componente se desmonta
    return () => unsubscribe();
  }, [router]);

  const handleSignUp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Registro exitoso",
        description: "Te has registrado correctamente.",
        variant: "default",
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        let errorMessage = "Hubo un problema al registrarse. Por favor, intenta de nuevo.";

        if (error.code === "auth/email-already-in-use") {
          errorMessage = "El correo electrónico ya está en uso. ¿Quieres iniciar sesión?";
        } else if (error.code === "auth/weak-password") {
          errorMessage = "La contraseña es demasiado débil. Usa al menos 6 caracteres.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: "Registro exitoso",
        description: "Te has registrado con Google correctamente.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al registrarse con Google. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={styles.container}>

      <div>
        <Toaster/>
      </div>

      {/* Fondo animado */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Contenido del formulario */}
      <header className={styles.header}>
        <Link href="/" passHref>
          <div className={styles.logo}>Alice</div>
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.cardContainer}
        style={{ zIndex: 10 }}
      >
        <h2 className={styles.title}>Registrarse</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSignUp} className={styles.form}>
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <Button type="submit" className={styles.submit_button}>
            Registrarse
          </Button>
        </form>
        <div className={styles.separator}>
          <span>o</span>
        </div>
        <div className={styles.google_button}>
          <Button onClick={handleGoogleSignUp} variant="outline" className={styles.google_login}>
            <FcGoogle className={styles.google_icon} />
            Registrarse con Google
          </Button>
        </div>
        <div className={styles.login_link}>
          <p>¿Ya tienes una cuenta?</p>
          <Link href="/" passHref>
            <Button variant="link" className={styles.login_button}>
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;