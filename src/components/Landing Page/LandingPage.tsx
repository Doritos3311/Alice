import React, { useEffect, useRef  } from "react";

import Link from 'next/link';

//Estilop
import styles from "./LandingPage.module.css";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, LogOut, Check, ChartColumnBig, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc"
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  getAuth,
} from "firebase/auth"
import { toast } from "../hooks/use-toast";
import { FirebaseError, initializeApp } from "firebase/app"
import { useTheme } from "next-themes"

const firebaseConfig = {
  apiKey: "AIzaSyBl1TjSQX82qh60XGIHEtp_i9RCoTTFv_w",
  authDomain: "alice-a2dc3.firebaseapp.com",
  projectId: "alice-a2dc3",
  storageBucket: "alice-a2dc3.appspot.com",
  messagingSenderId: "543545407777",
  appId: "1:543545407777:web:65ab15a1f7f48c92336660",
  measurementId: "G-Y6TF6TB2HJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface LandingPageProps {
  theme: string;
  user: any;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  setIsLogOutModalOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  onUpdateUserType: (newType: 'personal' | 'empresa') => void; // Añadir aquí
}

const LandingPage: React.FC<LandingPageProps> = ({ user, setActiveTab }) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showLogIn, setShowLogIn] = useState(false)
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState(false);
  const { setTheme, theme } = useTheme()

  const plans = [
    {
      name: "Plan Gratuito por 7 Días",
      price: "Gratis",
      duration: "por 7 días",
      features: [
        "Acceso completo a todas las funciones de la aplicación",
        "Inteligencia Artificial activa, con recomendaciones personalizadas",
        "Posibilidad de gestionar finanzas, inventario y facturación",
        "Personalización completa de apartados según las necesidades del usuario",
        "Puedes cancelar en cualquier momento antes de que finalice el periodo de prueba",
      ],
      note: "Al finalizar los 7 días, se activa automáticamente el Plan Mensual si no se cancela.",
    },
    {
      name: "Plan Mensual",
      price: "$10",
      duration: "al mes",
      features: [
        "Acceso a todas las funciones de la aplicación",
        "Inteligencia Artificial activa, proporcionando recomendaciones personalizadas",
        "Funcionalidades completas para gestionar finanzas, inventario y facturación",
        "Apartados personalizables para adaptarse a las necesidades de cada microemprendedor",
        "Soporte técnico prioritario",
      ],
    },
    {
      name: "Plan Anual",
      price: "$100",
      duration: "al año",
      features: [
        "Acceso a todas las funciones de la aplicación",
        "Inteligencia Artificial activa, con recomendaciones avanzadas",
        "Gestión completa de finanzas, inventario y facturación",
        "Personalización completa de apartados para una mejor adaptación a cada negocio",
        "Soporte técnico prioritario y actualizaciones incluidas durante todo el año",
        "Ahorro del 20% en comparación con el plan mensual",
      ],
    },
  ]

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión con Google.",
      })
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al iniciar sesión con Google. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para manejar el inicio de sesión
  const handleSignIn = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
        variant: "default",
      });
      setShowLogIn(false);
    } catch (error) {
      // Verifica si el error es de tipo FirebaseError
      if (error instanceof FirebaseError) {
        let errorMessage = "Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.";
  
        if (error.code === "auth/user-not-found") {
          errorMessage = "El correo electrónico no está registrado. ¿Quieres registrarte?";
        } else if (error.code === "auth/wrong-password") {
          errorMessage = "La contraseña es incorrecta. Inténtalo de nuevo.";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage = "Demasiados intentos fallidos. Inténtalo de nuevo más tarde.";
        }
  
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Si el error no es de Firebase, muestra un mensaje genérico
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleShowLogIn = () => {
    setShowLogIn(true)
  }

 // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await auth.signOut()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`${styles.landing_page}`}>

      {/* Nanvar */}
      <header className={`${styles.header} ${theme === "light" ? styles.themeNanvar : styles.themeDarkNanvar}`}>
        
        <div className={styles.logo}>Alice</div>

        <nav className={styles.nav}>
          <a href="#sectionIniced" className={styles.nav_link}>
            Inicio
          </a>
          <a href="#features" className={styles.nav_link}>
            Características
          </a>
          <a href="#pricing" className={styles.nav_link}>
            Precios
          </a>
          <a href="#pricing" className={styles.nav_link}>
            Contacto
          </a>
          {user ? (
            <div className={styles.user_profile}>
              <Popover>
                <PopoverTrigger asChild >
                  <Button variant="ghost" className={styles.user_button}>
                    <Avatar className={styles.avatar}>
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"}/>
                      <AvatarFallback className={styles.avatarImg}>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                    </Avatar>
                    <span className={styles.user_name}>{user.displayName || user.email}</span>
                  </Button>
                </PopoverTrigger>
                
                <PopoverContent className={`${styles.popover_content}`}>
                  <div className={styles.user_info}>
                    <Avatar className={styles.avatar_large}>
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                      <AvatarFallback className={styles.avatar_fallback}>
                        {user.displayName ? user.displayName[0] : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className={styles.user_display_name}>{user.displayName || "Usuario"}</h3>
                      <p className={styles.user_email}>{user.email}</p>
                    </div>
                  </div>
                  <div className={styles.divider}></div>
                  <Link href="/app" passHref>
                    <Button variant="ghost" size="sm" className={styles.menu_button}>
                      <ChartColumnBig className={styles.icon} />
                      Contabilidad
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className={styles.menu_buttonContent} onClick={() => {setActiveTab("configuracion");}}>
                    <Settings className={styles.icon} />
                    Configuracion
                  </Button>
                  <div className={styles.divider}></div>
                  <Button variant="ghost" size="sm" className={styles.menuitemlogout} onClick={() => setIsLogOutModalOpen(true)}>
                    <LogOut className={styles.icon} />
                    Cerrar sesión
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className={styles.login_button}>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={handleShowLogIn} variant="link" className={`${styles.login_link}`}>
                    Iniciar Sesión
                  </Button>
                </DialogTrigger>
                {showLogIn && (
                  <DialogContent className={styles.dialog_content}>
                    <DialogHeader>
                      <DialogTitle className={styles.dialog_title}>Iniciar Sesión</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSignIn} className={styles.login_form}>
                      <Input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${styles.input} ${theme === "light" ? styles.input : styles.inputDark}`}
                      />
                      <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                      />
                      <Button
                        onClick={handleShowLogIn}
                        variant="link"
                        className={`${styles.login_link}`}
                      >
                        Iniciar Sesión
                      </Button>
                    </form>
                    <div className={styles.signup_link}>
                      <p>¿No tienes una cuenta?</p>
                      <Link href="/registro" passHref>
                        <Button variant="link" className={styles.signup_button}>
                          Registrarse
                        </Button>
                      </Link>
                    </div>
                    <div className={styles.google_button}>
                      <Button onClick={handleGoogleLogin} variant="outline" className={styles.google_login}>
                        <FcGoogle className={styles.google_icon} />
                        Continuar con Google
                      </Button>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
              <Link href="/registro" passHref>
                <Button onClick={handleShowLogIn} variant="link" className={`${styles.register_link}`}>
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className={styles.main_content}>

        <div id="sectionIniced" className={styles.sectionIniced}>
          <section className={styles.hero}>
            <h1 className={styles.hero_title}>Alice: Tu Software de Contabilidad</h1>
            <p>Optimiza tu contabilidad con un sistema moderno y eficiente.</p>
            {user ? (
              // Si el usuario existe, muestra este botón
              <Button className={styles.cta_button}>
                Explorar Funciones
              </Button>
            ) : (
              // Si el usuario no existe, muestra este botón
              <Button className={styles.cta_button} onClick={() => setIsLogOutModalOpen(true)}>
                Iniciar Sesión
              </Button>
            )}
          </section>
        </div>

        <section id="features" className={styles.features}>
          <h2>Funciones Principales</h2>
          <div className={styles.feature_grid}>
            <div className={styles.feature_card}>
              <h3>Registro de Inventario</h3>
              <p>Controla el stock de tu negocio en tiempo real.</p>
              <div className={styles.image_placeholder}></div>
            </div>
            <div className={styles.feature_card}>
              <h3>Facturación</h3>
              <p>Genera y administra facturas de forma automatizada.</p>
              <div className={styles.image_placeholder}></div>
            </div>
            <div className={styles.feature_card}>
              <h3>Libro Diario</h3>
              <p>Registra todas tus transacciones de manera organizada.</p>
              <div className={styles.image_placeholder}></div>
            </div>
            <div className={styles.feature_card}>
              <h3>Registro de Servicios</h3>
              <p>Gestiona los servicios ofrecidos con información detallada.</p>
              <div className={styles.image_placeholder}></div>
            </div>
          </div>
        </section>

        <section id="pricing" className={styles.pricing}>
          <h2>Planes de Precios</h2>
          <div className={styles.pricingGrid}>
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`${styles.planCard} ${index === 1 ? styles.highlighted : ''}`}
              >
                <CardHeader className={styles.cardHeader}>
                  <CardTitle className={styles.cardTitle}>{plan.name}</CardTitle>
                  <p className={styles.price}>{plan.price}</p>
                  <p className={styles.duration}>{plan.duration}</p>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className={styles.featureItem}>
                        <Check className={styles.icon} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.note && <p className={styles.note}>{plan.note}</p>}
                </CardContent>
                <CardFooter className={styles.cardFooter}>
                  <Button className={styles.button}>Seleccionar Plan</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className={styles.footer}>© 2024 Alice. Todos los derechos reservados.</footer>

      {/* Modal Inicio Sesion */}
      <Dialog open={isLogOutModalOpen} onOpenChange={setIsLogOutModalOpen}>
        <DialogContent className={styles.logout_dialog}>
          <DialogHeader>
            <DialogTitle className={styles.logout_title}>¿Cerrar Sesión?</DialogTitle>
            <DialogDescription className={styles.logout_description}>
              Confirma el cierre de la sesión actual
            </DialogDescription>
          </DialogHeader>
          <div className={styles.logout_buttons}>
            <Button
              className={styles.confirm_button}
              onClick={() => {
                handleLogout();
                setIsLogOutModalOpen(false);
              }}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default LandingPage;