'use client'

import { useState } from 'react'

import { toast } from "@/hooks/use-toast"
import { initializeApp } from "firebase/app"
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { FcGoogle } from "react-icons/fc"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBl1TjSQX82qh60XGIHEtp_i9RCoTTFv_w",
  authDomain: "alice-a2dc3.firebaseapp.com",
  projectId: "alice-a2dc3",
  storageBucket: "alice-a2dc3.appspot.com",
  messagingSenderId: "543545407777",
  appId: "1:543545407777:web:65ab15a1f7f48c92336660",
  measurementId: "G-Y6TF6TB2HJ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function LandingPage() {

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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showInice, setShowInice] = useState(true)
  const [showPricing, setShowPricing] = useState(false)
  const [showLogIn, setShowLogIn] = useState(false)

  // Function to handle Google login
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

  // Function to handle email/password sign up
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

  // Function to handle email/password sign in
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
    setShowInice(true);
    setShowPricing(false);
  };
  
  const handleShowPricing = () => {
    setShowPricing(true);
    setShowInice(false);
  };

  const handleShowLogIn = () => {
    setShowLogIn(true);
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col">

      {/* Cabecera o Nav */}
      <header className="bg-gray-200 p-4 flex justify-between items-center rounded-lg shadow-lg">
        <div className="text-2xl font-bold">Logo</div>

        {/* Nav */}
        <nav className="flex items-center space-x-4">
        <Button onClick={handleShowInice} variant="link" className="hover:text-purple-400">Inicio</Button>
          <Button onClick= {handleShowInice} variant="link" className="hover:text-purple-400">Características</Button>
          <Button onClick= {handleShowPricing} variant="link" className="hover:text-purple-400">Precios</Button>
          <a href="#" className="hover:text-purple-400">Contacto</a>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick= {handleShowLogIn} variant="link" className="bg-black hover:bg-gray-800 text-white border border-gray-600">Iniciar Sesión</Button>
            </DialogTrigger>
            
            {showLogIn && (
              <DialogContent className="sm:max-w-[425px] bg-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center text-black">Iniciar Sesión</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-300 text-black"
                  />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-300 text-black"
                  />
                  <Button type="submit" className="w-full bg-black flex items-center justify-center text-white border border-black">
                    Iniciar Sesión
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-black">¿No tienes una cuenta?</p>
                  <Button variant="link" onClick={handleSignUp} className="text-blue-400 hover:text-black">
                    Registrarse
                  </Button>
                </div>
                <div className="mt-4">
                  <Button onClick={handleGoogleLogin} variant="outline" className="bg-black w-full flex items-center justify-center text-white border border-black">
                    <FcGoogle className="mr-2" />
                    Continuar con Google
                  </Button>
                </div>
              </DialogContent>
            )}   
          </Dialog>
        </nav>
        
      </header>

      {/* Contenido Principal */}
      <main className="flex-grow flex items-center justify-center px-4">
        
        {/* Inicio */}
        {showInice && (
          <div className="mx-auto w-full flex flex-col items-center gap-8">
            <h1 className="text-5xl font-bold mb-4">Simplifica tu Contabilidad y Administración</h1>
            <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-8">
              
              {/* Lado Izquierdo */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-xl mb-6">Una herramienta accesible y personalizable diseñada para microemprendedores, que transforma la gestión financiera en una tarea sencilla y efectiva.</p>
              </div>

              {/* Lado Derecho */}
              <div className="flex-1 bg-gray-200 p-8 rounded-lg shadow-lg h-66">

                <h2 className="text-2xl font-bold mb-6 text-center mb-4">Únete a nosotros</h2>
                <p className="text-xl mb-6">Con Alice, lleva tu negocio hacia adelante con un buen manejo de contabilidad.</p>
                <div className="flex items-center justify-center mb-40">
                  <Dialog>
                    <DialogTrigger asChild>
                    <Button onClick= {handleShowLogIn} variant="link" className="bg-black hover:bg-gray-800 text-white border border-gray-600">Comienza Ya </Button>
                    </DialogTrigger>

                    {showLogIn && (
                      <DialogContent className="sm:max-w-[425px] bg-gray-200">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-center text-black">Iniciar Sesión</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSignIn} className="space-y-4">
                          <Input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-300 text-black"
                          />
                          <Input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-300 text-black"
                          />
                          <Button type="submit" className="w-full bg-black flex items-center justify-center text-white border border-black">
                            Iniciar Sesión
                          </Button>
                        </form>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-black">¿No tienes una cuenta?</p>
                          <Button variant="link" onClick={handleSignUp} className="text-blue-400 hover:text-black">
                            Registrarse
                          </Button>
                        </div>
                        <div className="mt-4">
                          <Button onClick={handleGoogleLogin} variant="outline" className="bg-black w-full flex items-center justify-center text-white border border-black">
                            <FcGoogle className="mr-2" />
                            Continuar con Google
                          </Button>
                        </div>
                      </DialogContent>
                    )} 

                  </Dialog>
                </div>
              </div>
              
            </div>
          </div>
        )}

        {/* Caracteristicas */}

      </main>

      {/* Apartado de Planes */}
      {showPricing && (
        <div className="container mx-auto py-16 px-4">
          <h1 className="text-5xl font-bold text-center mb-16">Nuestros Planes</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {plans.map((plan, index) => (
              <Card key={index} className={`w-full h-full flex flex-col justify-between ${index === 1 ? 'border-2 border-black' : ''}`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl font-bold mb-4">{plan.name}</CardTitle>
                  <p className="text-5xl font-bold mb-2">{plan.price}</p>
                  <p className="text-xl">{plan.duration}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="mr-3 h-6 w-6 mt-1 flex-shrink-0" />
                        <span className="text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.note && (
                    <p className="mt-6 text-base italic">{plan.note}</p>
                  )}
                </CardContent>
                <CardFooter className="pt-8">
                  <Button className="w-full text-xl py-6 bg-black text-white hover:bg-gray-800 transition-colors duration-300">
                    Seleccionar Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pie de Pagina */}
      <footer className="p-4 text-center text-sm text-gray-500">
        © 2024 Alice. Todos los derechos reservados.
      </footer>

    </div>
  )
}