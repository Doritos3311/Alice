import React, { useEffect, useRef  } from "react";

//Estilop
import "./LandingPage.css";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, LogOut, Check, ChartColumnBig } from "lucide-react"
import UserProfile from "../UserProfile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc"
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
} from "firebase/auth"
import { toast } from "../../hooks/use-toast";
import { initializeApp } from "firebase/app"

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
  setShowLandingPage: (show: boolean) => void;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  setIsLogOutModalOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  onUpdateUserType: (newType: 'personal' | 'empresa') => void; // Añadir aquí
}


const LandingPage: React.FC<LandingPageProps> = ({theme, user, setShowLandingPage, setActiveTab }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showInice, setShowInice] = useState(true)
  const [showPricing, setShowPricing] = useState(false)
  const [showLogIn, setShowLogIn] = useState(false)
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; r: number; speedX: number; speedY: number }[] = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada.",
      })
    } catch (error) {
      console.error("Error al registrarse:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al crear tu cuenta. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión con éxito.",
      })
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al iniciar sesión. Por favor, verifica tus credenciales e intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleShowInice = () => {
    setShowInice(true)
    setShowPricing(false)
  }

  const handleShowPricing = () => {
    setShowPricing(true)
    setShowInice(false)
  }

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
    <div className={`landing-page ${theme}`}>

      {/* Nanvar */}
      <header className="header">
        {user ? (
          <div className="logo">Alice</div>
        ) : (
          <div className="logo">A</div>
        )}

        <nav className="nav">
          <Button onClick={handleShowInice} variant="link" className="nav-link">
            Inicio
          </Button>
          <Button onClick={handleShowInice} variant="link" className="nav-link">
            Características
          </Button>
          <Button onClick={handleShowPricing} variant="link" className="nav-link">
            Precios
          </Button>
          <a href="#" className="nav-link">
            Contacto
          </a>
          {user ? (
            <div className="user-profile">
              <Popover>
                <PopoverTrigger asChild >
                  <Button variant="ghost" className="user-button">
                    <Avatar className="avatar">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                      <AvatarFallback>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                    </Avatar>
                    <span className="user-name">{user.displayName || user.email}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="popover-content">
                  <div className="user-info">
                    <Avatar className="avatar-large">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                      <AvatarFallback className="avatar-fallback">
                        {user.displayName ? user.displayName[0] : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="user-display-name">{user.displayName || "Usuario"}</h3>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <Button variant="ghost" size="sm" className="menu-button" onClick={() => setShowLandingPage(true)}>
                    <ChartColumnBig className="icon" />
                    Contabilidad
                  </Button>
                  <div className="divider"></div>
                  <Button variant="ghost" size="sm" className="menuitemlogout" onClick={() => setIsLogOutModalOpen(true)}>
                    <LogOut className="icon" />
                    Cerrar sesión
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="login-button">
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={handleShowLogIn} variant="link" className="login-link">
                    Iniciar Sesión
                  </Button>
                </DialogTrigger>
                {showLogIn && (
                  <DialogContent className="dialog-content">
                    <DialogHeader>
                      <DialogTitle className="dialog-title">Iniciar Sesión</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSignIn} className="login-form">
                      <Input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                      />
                      <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                      />
                      <Button type="submit" className="submit-button">
                        Iniciar Sesión
                      </Button>
                    </form>
                    <div className="signup-link">
                      <p>¿No tienes una cuenta?</p>
                      <Button variant="link" onClick={handleSignUp} className="signup-button">
                        Registrarse
                      </Button>
                    </div>
                    <div className="google-button">
                      <Button onClick={handleGoogleLogin} variant="outline" className="google-login">
                        <FcGoogle className="google-icon" />
                        Continuar con Google
                      </Button>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          )}
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="main-content">

        <div className="sectionIniced">
          <section className="hero">
            <h1 className="hero-title">Alice: Tu Software de Contabilidad</h1>
            <p>Optimiza tu contabilidad con un sistema moderno y eficiente.</p>
            <Button className="cta-button">Explorar Funciones</Button>
          </section>
        </div>

        <section className="features">
          <h2>Funciones Principales</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Registro de Inventario</h3>
              <p>Controla el stock de tu negocio en tiempo real.</p>
              <div className="image-placeholder"></div>
            </div>
            <div className="feature-card">
              <h3>Facturación</h3>
              <p>Genera y administra facturas de forma automatizada.</p>
              <div className="image-placeholder"></div>
            </div>
            <div className="feature-card">
              <h3>Libro Diario</h3>
              <p>Registra todas tus transacciones de manera organizada.</p>
              <div className="image-placeholder"></div>
            </div>
            <div className="feature-card">
              <h3>Registro de Servicios</h3>
              <p>Gestiona los servicios ofrecidos con información detallada.</p>
              <div className="image-placeholder"></div>
            </div>
          </div>
        </section>

        <section className="pricing">
          <h2>Planes de Precios</h2>
          <div className="pricing-grid">
            <div className="plan-card">
              <h3>Plan Gratuito</h3>
              <p>Prueba todas las funciones durante 7 días sin costo.</p>
            </div>
            <div className="plan-card">
              <h3>Plan Mensual</h3>
              <p>Accede a todas las funciones por $10 al mes.</p>
            </div>
            <div className="plan-card">
              <h3>Plan Anual</h3>
              <p>Obtén un descuento especial pagando $100 al año.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">© 2024 Alice. Todos los derechos reservados.</footer>

      {/* Modal Inicio Sesion */}
      <Dialog open={isLogOutModalOpen} onOpenChange={setIsLogOutModalOpen}>
        <DialogContent className="logout-dialog">
          <DialogHeader>
            <DialogTitle className="logout-title">¿Cerrar Sesión?</DialogTitle>
            <DialogDescription className="logout-description">Confirma el cierre de la sesión actual</DialogDescription>
          </DialogHeader>
          <div className="logout-buttons">
            <Button
              className="confirm-button"
              onClick={() => {
                handleLogout()
                setIsLogOutModalOpen(false)
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