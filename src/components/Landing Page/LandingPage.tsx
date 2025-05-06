"use client"

import type React from "react"

import styles from "@/components/Landing Page/LandingPage.module.css"

import Link from "next/link"
import { Check } from 'lucide-react'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, BarChartBigIcon as ChartColumnBig } from 'lucide-react'
import { FcGoogle } from "react-icons/fc"
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth"
import { FirebaseError, initializeApp } from "firebase/app"
import { useTheme } from "next-themes"
import { toast } from "@/components/hooks/use-toast"

const firebaseConfig = {
  apiKey: "AIzaSyBl1TjSQX82qh60XGIHEtp_i9RCoTTFv_w",
  authDomain: "alice-a2dc3.firebaseapp.com",
  projectId: "alice-a2dc3",
  storageBucket: "alice-a2dc3.appspot.com",
  messagingSenderId: "543545407777",
  appId: "1:543545407777:web:65ab15a1f7f48c92336660",
  measurementId: "G-Y6TF6TB2HJ",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showLogIn, setShowLogIn] = useState(false)
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("inicio")

  // Check for user on component mount
  useState(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  })

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión con Google.",
      })
      setShowLogIn(false)
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al iniciar sesión con Google. Por favor, intenta de nuevo.",
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
        description: "Has iniciado sesión correctamente.",
        variant: "default",
      })
      setShowLogIn(false)
    } catch (error) {
      if (error instanceof FirebaseError) {
        let errorMessage = "Hubo un problema al iniciar sesión. Por favor, intenta de nuevo."

        if (error.code === "auth/user-not-found") {
          errorMessage = "El correo electrónico no está registrado. ¿Quieres registrarte?"
        } else if (error.code === "auth/wrong-password") {
          errorMessage = "La contraseña es incorrecta. Inténtalo de nuevo."
        } else if (error.code === "auth/too-many-requests") {
          errorMessage = "Demasiados intentos fallidos. Inténtalo de nuevo más tarde."
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Has iniciado sesión automáticamente.",
        variant: "default",
      })
      setShowLogIn(false)
    } catch (error) {
      console.error("Error al registrarse:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al crear la cuenta. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      })
      setIsLogOutModalOpen(false)
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
    <div className={styles.container}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logo_text}>Alice</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link href="#Inicio" className={styles.nav_link}>
            Inicio
          </Link>
          <Link href="#Caracteristicas" className={styles.nav_link}>
            Características
          </Link>
          <Link href="#Servicios" className={styles.nav_link}>
            Servicios
          </Link>
          <Link href="#Contacto" className={styles.nav_link}>
            Contacto
          </Link>
        </nav>

        <div className={styles.user_menu}>
          {user ? (
            <div>
              <Popover>

                <PopoverTrigger asChild>
                  <Button variant="ghost" className={styles.user_button}>
                    <Avatar className={styles.avatar}>
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                      <AvatarFallback>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                    </Avatar>
                    <span className={styles.user_name}>{user.displayName || user.email}</span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className={styles.popover_content}>
                  <div className={styles.user_info}>
                    <div className={styles.user_info_header}>
                      <Avatar className={styles.avatar_large}>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                        <AvatarFallback>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                      </Avatar>
                      <div className={styles.user_info_details}>
                        <p className={styles.user_display_name}>{user.displayName || "Usuario"}</p>
                        <p className={styles.user_email}>{user.email}</p>
                      </div>
                    </div>
                    <div className={styles.divider} />
                    <Link href="/app" passHref>
                      <Button variant="ghost" size="sm" className={styles.menu_button}>
                        <ChartColumnBig className={styles.menu_icon} />
                        Contabilidad
                      </Button>
                    </Link>
                    <Link href="/app" passHref>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.menu_button}
                        onClick={() => {setActiveTab("configuracion");}}
                      >
                        <Settings className={styles.menu_icon} />
                        Configuración
                      </Button>
                    </Link>
                    
                    <div className={styles.divider} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${styles.menu_button} ${styles.logout_button}`}
                      onClick={() => setIsLogOutModalOpen(true)}
                    >
                      <LogOut className={styles.menu_icon} />
                      Cerrar sesión
                    </Button>
                  </div>
                </PopoverContent>

              </Popover>
            </div>
          ) : (
            <>
              <Dialog open={showLogIn} onOpenChange={setShowLogIn}>
                <DialogTrigger asChild>
                  <Button variant="outline" className={styles.login_button}>
                    Iniciar sesión
                  </Button>
                </DialogTrigger>
                <DialogContent className={styles.dialog_content}>
                  <DialogHeader>
                    <DialogTitle className={styles.dialog_title}>Iniciar Sesión</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSignIn} className={styles.form}>
                    <Input
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                    />
                    <Input
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.input}
                    />
                    <Button type="submit" className={styles.submit_button}>
                      Iniciar Sesión
                    </Button>
                  </form>
                  <div className={styles.text_center}>
                    <p className={`${styles.text_sm} ${styles.text_gray}`}>¿No tienes una cuenta?</p>
                    <Link  href="/registro" passHref>
                      <Button variant="link" className={styles.link_button}>
                        Registrarse
                      </Button>
                    </Link>
                    
                  </div>
                  <div>
                    <Button
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className={styles.google_button}
                    >
                      <FcGoogle className={styles.google_icon} />
                      Continuar con Google
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/registro" passHref>
                <Button
                  className={styles.register_button}
                >
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className={styles.main_container}>
        
        <div className={styles.image_background}>
        </div>

        {/* Incio */}
        <section id="Inicio">
          <div className={styles.overlay}></div>

          <div className={styles.hero_content}>
            <div className={styles.hero_container}>
              <h1 className={styles.hero_title}>Tu Software de Contabilidad</h1>
              <p className={styles.hero_subtitle}>
                Optimiza tu contabilidad con un sistema moderno y eficiente.
              </p>
              {user ? (
                <Button className={styles.hero_button}>
                  Explorar Funciones
                </Button>
              ) : (
                <Button
                  className={styles.hero_button}
                  onClick={() => setShowLogIn(true)}
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </div>
        </section>

      </main>

      <section className={styles.features_section}>
        <div className={styles.section_container}>
          <h2 className={styles.features_title}>Funciones Principales</h2>

          <div className={styles.features_grid}>
            <div className={styles.feature_card}>
              <h3 className={styles.feature_title}>Registro de Inventario</h3>
              <p className={styles.feature_description}>Controla el stock de tu negocio en tiempo real.</p>
            </div>

            <div className={styles.feature_card}>
              <h3 className={styles.feature_title}>Facturación</h3>
              <p className={styles.feature_description}>Genera y administra facturas de forma automatizada.</p>
            </div>

            <div className={styles.feature_card}>
              <h3 className={styles.feature_title}>Libro Diario</h3>
              <p className={styles.feature_description}>Registra todas tus transacciones de manera organizada.</p>
            </div>

            <div className={styles.feature_card}>
              <h3 className={styles.feature_title}>Registro de Servicios</h3>
              <p className={styles.feature_description}>Gestiona los servicios ofrecidos con información detallada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Caracteristicas */}
      <section id="Caracteristicas" className={styles.caracteristicas_section}>
        <div className={styles.section_container}>
        <div className={styles.grid_section}>
            <div className={styles.caracteristicas_text}>
              <h2 className={styles.section_titleR}>Registro de Inventario</h2>
              <p className={styles.section_description}>
              Optimiza la gestión de inventario para microempresarios, permitiendo administrar, consultar y actualizar productos
              y materiales de manera eficiente para tomar decisiones informadas sobre el stock.
              </p>
            </div>
            <div className={styles.image_containerR}><img src="/img/registroDeInventario.jpg"/></div>
          </div>

          <div className={styles.grid_section}>
            <div className={`${styles.image_container} ${styles.order_md_1}`} />
            <div className={`${styles.caracteristicas_text} ${styles.order_md_2}`}>
              <h2 className={styles.section_titleS}>Servicios</h2>
              <p className={`${styles.section_description} ${styles.text_right}`}>
              El módulo de Servicios gestiona la facturación, permitiendo registrar, actualizar y seleccionar servicios y productos
               del inventario para asegurar coherencia contable.
              </p>
            </div>
          </div>

          <div className={styles.grid_section}>
            <div className={styles.caracteristicas_text}>
              <h2 className={styles.section_titleT}>Terceros</h2>
              <p className={styles.section_description}>
              En la sección de terceros, puedes ver y gestionar todos proveedores y clientes registrados.
              </p>
            </div>
            <div className={styles.image_container}></div>
          </div>

          <div className={styles.grid_section}>
            <div className={`${styles.image_container} ${styles.order_md_1}`} />
            <div className={`${styles.caracteristicas_text} ${styles.order_md_2}`}>
              <h2 className={styles.section_titleF}>Facturación</h2>
              <p className={`${styles.section_description} ${styles.text_right}`}>
                Permite gestionar la emisión y recepción de facturas, facilitando el control, almacenamiento y consulta 
                para una contabilidad eficiente y cumplimiento empresarial.
              </p>
            </div>
          </div>
        </div>


        <div className={styles.dashboard_section}>
          <div className={styles.section_container}>
            {/* Libro Diario Section */}
            <div className={styles.grid_section}>
              <div className={styles.caracteristicas_text}>
                <h2 className={styles.section_titleL}>Libro Diario</h2>
                <p className={styles.section_description}>
                  El Libro Diario registra transacciones en orden cronológico, facilitando el análisis contable, el
                  cumplimiento fiscal y el control financiero.
                </p>
              </div>
              <div className={styles.image_container}></div>
            </div>

            {/* Dashboard Section */}
            <div className={styles.grid_section}>
              <div className={`${styles.image_container} ${styles.order_md_1}`} />
              <div className={`${styles.caracteristicas_text} ${styles.order_md_2}`}>
                <h2 className={styles.section_titleD}>Dashboard</h2>
                <p className={`${styles.section_description} ${styles.text_right}`}>
                  Módulo central de visualización que ofrece un resumen en tiempo real del estado financiero e inventario,
                  basado en datos de Facturación y Libro Diario.
                </p>
              </div>
            </div>

            {/* Grupos de Trabajo Section */}
            <div className={styles.grid_section}>
              <div className={styles.caracteristicas_text}>
                <h2 className={styles.section_titleG}>Grupos de Trabajo</h2>
                <p className={styles.section_description}>
                  Gestiona datos según roles. El personal solicita acceso y la empresa lo aprueba o rechaza. Los permisos
                  se asignan y modifican según necesidad. Los cambios en los datos se sincronizan en tiempo real.
                </p>
              </div>
              <div className={styles.image_container}></div>
            </div>

            {/* Generar Registros Section */}
            <div className={styles.grid_section}>
              <div className={`${styles.image_container} ${styles.order_md_1}`} />
              <div className={`${styles.caracteristicas_text} ${styles.order_md_2}`}>
                <h2 className={styles.section_titleGr}>Generar Registros</h2>
                <p className={`${styles.section_description} ${styles.text_right}`}>
                  Permite crear reportes en Excel en tiempo real. Los usuarios pueden elegir entre reportes como Libro
                  Diario, Facturación, Inventario o un Reporte Combinado, que integra toda la información en un solo
                  archivo con pestañas por sección.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="Servicios">
        <div className={styles.pricing_container}>
          <main className={styles.pricing_main}>
            <h1 className={styles.pricing_title}>Planes de Precios</h1>

            <div className={styles.pricing_grid}>
              {/* Free Plan */}
              <div className={styles.plan_card}>
                <h2 className={styles.plan_title}>Plan Gratuito por 7 Días</h2>
                <div className={styles.plan_price}>
                  <p>Gratis</p>
                  <p>por 7 Días</p>
                </div>

                <div className={styles.plan_features}>
                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Acceso completo a todas las funciones de la aplicación</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Inteligencia Artificial activa, con recomendaciones personalizadas</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Posibilidad de gestionar finanzas, inventario y facturación</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Personalización completa de apartados según las necesidades del usuario</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Puedes cancelar en cualquier momento antes de que finalice el periodo de prueba</p>
                  </div>
                </div>

                <div className={styles.plan_notice}>
                  <p>Al finalizar los 7 días, se activa automáticamente el Plan Mensual si no se cancela.</p>
                </div>

                <button className={styles.select_button}>Seleccionar Plan</button>
              </div>

              {/* Monthly Plan */}
              <div className={styles.plan_card}>
                <h2 className={styles.plan_title}>Plan Mensual</h2>
                <div className={styles.plan_price}>
                  <p>$10</p>
                  <p>al mes</p>
                </div>

                <div className={styles.plan_features}>
                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Acceso a todas las funciones de la aplicación</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Inteligencia Artificial activa, proporcionando recomendaciones personalizadas</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Funcionalidades completas para gestionar finanzas, inventario y facturación</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Apartados personalizables para adaptarse a las necesidades de cada microemprendedor</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Soporte técnico prioritario</p>
                  </div>
                </div>

                <button className={styles.select_button}>Seleccionar Plan</button>
              </div>

              {/* Annual Plan */}
              <div className={styles.plan_card}>
                <h2 className={styles.plan_title}>Plan Anual</h2>
                <div className={styles.plan_price}>
                  <p>$100</p>
                  <p>al año</p>
                </div>

                <div className={styles.plan_features}>
                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Acceso completo a todas las funciones de la aplicación</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Inteligencia Artificial activa, con recomendaciones avanzadas</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Gestión completa de finanzas, inventario y facturación</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Personalización completa de apartados para una mejor adaptación a cada negocio</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Soporte técnico prioritario y actualizaciones incluidas durante todo el año</p>
                  </div>

                  <div className={styles.feature_item}>
                    <Check className={styles.check_icon} />
                    <p>Ahorro del 20% en comparación con el plan mensual</p>
                  </div>
                </div>

                <button className={styles.select_button}>Seleccionar Plan</button>
              </div>
            </div>
          </main>
        </div>
      </section>

      <section id="Contacto">
        <footer className={styles.footer}>
          <div className={styles.footer_container}>
            <div className={styles.social_icon_container}>
              <div className={styles.icon_container}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path
                    d="M8 2H16C19.3137 2 22 4.68629 22 8V16C22 19.3137 19.3137 22 16 22H8C4.68629 22 2 19.3137 2 16V8C2 4.68629 4.68629 2 8 2Z"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path d="M7 12H17" stroke="white" strokeWidth="2" />
                  <path d="M12 7V17" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className={styles.social_link}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.social_icon}>
                <path
                  d="M22 4.01C21.9 4.3 21.8 4.59 21.7 4.87C19.6 11.02 15.5 15.1 9.5 17.2C8.5 17.5 7.5 17.8 6.5 18C7.3 17 8 15.9 8.5 14.7C8.8 14 8.8 14 8.1 14C7.7 14 6.6 14.4 6 14.7C5.4 15 4.6 15.4 4 15.9C4.6 15.4 5.4 15 6 14.7C7.6 13.9 7.6 13.9 7.1 12.7C6.4 10.8 6 8.8 6 6.7C6 5.2 6.3 3.7 6.7 2.2C6.9 2.1 7 2 7.1 2C7.3 2 7.5 2.1 7.7 2.2C9.7 3.2 11.9 3.7 14 3.7C16.1 3.7 18.3 3.2 20.3 2.2C20.5 2.1 20.7 2 20.9 2C21 2 21.1 2.1 21.3 2.2C21.7 2.8 21.9 3.4 22 4.01Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>@AliceApp</span>
            </div>

            <div className={styles.social_link}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.social_icon}>
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
                <circle cx="18" cy="6" r="1" fill="white" />
              </svg>
              <span>@AliceApp</span>
            </div>

            <div className={styles.social_link}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.social_icon}>
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                <path d="M16 8L12 12M12 12L8 16M12 12L8 8M12 12L16 16" stroke="white" strokeWidth="2" />
              </svg>
              <span>AliceApp</span>
            </div>

            <div className={styles.social_link}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.social_icon}>
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="white" strokeWidth="2" />
                <path d="M2 8L12 14L22 8" stroke="white" strokeWidth="2" />
              </svg>
              <span>AliceApp.vercel@gmail.com</span>
            </div>
          </div>
        </footer>
        <div>
          {/* Footer */}
          <footer className={styles.copyright}>© 2024 Alice. Todos los derechos reservados.</footer>
        </div>
      </section>

      {/* Logout Modal */}
      <Dialog open={isLogOutModalOpen} onOpenChange={setIsLogOutModalOpen}>
        <DialogContent className={styles.xal}>
          <DialogHeader>
            <DialogTitle className={styles.modal_title}>¿Cerrar Sesión?</DialogTitle>
            <DialogDescription className={styles.modal_description}>Confirma el cierre de la sesión actual</DialogDescription>
          </DialogHeader>
          <div className={styles.modal_actions}>
            <Button variant="outline" onClick={() => setIsLogOutModalOpen(false)} className={styles.cancel_button}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleLogout} className={styles.confirm_button}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}