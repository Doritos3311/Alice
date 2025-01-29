import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, LogOut, Check, ChartColumnBig } from "lucide-react"
import UserProfile from "./UserProfile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc"
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
} from "firebase/auth"
import { toast } from "../hooks/use-toast";
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
  theme: string
  user: any
  setShowLandingPage: (show: boolean) => void
  setIsLoginModalOpen: (isOpen: boolean) => void
  setIsLogOutModalOpen: (isOpen: boolean) => void
}

const LandingPage: React.FC<LandingPageProps> = ({theme, user, setShowLandingPage, setIsLoginModalOpen }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showInice, setShowInice] = useState(true)
  const [showPricing, setShowPricing] = useState(false)
  const [showLogIn, setShowLogIn] = useState(false)
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState(false);

  const handleUpdateUserType = async (newUserType: string) => {
    try {
      console.log(`Tipo de usuario actualizado a: ${newUserType}`)
    } catch (error) {
      console.error("Error al actualizar el tipo de usuario:", error)
    }
  }

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
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#121212] text-white" : "bg-gray-100 text-black"}`}>

      <header className={`p-0 flex justify-between items-center rounded-lg shadow-lg ${theme === "dark" ? "bg-[#1E1E1E]" : "bg-gray-200"}`}>
        <div className="text-2xl font-bold ml-8">Alice</div>
        <nav className="flex items-center space-x-4">
          <Button
            onClick={handleShowInice}
            variant="link"
            className={`hover:text-purple-400 ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            Inicio
          </Button>
          <Button
            onClick={handleShowInice}
            variant="link"
            className={`hover:text-purple-400 ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            Características
          </Button>
          <Button
            onClick={handleShowPricing}
            variant="link"
            className={`hover:text-purple-400 ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            Precios
          </Button>
          <a href="#" className={`hover:text-purple-400 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Contacto
          </a>
          
          {user ? (
            
            <div className="mt-5 mb-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="w-full h-100 mb-4 flex items-center justify-start p-2">
                    <Avatar className="h-10 w-10 mr-2">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                      <AvatarFallback>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-2x1 truncate">{user.displayName || user.email}</span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-80 p-0 transform rounded-3xl">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-16 w-16 mr-4 ml-4 mt-4">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                      <AvatarFallback className="text-lg font-bold">{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold mt-4">{user.displayName || "Usuario"}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-400"></div>


                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start mb-2 my-4"
                    onClick={() => setShowLandingPage(true)}
                  >
                    <ChartColumnBig className="mr-2 h-4 w-4" />
                    Contabilidad
                  </Button>

                  <div className="border-t border-gray-400"></div>

                  <Button variant="ghost" size="sm" className="w-full justify-start my-4" onClick={() => setIsLogOutModalOpen(true)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
            

          ) : (
            <div className="mt-6 mb-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleShowLogIn}
                    variant="link"
                    className={`bg-black hover:bg-gray-800 text-white border border-gray-600 ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : ""}`}
                  >
                    Iniciar Sesión
                  </Button>
                </DialogTrigger>

                {showLogIn && (
                  <DialogContent
                    className={`sm:max-w-[425px] ${theme === "dark" ? "bg-[#1E1E1E] text-white" : "bg-gray-200"}`}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center">Iniciar Sesión</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full ${theme === "dark" ? "bg-[#2E2E2E] text-white" : "bg-gray-300 text-black"}`}
                      />
                      <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full ${theme === "dark" ? "bg-[#2E2E2E] text-white" : "bg-gray-300 text-black"}`}
                      />
                      <Button
                        type="submit"
                        className={`w-full flex items-center justify-center ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
                      >
                        Iniciar Sesión
                      </Button>
                    </form>
                    <div className="mt-4 text-center">
                      <p className="text-sm">¿No tienes una cuenta?</p>
                      <Button variant="link" onClick={handleSignUp} className="text-blue-400 hover:text-blue-600">
                        Registrarse
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className={`w-full flex items-center justify-center ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
                      >
                        <FcGoogle className="mr-2" />
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

      <main className="flex-grow flex items-center justify-center px-4">
        {showInice && (
          <div className="mx-auto w-full flex flex-col items-center gap-8">
            <h1 className="text-5xl font-bold mb-4">Simplifica tu Contabilidad y Administración</h1>
            <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <p className="text-xl mb-6">
                  Una herramienta accesible y personalizable diseñada para microemprendedores, que transforma la gestión
                  financiera en una tarea sencilla y efectiva.
                </p>
              </div>
              <div
                className={`flex-1 p-8 rounded-lg shadow-lg h-66 ${theme === "dark" ? "bg-[#1E1E1E]" : "bg-gray-200"}`}
              >
                <h2 className="text-2xl font-bold mb-6 text-center mb-4">Únete a nosotros</h2>
                <p className="text-xl mb-6">
                  Con Alice, lleva tu negocio hacia adelante con un buen manejo de contabilidad.
                </p>
                <div className="flex items-center justify-center mb-40">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={handleShowLogIn}
                        variant="link"
                        className={`bg-black hover:bg-gray-800 text-white border border-gray-600 ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : ""}`}
                      >
                        Comienza Ya
                      </Button>
                    </DialogTrigger>
                    {showLogIn && (
                      <DialogContent
                        className={`sm:max-w-[425px] ${theme === "dark" ? "bg-[#1E1E1E] text-white" : "bg-gray-200"}`}
                      >
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-center">Iniciar Sesión</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSignIn} className="space-y-4">
                          <Input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full ${theme === "dark" ? "bg-[#2E2E2E] text-white" : "bg-gray-300 text-black"}`}
                          />
                          <Input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full ${theme === "dark" ? "bg-[#2E2E2E] text-white" : "bg-gray-300 text-black"}`}
                          />
                          <Button
                            type="submit"
                            className={`w-full flex items-center justify-center ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
                          >
                            Iniciar Sesión
                          </Button>
                        </form>
                        <div className="mt-4 text-center">
                          <p className="text-sm">¿No tienes una cuenta?</p>
                          <Button variant="link" onClick={handleSignUp} className="text-blue-400 hover:text-blue-600">
                            Registrarse
                          </Button>
                        </div>
                        <div className="mt-4">
                          <Button
                            onClick={handleGoogleLogin}
                            variant="outline"
                            className={`w-full flex items-center justify-center ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
                          >
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
      </main>

      {showPricing && (
        <div className="container mx-auto py-16 px-4">
          <h1 className="text-5xl font-bold text-center mb-16">Nuestros Planes</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`w-full h-full flex flex-col justify-between ${index === 1 ? "border-2 border-black" : ""} ${theme === "dark" ? "bg-[#1E1E1E] text-white" : ""}`}
              >
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
                  {plan.note && <p className="mt-6 text-base italic">{plan.note}</p>}
                </CardContent>
                <CardFooter className="pt-8">
                  <Button
                    className={`w-full text-xl py-6 transition-colors duration-300 ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
                  >
                    Seleccionar Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <footer className={`p-4 text-center text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        © 2024 Alice. Todos los derechos reservados.
      </footer>

      {/* Modal de confirmacion de cierre */}
      <Dialog open={isLogOutModalOpen} onOpenChange={setIsLogOutModalOpen}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 mr-0 mb-4">
                  <DialogTitle>¿Cerrar Secion?</DialogTitle>
                </div>
                <DialogDescription>
                  Confirma el cierre de la secion actual
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4 mr-0 mb-4 items-center">
                <Button className="flex items-center justify-center space-x-3 w-full bg-red-600 hover:bg-red-400"
                onClick={()=> {
                  handleLogout()
                  setIsLogOutModalOpen(false)}}>
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
    </div>
    
  )
}

export default LandingPage

