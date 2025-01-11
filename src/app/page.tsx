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
import { useState, useMemo, useRef, useEffect } from "react"

//Componentes Aplicacion
import ConfiguracionPage from "@/components/ConfiguracionPage";
import LandingPage from '@/components/LandingPage';
import UserProfile from '@/components/UserProfile';
import UsuariosRegistrados from '@/components/UsuariosRegistrados';
import { EmpresasRegistradas } from '@/components/EmpresasRegistradas';
import SolicitudIngreso from '@/components/SolicitudIngreso';
import SolicitudPendiente from '@/components/SolicitudPendiente';
import AccesoRestringido from '@/components/AccesoRestringido';

//Importaciones de Tipos

//Componentes Shadcn
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { FileSpreadsheet, BarChart2, Package, FileText, Bot, X, Plus, Trash2, Save, Calendar, Upload, Mic, User, Star, Edit, Users, Moon, Sun, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/react-scroll-area"

// Importacion de OpenAI
import OpenAI from "openai"

//Diseño Iconos
import { FcGoogle } from "react-icons/fc";
import { TfiEmail } from "react-icons/tfi";
import { RiEditLine } from "react-icons/ri";
import { IoIosSave } from "react-icons/io";
import { IoTrashBinSharp } from "react-icons/io5";

// Importaciones de Firebase
import { initializeApp } from "firebase/app"
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc, arrayUnion } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

// Modo Obscuro
import { useTheme } from "next-themes"

// Importaciones Archivo de Exel
import { FileDown } from 'lucide-react'
import GenerarRegistros from '@/components/GenerarRegistros';

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

{/* Declaracion de Tipados */}

// Definición de Tipos
type RowData = {
  id: string
  [key: string]: any
}

// Definicion Inventario
type InventoryItem = {
  id: string
  [key: string]: any
}

// Definicion Factura
type InvoiceItem = {
  id: string
  fechaEmision?: any;
  [key: string]: any
}

// Definicion Mensaje
type Message = {
  role: 'user' | 'assistant'
  content: string
}

// Definicion de Campos
type FieldConfig = {
  name: string
  type: string
}

// Definicion por Defecto
type SectionConfig = {
  [key: string]: FieldConfig
}

// Definicion de funciones
type AppConfig = {
  libroDiario: SectionConfig
  inventario: SectionConfig
  facturacion: SectionConfig
}

{/* Configuracion de Items */}

//Chatgpt IA Key
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export default function ContabilidadApp() {

  {/* Declaracion de Funciones */}
  const [activeTab, setActiveTab] = useState("libro-diario")
  const [data, setData] = useState<RowData[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRow, setNewRow] = useState<Omit<RowData, 'id'>>({})
  const [timeFrame, setTimeFrame] = useState("diario")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [isIAOpen, setIsIAOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const chatRef = useRef<HTMLDivElement>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [newInventoryItem, setNewInventoryItem] = useState<InventoryItem>({} as InventoryItem)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [newInvoiceItem, setNewInvoiceItem] = useState<InvoiceItem>({} as InvoiceItem)
  const [dashboardType, setDashboardType] = useState("financial")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [advancedViewInventory] = useState(true)
  const [advancedViewInvoice] = useState(true)
  const [invoiceFilterDate, setInvoiceFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [invoiceFilterMonth, setInvoiceFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [invoiceFilterYear, setInvoiceFilterYear] = useState(new Date().getFullYear().toString())
  const [invoiceFilterType, setInvoiceFilterType] = useState("all")

  // Estados para agregar nuevos items
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // Estados para visualizacion de cuentas
  const [isCreatingAccountingEntry, setIsCreatingAccountingEntry] = useState(false);
  const [userData, setUserData] = useState<{ type: 'personal' | 'empresa' }>({ type: 'personal' });
  const [empresasRegistradas, setEmpresasRegistradas] = useState([]);

  // Estados para la edición de campos
  const [isEditingFields, setIsEditingFields] = useState(false)
  const [editingSection, setEditingSection] = useState<keyof AppConfig | ''>('')
  const [appConfig, setAppConfig] = useState<AppConfig>({
    libroDiario: {},
    inventario: {},
    facturacion: {}
  })

  // Estados para Autocompletar Campos
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [showAutoCompleteModal, setShowAutoCompleteModal] = useState(false)
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<InvoiceItem | null>(null);

  // Estado de autenticación Landing Page
  const [user] = useAuthState(auth);
  const [,setUser] = useState(null);
  
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [joinGroupUID, setJoinGroupUID] = useState('');
  const [viewingUID, setViewingUID] = useState<string | null>(null);

  // Estados para el inicio de sesión
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState(false);
  const [isEmailLoginModalOpen, setIsEmailLoginModalOpen] = useState(false);
  const db = getFirestore()

  //Estado para Modo Nocturno
  const { setTheme, theme } = useTheme()

  // Estado que controla la app o la landing page
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true); 

  // Estado que de control de los modales
  const [showCancelConfirmModalLibroDiario, setShowCancelConfirmModalLibroDiario] = useState(false)
  const [showCancelConfirmModalInventario, setShowCancelConfirmModalInventario] = useState(false)
  const [showCancelConfirmModalFacturacion, setShowCancelConfirmModalFacturacion] = useState(false)
  const [cancelActionLibroDiario, setCancelActionLibroDiario] = useState<() => void>(() => {})
  const [cancelActionInventario, setCancelActionInventario] = useState<() => void>(() => {})
  const [cancelActionFacturacion, setCancelActionFacturacion] = useState<() => void>(() => {})

  // Estado de Control de Permisos
  const [permisos, setPermisos] = useState({
    permisoLibroDiario: false,
    permisoInventario: false,
    permisoFacturacion: false
  });

  // Efecto para cargar datos cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      loadUserData();
      loadUserConfig()
      loadData(viewingUID)
      setShowLandingPage(true); // Oculta la landing page cuando el usuario está autenticado
    }else{
      checkUserAuthentication();
    }

    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [user, viewingUID])

  {/* Funciones */}


  {/* Carga de Datos */}

  // Función para cargar la configuración del usuario desde Firestore
  const loadUserConfig = async () => {
    if (!user) return

    const configDoc = await getDoc(doc(db, `users/${user.uid}/config`, 'fields'))
    if (configDoc.exists()) {
      setAppConfig(configDoc.data() as AppConfig)
    } else {
      // Funcion Datos Por Defecto
      const defaultConfig: AppConfig = {
        //Datos por defecto libro diario
        libroDiario: {
          fecha: { name: 'Fecha' , type: 'date'},
          nombreCuenta: { name: 'Nombre de Cuenta', type: 'text' },
          descripcion: { name: 'Descripción', type: 'text' },
          idElemento: { name: 'Número de Ítem (ID)', type: 'text' },
          debe: { name: 'Debe', type: 'number' },
          haber: { name: 'Haber', type: 'number' }
        },
        //Datos por defecto inventario
        inventario: {
          idElemento: { name: 'Número de Ítem (ID)', type: 'text' },
          category: { name: 'Categoría', type: 'text'},
          descripcion: { name: 'Descripción del Producto', type: 'text' },
          cantidadDisponible: { name: 'Cantidad Disponible', type: 'number' },
          stockMinimo: { name: 'Stock Mínimo', type: 'number' },
          precioCompra: { name: 'Precio de Compra Unitario', type: 'number' },
          precioVenta: { name: 'Precio de Venta Unitario', type: 'number' },
          fechaIngreso: { name: 'Fecha de Ingreso', type: 'date' },
          proveedor: { name: 'Proveedor', type: 'text' }
        },
        //Datos por defecto facturacion
        facturacion: {
          idElemento: { name: 'Número de Ítem (ID)', type: 'text' },
          numeroFactura: { name: 'Número de Factura', type: 'text' },
          fechaEmision: { name: 'Fecha de Emisión', type: 'date' },
          nombreCliente: { name: 'Nombre del Cliente', type: 'text' },
          detallesProducto: { name: 'Detalles del Producto/Servicio', type: 'text' },
          cantidad: { name: 'Cantidad de Productos/Servicios', type: 'number' },
          precioUnitario: { name: 'Precio Unitario', type: 'number' },
          subtotal: { name: 'Subtotal', type: 'number' },
          impuestos: { name: 'Impuestos Aplicables', type: 'number' },
          total: { name: 'Total a Pagar', type: 'number' },
          metodoPago: { name: 'Método de Pago', type: 'text' }
        }
      }
      await setDoc(doc(db, `users/${user.uid}/config`, 'fields'), defaultConfig)
      setAppConfig(defaultConfig)
    }
  }

  // Función para cargar datos
  const loadData = async (groupUID: string | null = null) => {
    if (!user) return;

    const uidToUse = groupUID || user.uid;

    try {
      // Cargar datos del libro diario
      const libroDiarioSnapshot = await getDocs(collection(db, `users/${uidToUse}/libroDiario`));
      const libroDiarioData = libroDiarioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(libroDiarioData);

      // Cargar datos de inventario
      const inventarioSnapshot = await getDocs(collection(db, `users/${uidToUse}/inventario`));
      const inventarioData = inventarioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventoryItems(inventarioData);

      // Cargar datos de facturación
      const facturacionSnapshot = await getDocs(collection(db, `users/${uidToUse}/facturacion`));
      const facturacionData = facturacionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoiceItems(facturacionData);

      setViewingUID(uidToUse);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar los datos. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Funcion  para cargar datos de Grupos de Empresas
  const handleCargarEmpresa = async (empresaId: string) => {
    if (!user) return;

    try {
      await loadData(empresaId);
      toast({
        title: "Éxito",
        description: "Datos de la empresa cargados correctamente.",
      });
    } catch (error) {
      console.error("Error al cargar datos de la empresa:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar los datos de la empresa. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  //Funcion Unirce a Grupo
  const handleJoinGroup = async () => {
    if (!user || !joinGroupUID) return;

    try {
      // Verificar si el grupo existe y obtener sus datos
      const groupDoc = await getDoc(doc(db, `users/${joinGroupUID}/Usuario/datos`));
      if (!groupDoc.exists()) {
        throw new Error("El grupo no existe o no tienes permisos para acceder a él.");
      }

      const groupData = groupDoc.data();
      if (!groupData) {
        throw new Error("Los datos del grupo no son válidos.");
      }

      // Extraer el nombre de la empresa y el tipo
      const companyName = groupData.companyName || 'Empresa sin nombre';
      const companyType = groupData.type || 'empresa';

      // Obtener el nombre del usuario actual
      const userDoc = await getDoc(doc(db, `users/${user.uid}/Usuario`, 'datos'));
      const userData = userDoc.data();
      const userName = userData?.displayName || user.displayName || user.email || "Usuario sin nombre";

      // Agregar solicitud a los permisos del usuario
      await setDoc(doc(db, `users/${user.uid}/Usuario`, 'permisos'), {
        [joinGroupUID]: { permiso1: false, nombreEmpresa: companyName }
      }, { merge: true });

      // Crear solicitud a la empresa con el permiso en false
      await setDoc(doc(db, `users/${joinGroupUID}/Usuario`, 'permisos'), {
        [user.uid]: { permiso1: false }
      }, { merge: true });

      // Agregar solicitud a la empresa
      await updateDoc(doc(db, `users/${joinGroupUID}/Usuario`, 'solicitudes'), {
        [user.uid]: { nombre: userName, estado: "pendiente" }
      });

      setShowJoinGroupModal(false);
      setJoinGroupUID("");
      toast({
        title: "Éxito",
        description: "Solicitud enviada correctamente. La empresa se agregará a tu lista cuando sea aprobada.",
      });
      
    } catch (error) {
      console.error("Error al unirse al grupo:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al enviar la solicitud. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  //Funcion Cargar Informacion del Usuario
  const loadUserData = async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, `users/${user.uid}/Usuario`, 'datos'));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserData({
        type: data.type || 'personal',
      });
    }
  };

  // Funcion para Analizar el tipo de Usuario
  const handleUpdateUserType = (newType: 'personal' | 'empresa') => {
    setUserData({ type: newType });
    console.log('Usuario registrado como:', newType);
  };

  // Funcion Requerimiento Inicio de Sesion
  const checkUserAuthentication = (): void => {
    setShowLandingPage(false);
  };


  {/* Modales */}

  // Función para abrir el modal de edición de campos
  const openFieldEditor = (section: keyof AppConfig) => {
    setEditingSection(section)
    setIsEditingFields(true)
  }

  const handleCancelCreationLibroDiario = (action: () => void) => {
    setShowCancelConfirmModalLibroDiario(true);
    setCancelActionLibroDiario(() => action);
  };

  const handleCancelCreationInventario = (action: () => void) => {
    setShowCancelConfirmModalInventario(true);
    setCancelActionInventario(() => action);
  };

  const handleCancelCreationFacturacion = (action: () => void) => {
    setShowCancelConfirmModalFacturacion(true);
    setCancelActionFacturacion(() => action);
  };

  const confirmCancelLibroDiario = () => {
    cancelActionLibroDiario();
    setShowCancelConfirmModalLibroDiario(false);
  };

  const confirmCancelInventario = () => {
    cancelActionInventario();
    setShowCancelConfirmModalInventario(false);
  };

  const confirmCancelFacturacion = () => {
    cancelActionFacturacion();
    setShowCancelConfirmModalFacturacion(false);
  };


  {/* Manejo de Campos */}

  // Función para guardar los cambios en la configuración de campos
  const saveFieldChanges = async () => {
    if (!user) return

    try {
      await setDoc(doc(db, `users/${user.uid}/config`, 'fields'), appConfig)
      setIsEditingFields(false)
      loadData(viewingUID) // Recargar los datos con la nueva configuración
    } catch (error) {
      console.error("Error al guardar la configuración de campos:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la configuración. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para agregar un nuevo campo
  const addNewField = (section: keyof AppConfig) => {
    const newFieldKey = `newField${Object.keys(appConfig[section]).length}`
    setAppConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [newFieldKey]: { name: 'Nuevo Campo', type: 'text' }
      }
    }))
  }

  // Función para eliminar un campo
  const deleteField = (section: keyof AppConfig, fieldKey: string) => {
    setAppConfig(prev => {
      const newConfig = { ...prev }
      delete newConfig[section][fieldKey]
      return newConfig
    })
  }

  // Función para actualizar un campo
  const updateField = (section: keyof AppConfig, fieldKey: string, updates: Partial<FieldConfig>) => {
    setAppConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [fieldKey]: { ...prev[section][fieldKey], ...updates }
      }
    }))
  }


  {/* Libro Diario */}

  // Función para agregar una nueva fila al libro diario
  const handleAddRow = async () => {
    if (!user) return;

    try {
      const newRowWithIdElemento = { ...newRow, idElemento: Date.now().toString() };
      const docRef = await addDoc(collection(db, `users/${user.uid}/libroDiario`), newRowWithIdElemento);
      setData([...data, { ...newRowWithIdElemento, id: docRef.id }]);
      setNewRow({});
      setIsCreatingAccountingEntry(false);
    } catch (error) {
      console.error("Error al agregar fila:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar la fila. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para editar una fila del libro diario
  const handleEditRow = (id: string) => {
    setEditingId(id)
  }

  // Función para guardar los cambios de una fila del libro diario
  const handleSaveRow = async (id: string) => {
    if (!user) return

    const editedRow = data.find(row => row.id === id)
    if (!editedRow) return

    try {
      await updateDoc(doc(db, `users/${user.uid}/libroDiario`, id), editedRow)
      setEditingId(null)
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los cambios. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar una fila del libro diario
  const handleDeleteRow = async (id: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, `users/${user.uid}/libroDiario`, id))
      setData(data.filter(row => row.id !== id))
    } catch (error) {
      console.error("Error al eliminar fila:", error)
      toast({
        title: "Error",
        
        description: "Hubo un problema al eliminar la fila. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para manejar cambios en los inputs
  const handleInputChange = (id: string, field: string, value: any) => {
    setData(data.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  // Función para manejar cambios en la nueva fila
  const handleNewRowChange = (field: string, value: any) => {
    setNewRow({ ...newRow, [field]: value })
  }

  // Filtrado de datos para el libro diario
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (!row || !row.fecha) {
        return false; 
      }
      const rowDate = new Date(row.fecha);
  
      switch (timeFrame) {
        case "diario":
          return row.fecha === selectedDate;
        case "mensual":
          return typeof row.fecha === 'string' && row.fecha.startsWith(selectedMonth);
        case "anual":
          return typeof row.fecha === 'string' && row.fecha.startsWith(selectedYear);
        default:
          return true;
      }
    });
  }, [data, timeFrame, selectedDate, selectedMonth, selectedYear]);

  // Cálculo de totales para el libro diario
  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      acc.debe += parseFloat(row.debe) || 0
      acc.haber += parseFloat(row.haber) || 0
      return acc
    }, { debe: 0, haber: 0 })
  }, [filteredData])

  // Datos para los gráficos
  const chartData = useMemo(() => {
    return [
      { name: 'Totales', Debe: totals.debe, Haber: totals.haber }
    ]
  }, [totals])

  //Metodo Resultado Filtro Libro Diario
  const lineChartData = useMemo(() => {
    return filteredData.map(row => ({
      fecha: row.fecha,
      Debe: parseFloat(row.debe) || 0,
      Haber: parseFloat(row.haber) || 0
    }))
  }, [filteredData])

  //Metodo Interfaz Libro Diario
  const pieChartData = useMemo(() => {
    return [
      { name: 'Debe', value: totals.debe },
      { name: 'Haber', value: totals.haber }
    ]
  }, [totals])


  {/* IA */}

  // Función para manejar el envío de mensajes al asistente IA
  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputMessage.trim()) {
        const userMessage = { role: 'user' as const, content: inputMessage }
        setMessages(prev => [...prev, userMessage])
        setInputMessage("")

        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { "role": "system", "content": "Eres un asistente en contabilidad y en manejo de empresas..." },
              ...messages,
              userMessage,
            ],
          })
      
          const assistantMessage = {
            role: 'assistant' as const,
            content: completion.choices[0]?.message.content || "Lo siento, no pude generar una respuesta."
          }
          setMessages(prev => [...prev, assistantMessage])
      
          // Generar audio de la respuesta
          const speech = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova",
            input: assistantMessage.content,
          })
      
          const audioUrl = URL.createObjectURL(new Blob([await speech.arrayBuffer()], { type: 'audio/mpeg' }))
          const audio = new Audio(audioUrl)
          audio.play()
      
        } catch (error) {
          console.error("Error al comunicarse con la IA:", error)
          setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error al procesar tu solicitud." }])
        }          
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      setInputMessage(prev => prev + '\n')
    }
  }

  // Función para manejar la subida de archivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Aquí iría la lógica para manejar la subida de archivos
    console.log("Archivo seleccionado:", event.target.files?.[0])
  }

  // Función para manejar la entrada de voz
  const handleVoiceInput = () => {
    // Aquí iría la lógica para manejar la entrada de voz
    console.log("Iniciando entrada de voz...")
  }


  {/* Inventario */}

  // Función para agregar un nuevo ítem al inventario
  const handleAddInventoryItem = async () => {
    if (!user) return;// Si usuario existe entonces

    try {//Intentar
      const docRef = await addDoc(collection(db, `users/${user.uid}/inventario`), newInventoryItem);// Agregar Documento a la base de datos en base a la ruta y con los datos de esta funcion newInventoryItem
      setInventoryItems([...inventoryItems, { ...newInventoryItem, id: docRef.id }]);// Realiza un barrido y los digita en la base de datos
      setNewInventoryItem({} as InventoryItem);// Vacia la funcion setNewInventoryItem para colocar otros datos proximamente
      setIsInventoryModalOpen(false); // Cerrar el modal después de agregar
      toast({//Mensaje detallado a la consola
        title: "Éxito",
        description: "Nuevo ítem agregado al inventario.",
      });
    } catch (error) {//Si no se realizo la accion anterior
      console.error("Error al agregar ítem al inventario:", error);//Mensaje consola
      toast({
        title: "Error",// Mensaje detallado consola
        description: "Hubo un problema al agregar el ítem al inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para editar un ítem del inventario
  const handleEditInventoryItem = (id: string) => {
    setEditingInventoryId(id)//Busca el item en base al id
    const itemToEdit = inventoryItems.find(item => item.id === id)//Compara que exista el item seleccionado
    if (itemToEdit) {//Si existe entonces
      setNewInventoryItem(itemToEdit)//Modificar los cambios aplicados
    }
  }

  // Función para guardar los cambios de un ítem del inventario
  const handleSaveInventoryItem = async () => {
    if (!user || !editingInventoryId) return// Si usuario existe

    try {//Intentar
      await updateDoc(doc(db, `users/${user.uid}/inventario`, editingInventoryId), newInventoryItem)//Entra a la ruta y actualiza los datos segun la funcion editingInventoryId y newInventoryItem
      setInventoryItems(inventoryItems.map(item => //Mapeado de los campos de el inventario en base al id
        item.id === editingInventoryId ? { ...newInventoryItem, id: editingInventoryId } : item// Actualiza los campos modificados
      ))
      setEditingInventoryId(null)//Vacia la funcion setEditingInventoryId
      setNewInventoryItem({} as InventoryItem)// Vacia y carga por defecto a la funcion setNewInventoryItem
    } catch (error) {//Si error
      console.error("Error al guardar cambios en el inventario:", error)// Mensaje consola error
      toast({//Mensaje detallado error
        title: "Error",
        description: "Hubo un problema al guardar los cambios en el inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un ítem del inventario
  const handleDeleteInventoryItem = async (id: string) => {
    if (!user) return;//Si usuario existe
  
    try {//Intentar
      await deleteDoc(doc(db, `users/${user.uid}/inventario`, id));//Borrar el documento en base al id dentro de la ruta
      setInventoryItems(inventoryItems.filter(item => item.id !== id));// Verifica que ya no exista el documento
      toast({//Mensaje de funcionamiento efectivo
        title: "Éxito",
        description: "Ítem eliminado correctamente.",
      });
    } catch (error) {//Error
      console.error("Error al eliminar ítem del inventario:", error);//Mensaje error
      toast({//Mensaje detallado error
        title: "Error",
        description: "Hubo un problema al eliminar el ítem del inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };


  {/* Facturacion */}

  // Función para agregar una nueva factura
  const handleAddInvoiceItem = async () => {
    if (!user || !db) return;// Si usuario existe

    try {//Intentar
      const newInvoiceItemWithId = {// Funcion barrido de los datos en la aplicacion y coloca dentro de la base de datos
        ...newInvoiceItem, 
        idElemento: newInvoiceItem.idElemento || Date.now().toString()
      };
      const docRef = await addDoc(collection(db, `users/${user.uid}/facturacion`), newInvoiceItemWithId);// Añade los datos dentro de la ruta segun la funcion newInvoiceItemWithId
      const createdInvoice = { ...newInvoiceItemWithId, id: docRef.id };//Crea un nuevo espacio dentro de la base de datos
      setInvoiceItems(prevItems => [...prevItems, createdInvoice]);// Carga la funcion setInvoiceItems con los items de la factura por defecto
      setLastCreatedInvoice(createdInvoice);// Utiliza el nuevo y ultimo espacio creado dentro de la base de datos

      setNewInvoiceItem({} as InvoiceItem);//Vacia y carga datos por defecto
      setIsInvoiceModalOpen(false);// Cierra el modal
      setShowAutoCompleteModal(true);// Llama al modal autocompletar
    } catch (error) {//Si no se pudo realizar correctamente la funcion anterior
      console.error("Error al agregar factura:", error);// Mensaje error
      toast({//Mensaje detallado error
        title: "Error",
        description: "Hubo un problema al agregar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para editar una factura
  const handleEditInvoiceItem = (id: string) => {
    setEditingInvoiceId(id)//Extrae el id del Componente
    const itemToEdit = invoiceItems.find(item => item.id === id)//Compara el id del componente
    if (itemToEdit) {//Condicion si existe item para editar entonces, editar
      setNewInvoiceItem(itemToEdit)//Si existe entonces cargar nuevos datos
    }
  }

  // Función para guardar los cambios de una factura
  const handleSaveInvoiceItem = async () => {
    if (!user || !editingInvoiceId) return//Condicion para verificar si el usuario esta iniciado sesion

    try {//Intenta cargar de la base de datos
      await updateDoc(doc(db, `users/${user.uid}/facturacion`, editingInvoiceId), newInvoiceItem)//Entra en las carpetas y llama a la funcion editar campos de facturacion, y se coloca los nuevos campos con la funcion newInvoiceItem
      setInvoiceItems(invoiceItems.map(item => //Mapeado de la estructura de la base de datos segun el id del item
        item.id === editingInvoiceId ? { ...newInvoiceItem, id: editingInvoiceId } : item//Se asegura de que los campos esten igual en la aplicacion como en la base de datos
      ))
      setEditingInvoiceId(null)//Vacia la condicion de colocar datos editados en la factura
      setNewInvoiceItem({} as InvoiceItem)//Vacia la concion de colocar nuevos datos y llama a la funcion por defecto de datos de facturacion
    } catch (error) {//Si es que no se pudo realizar la accion 
      console.error("Error al guardar cambios en la factura:", error)//Mensaje de erro a la consola
      toast({//Mensaje detallado dentro de la consola para el correspondiente analicis
        title: "Error",
        description: "Hubo un problema al guardar los cambios en la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar una factura
  const handleDeleteInvoiceItem = async (id: string) => {
    if (!user) return //Si usuario esta iniciado sesion

    try {//Intentar
      await deleteDoc(doc(db, `users/${user.uid}/facturacion`, id))//Eliminar documento en base al la ruta y en base al id del elemento
      setInvoiceItems(invoiceItems.filter(item => item.id !== id))//Analizar si es que el documento ya no existe
    } catch (error) {//Si esque no se realizo la accion anterior 
      console.error("Error al eliminar factura:", error)//Ejecutar un mensaje en la consola
      toast({//Ejecutar un mensaje detallado en la consola
        title: "Error",
        description: "Hubo un problema al eliminar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }


  {/* Inicio de Sesion */}

  // Función para iniciar sesión con Google
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

  // Función para iniciar sesión con correo electrónico
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión con tu correo electrónico.",
      })
      setIsLoginModalOpen(false)
    } catch (error) {
      console.error("Error al iniciar sesión con correo electrónico:", error)
      toast({
        title: "Error",
        description: "Credenciales incorrectas. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para registrarse con correo electrónico
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Has iniciado sesión automáticamente.",
      })
      setIsLoginModalOpen(false)
    } catch (error) {
      console.error("Error al registrarse:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al crear la cuenta. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
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


  {/* Filtros */}

  // Filtrado de Inventario
  const getUniqueCategories = () => {
    const categories = new Set(inventoryItems.map(item => item.category))//Mapeado en base a la campo de categoria en base al item
    return Array.from(categories).filter(Boolean) // Filtra valores nulos o undefined
  }

  // Filtrado de facturas
  const filteredInvoiceItems = useMemo(() => {
    return invoiceItems.filter(item => {// Devuelva el filtro seleccionado de la factura seleccionado por el usuario
      const itemDate = new Date(item.fechaEmision)
      switch (invoiceFilterType) {// Analiza el filtro devuelto segun el nombre para darle la funcion
        case "day"://Si es = dia entonces
          return item.fechaEmision === invoiceFilterDate //Devuelve el filtro ejecutario si en base al campo de fecha de emision que sea igual al filtro devuelto por el usuario
        case "month":// Si es = mes entonce
          return item.fechaEmision.startsWith(invoiceFilterMonth)
        case "year":// Si es = año entonces
          return item.fechaEmision.startsWith(invoiceFilterYear)
        default:
          return true
      }
    })
  }, [invoiceItems, invoiceFilterType, invoiceFilterDate, invoiceFilterMonth, invoiceFilterYear])//Devolver las funciones en base al analisis de la funcion filteredInvoiceItems


  {/* Vinculacion entre tablas */}

  // Función para Seleccionar Item en Facturacion
  const handleInventoryItemSelect = (itemId: string) => {
    const selectedItem = inventoryItems.find(item => item.idElemento === itemId);// Funcion para analizar y extraer los datos dentro los items segun el idElemento dentro de la base de datos en el apartado de Inventario
    if (selectedItem) {// Si item seleccionado existe
      setSelectedInventoryItem(selectedItem);// Colocar item seleccionado dentro de facturacion en base al idElemento
      setNewInvoiceItem(prev => ({// Analiza los datos que estan en el invetario y los coloca dentro de la facturacion
        ...prev,
        idElemento: selectedItem.idElemento, // colocar IdElemento de invtario en idElemento de Facturacion
        detallesProducto: selectedItem.descripcion,
        precioUnitario: selectedItem.precioVenta
      }));
    }
  };

  // Función para autocompletar la factura en el libro diario 
  const handleAutoCompleteLibroDiario = async () => {
  
    if (!user) {
      console.error("Usuario no autenticado");
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción.",
        variant: "destructive",
      });
      return;
    }
  
    if (!selectedInventoryItem) {
      console.error("No se ha seleccionado un ítem del inventario");
      toast({
        title: "Error",
        description: "Por favor, selecciona un ítem del inventario.",
        variant: "destructive",
      });
      return;
    }
  
    if (!lastCreatedInvoice) {
      console.error("No hay factura creada recientemente");
      toast({
        title: "Error",
        description: "No hay factura reciente para autocompletar en el libro diario.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const newLibroDiarioItem = {
        fecha: lastCreatedInvoice.fechaEmision || new Date().toISOString().split('T')[0],
        nombreCuenta: "",
        descripcion: lastCreatedInvoice.detallesProducto || selectedInventoryItem.descripcion,
        idElemento: lastCreatedInvoice.idElemento || selectedInventoryItem.idElemento,
        haber: 0,
        debe: lastCreatedInvoice.total || 0
      };
  
      console.log("Nuevo ítem para el libro diario:", newLibroDiarioItem);
  
      const docRef = await addDoc(collection(db, `users/${user.uid}/libroDiario`), newLibroDiarioItem);
      console.log("Documento agregado con ID:", docRef.id);
  
      setData(prevData => [...prevData, { ...newLibroDiarioItem, id: docRef.id }]);
  
      toast({
        title: "Éxito",
        description: "Se ha agregado el ítem al libro diario.",
      });
  
      setShowAutoCompleteModal(false);
      setSelectedInventoryItem(null);
      setLastCreatedInvoice(null);
    } catch (error) {
      console.error("Error al agregar ítem al libro diario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el ítem al libro diario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (activeTab !== "facturacion") {
      setSelectedInventoryItem(null);
      setLastCreatedInvoice(null);
    }
  }, [activeTab]);

  {/* Diceños y Estilos */}
  return (
    <>
    {showLandingPage ? (
      // Aplicaccion 
      <div className={`flex h-screen ${theme === 'dark' ? 'bg-black text-gray-200' : 'bg-gray-100 text-gray-900'}`}>

        {/* Visualizador */}
        

          {/* Menu Izquierda*/}
          <div className={`w-64 shadow-md ${theme === "dark" ? "bg-[rgb(20,20,20)] text-gray-300" : "bg-white text-gray-900"}`}>
            <div className="p-4">
              <div className="flex items-center justify-between space-x-2">
                <h1 className="text-2xl font-bold mb-4 mt-2">Alice</h1>
                <Button
                  variant={activeTab === "configuracion" ? "default" : "ghost"}
                  className="ml-10 w-15 justify-end mb-2"
                  onClick={() => setActiveTab("configuracion")}
                >
                  <Settings className=" h-5 w-5" />
                </Button>
              </div>
              {user ? (

                <div className="mb-4 flex items-center">
                  <Avatar className="h-10 w-10 mr-2">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                    <AvatarFallback>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.displayName || user.email}</p>

                    {/* Btn Cerrar Sesion */}
                    <Button variant="ghost" size="sm" onClick={() => setIsLogOutModalOpen(true)}>Cerrar sesión</Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Btn Iniciar Sesíon */}
                  <Button className="w-full mb-4" onClick={() => setIsLoginModalOpen(true)}>
                    Iniciar sesión
                  </Button>
                </>
              )}
              <nav>

                {/* Btn Registro de Inventario */}
                <Button
                  variant={activeTab === "inventario" ? "default" : "ghost"}
                  className="w-full justify-start mb-2"
                  onClick={() => setActiveTab("inventario")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Registro de Inventario
                </Button>

                {/* Btn Registro De Facturacion */}
                <Button
                  variant={activeTab === "facturacion" ? "default" : "ghost"}
                  className="w-full justify-start mb-2"
                  onClick={() => setActiveTab("facturacion")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Registro de Facturación
                </Button>

                {/* Btn Libro Diario */}
                <Button
                  variant={activeTab === "libro-diario" ? "default" : "ghost"}
                  className="w-full justify-start mb-2"
                  onClick={() => setActiveTab("libro-diario")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Libro Diario
                </Button>

                {/* Btn Dashboard */}
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  className="w-full justify-start mb-2"
                  onClick={() => setActiveTab("dashboard")}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>

                {/* Btn Registro De Facturacion */}
                <Button
                  variant={activeTab === "grupos-trabajo" ? "default" : "ghost"}
                  className="w-full justify-start mb-2"
                  onClick={() => setActiveTab("grupos-trabajo")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Grupos de Trabajo
                </Button>

                {/* Btn Generar Registros */}
                <Button
                  variant={activeTab === "generar-registros" ? "default" : "ghost"}
                  className="w-full justify-start mb-2"
                  onClick={() => setActiveTab("generar-registros")}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Generar Registros
                </Button>

              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className={`flex-1 p-8 overflow-auto mr-12 ${theme === "dark" ? "bg-[rgb(20,20,20)] text-gray-300" : "bg-[rgb(85, 85, 85)] text-gray-900"}`}>

            {/* Configuracion Interfaz Estilo */}
            {activeTab === "configuracion" && (
              <ConfiguracionPage />
            )}

            {/* Grupos de Trabajo Interfaz Estilo */}
            {activeTab === "grupos-trabajo" && (
              <div>
                <h2 className="text-3xl font-bold mb-4">Grupos de Trabajo</h2>
                {user && (
                  <>
                    <UserProfile user={user} onUpdateUserType={handleUpdateUserType} />
                    {userData.type === 'personal' ? (
                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Empresas Registradas</h2>
                        <div className="mb-4 flex items-center space-x-4"><Button onClick={() => setShowJoinGroupModal(true)}>Unirse a Grupo de Trabajo</Button></div>
                        <EmpresasRegistradas userId={user.uid} onCargarEmpresa={handleCargarEmpresa} />

                        <SolicitudIngreso userId={user.uid} />
                      </div>
                    ) : (
                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Usuarios Registrados</h2>
                        <UsuariosRegistrados user={user} />

                        <SolicitudPendiente userId={user.uid} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Libro Diario Interfaz Estilo */}
            {activeTab === "libro-diario" && (
              <div>
                {/* Titulo */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold">Libro Diario</h2>
                </div>
                <div className="mb-4 flex items-center space-x-4">

                  {/* Nav */}
                  <Button onClick={() => openFieldEditor('libroDiario')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Campos
                  </Button>
                  <Button onClick={() => setIsCreatingAccountingEntry(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Asiento Contable
                  </Button>

                  {/* Seleccion De Fecha */}
                  <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger className="w-[180px] ml-4">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="diario">Diario</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  {timeFrame === "diario" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-[280px] justify-start text-left font-normal`}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(new Date(selectedDate), "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate ? new Date(selectedDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              // Sumar un día a la fecha seleccionada
                              const adjustedDate = new Date(date);
                              adjustedDate.setDate(adjustedDate.getDate() + 1); // Sumar un día

                              // Formatear la fecha ajustada a 'YYYY-MM-DD'
                              const localDate = adjustedDate.toLocaleDateString('en-CA'); 
                              setSelectedDate(localDate);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                  {timeFrame === "mensual" && (
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-[180px]" />
                      
                  )}
                  {timeFrame === "anual" && (
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      min="1900"
                      max="2099"
                      step="1"
                      className="w-[180px]" />
                  )}
                </div>
                {/* Tablas de Libro Diario */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.entries(appConfig.libroDiario).map(([key, field]) => (
                        <TableHead key={key}>{field.name}</TableHead>
                      ))}
                      <TableHead>
                        <span className="mr-4">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row) => (
                      <TableRow key={row.id}>
                        {Object.entries(appConfig.libroDiario).map(([key, field]) => (
                          <TableCell key={key}>
                            {editingId === row.id ? (
                              <Input
                                type={field.type}
                                value={row[key] || ''}
                                onChange={(e) => handleInputChange(row.id, key, e.target.value)} />
                            ) : (
                              row[key]
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          {editingId === row.id ? (
                            <Button onClick={() => handleSaveRow(row.id)} className="mr-4">
                              <IoIosSave size={20} />
                            </Button>
                          ) : (
                            <Button onClick={() => handleEditRow(row.id)} className="mr-4">
                              <RiEditLine size={20} />
                            </Button>
                          )}
                          <Button variant="destructive" onClick={() => handleDeleteRow(row.id)}>
                            <IoTrashBinSharp size={20} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/*Libro Diario Resumen Financiaero*/}
                <div className="mt-4">
                  <Card className="col-span-2">
                    
                    <CardHeader>
                      <div className="text-center">
                        <CardTitle>Resumen Financiero</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex justify-around items-center">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Debe</p>
                        <p className="text-2xl font-bold text-green-600">${totals.debe.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Haber</p>
                        <p className="text-2xl font-bold text-red-600">${totals.haber.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Balance</p>
                        <p className="text-2xl font-bold">${(totals.debe - totals.haber).toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}

            {/* Dashboard Interfaz Estilo */}
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
                <div className="mb-4 flex items-center space-x-4">
                  <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger className="w-[180px] ml-4">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diario</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  {timeFrame === "diario" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-[280px] justify-start text-left font-normal`}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(new Date(selectedDate), "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={new Date(selectedDate)}
                          onSelect={(date) => date && setSelectedDate(date.toISOString().split('T')[0])}
                          initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                  {timeFrame === "mensual" && (
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-[180px]" />
                  )}
                  {timeFrame === "anual" && (
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      min="1900"
                      max="2099"
                      step="1"
                      className="w-[180px]" />
                  )}
                </div>
                <Tabs defaultValue="financial" className="w-full">
                  <TabsList>
                    <TabsTrigger value="financial" onClick={() => setDashboardType("financial")}>Financiero</TabsTrigger>
                    <TabsTrigger value="inventory" onClick={() => setDashboardType("inventory")}>Inventario</TabsTrigger>
                  </TabsList>
                  <TabsContent value="financial">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/*Dashboard Resumen Financiaero*/}
                      <Card className="col-span-2">
                        <CardHeader>
                          <CardTitle>Resumen Financiero</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-around items-center">
                          <div className="text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Debe</p>
                            <p className="text-2xl font-bold text-green-600">${totals.debe.toFixed(2)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Haber</p>
                            <p className="text-2xl font-bold text-red-600">${totals.haber.toFixed(2)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Balance</p>
                            <p className="text-2xl font-bold">${(totals.debe - totals.haber).toFixed(2)}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Grafico de Barras */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Gráfico de Barras</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="Debe" fill="#4ade80" />
                              <Bar dataKey="Haber" fill="#f87171" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Grafico de Lineas */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Gráfico de Líneas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="fecha" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="Debe" stroke="#4ade80" />
                              <Line type="monotone" dataKey="Haber" stroke="#f87171" />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Grafico de Pastel */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Gráfico Circular</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? "#4ade80" : "#f87171"} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                    </div>
                  </TabsContent>
                  <TabsContent value="inventory">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Resumen de Inventario</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div>
                            <p>Total de ítems:</p>
                            <p className="text-2xl font-bold">{inventoryItems.length}</p>
                          </div>
                          <div>
                            <p>Valor total del inventario:</p>
                            <p className="text-2xl font-bold text-green-600">${inventoryItems.reduce((sum, item) => sum + item.precioCompra * item.cantidadDisponible, 0).toFixed(2)}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Ítems por Categoría</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={Object.entries(inventoryItems.reduce((acc, item) => {
                                  acc[item.category] = (acc[item.category] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Tabla de Inventario</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <Label htmlFor="category-filter">Filtrar por categoría:</Label>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger id="category-filter">
                              <SelectValue placeholder="Todas las categorías" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas las categorías</SelectItem>
                              {Array.from(new Set(inventoryItems.map(item => item.category))).map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Table className="table-auto w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead>Categoría</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead>Precio de Compra</TableHead>
                              <TableHead>Precio de Venta</TableHead>
                            </TableRow>
                          </TableHeader>
                          {/*Filtrado de Inventario*/}
                          <TableBody>
                            {inventoryItems
                              .filter(item => selectedCategory === "all" || item.category === selectedCategory)
                              .map(item => (
                                <TableRow key={item.id}>
                                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                    {item.id}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                                    {item.descripcion}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                    {item.category}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                                    {item.cantidadDisponible}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                    ${parseFloat(item.precioCompra).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                    ${parseFloat(item.precioVenta).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Inventario Interfaz Estilo */}
            {activeTab === "inventario" && (
              <div>
                <div className="flex justify-between items-center mb-4 mr-10">
                  <h2 className="text-3xl font-bold">Registro de Inventario</h2>
                </div>
                <div className="mb-4 flex items-center space-x-4">
                  <Button onClick={() => openFieldEditor('inventario')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Campos
                  </Button>
                  <Button onClick={() => setIsInventoryModalOpen(true)}>
                    Agregar Nuevo Ítem
                  </Button>

                  {/* Filtros */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] ml-4">
                      <SelectValue placeholder="Seleccionar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem 
                        key={category} //Nombre clave en base a categoria
                        value={category}>{category}</SelectItem>//Valor clave en base a categoria
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.entries(appConfig.inventario).map(([key, field]) => (
                        <TableHead key={key}>{field.name}</TableHead>
                      ))}
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems
                      .filter(item => selectedCategory === "all" || item.category === selectedCategory)
                      .map((item) => (
                        <TableRow key={item.id}>
                          {Object.entries(appConfig.inventario).map(([key, field]) => (
                            <TableCell key={key}>
                              {editingInventoryId === item.id ? (
                                <Input
                                  type={field.type}
                                  value={newInventoryItem[key] || ''}
                                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, [key]: e.target.value })} />
                              ) : (
                                advancedViewInventory ? item[key] : (key === 'descripcion' ? item[key] : '•••')
                              )}
                            </TableCell>
                          ))}
                          <TableCell>
                            {editingInventoryId === item.id ? (
                              <Button className="m-1" onClick={handleSaveInventoryItem}>
                                <IoIosSave size={20} />
                              </Button>
                            ) : (
                              <Button className="m-1" onClick={() => handleEditInventoryItem(item.id)}>
                                <RiEditLine size={20} />
                              </Button>
                            )}
                            <Button className="m-1" variant="destructive" onClick={() => handleDeleteInventoryItem(item.id)}>
                                <IoTrashBinSharp size={20} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Facturacion Interfaz Estilo */}
            {activeTab === "facturacion" && (
              <div>
                <div className="flex justify-between items-center mb-4 mr-10">
                  <h2 className="text-3xl font-bold">Registro de Facturación</h2>
                </div>

                <div className="flex justify-between items-center mb-4 mr-10">
                  <div className="mb-4 flex items-center space-x-4">
                    {/* Btn Editar Campos */}
                    <Button onClick={() => openFieldEditor('facturacion')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Campos
                    </Button>
                    {/* Crear Factura */}
                    <Button onClick={() => setIsInvoiceModalOpen(true)}>Crear Factura</Button>

                    {/* Seleccionar Fecha */}
                    <Select value={invoiceFilterType} onValueChange={setInvoiceFilterType}>
                      <SelectTrigger className="w-[180px] ml-4">
                        <SelectValue placeholder="Filtrar por fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las fechas</SelectItem>
                        <SelectItem value="day">Por día</SelectItem>
                        <SelectItem value="month">Por mes</SelectItem>
                        <SelectItem value="year">Por año</SelectItem>
                      </SelectContent>
                    </Select>
                    {invoiceFilterType === "day" && (// Si es la funcion invoiceFilterType es igual a day entonces llama a la funcion setInvoiceFilterDate
                      <Input
                        type="date"// Tipo de dato que es usado
                        value={invoiceFilterDate}// Devolver el valor del filtro seleccionado
                        onChange={(e) => setInvoiceFilterDate(e.target.value)}//LLama a la funcion setInvoiceFilterDate con el valor del dato seleccionado
                        className="ml-4" />//Recuadro donde se muestra la fecha seleccionada
                    )}
                    {invoiceFilterType === "month" && (
                      <Input
                        type="month"
                        value={invoiceFilterMonth}
                        onChange={(e) => setInvoiceFilterMonth(e.target.value)}
                        className="ml-4" />
                    )}
                    {invoiceFilterType === "year" && (
                      <Input
                        type="number"
                        value={invoiceFilterYear}
                        onChange={(e) => setInvoiceFilterYear(e.target.value)}
                        min="1900"
                        max="2099"
                        step="1"
                        className="ml-4" />
                    )}

                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.entries(appConfig.facturacion).map(([key, field]) => (
                        <TableHead key={key}>{field.name}</TableHead>
                      ))}
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoiceItems.map((item) => (
                      <TableRow key={item.id}>
                        {Object.entries(appConfig.facturacion).map(([key, field]) => (
                          <TableCell key={key}>
                            {editingInvoiceId === item.id ? (
                              <Input
                                type={field.type}
                                value={newInvoiceItem[key] || ''}
                                onChange={(e) => setNewInvoiceItem({ ...newInvoiceItem, [key]: e.target.value })} />
                            ) : (
                              advancedViewInvoice ? item[key] : (key === 'numeroFactura' || key === 'cliente' ? item[key] : '•••')
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          {editingInvoiceId === item.id ? (
                            <Button className="m-1" onClick={handleSaveInvoiceItem}>
                              <IoIosSave size={20} />
                            </Button>
                          ) : (
                            <Button className="m-1" onClick={() => handleEditInvoiceItem(item.id)}>
                              <RiEditLine size={20} />
                            </Button>
                          )}
                          <Button className="m-1" variant="destructive" onClick={() => handleDeleteInvoiceItem(item.id)}>
                            <IoTrashBinSharp size={20} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Registros Interfaz Estilo */}
            {activeTab === "generar-registros" && (
              <GenerarRegistros 
              data={data} 
              inventoryItems={inventoryItems} 
              invoiceItems={invoiceItems} 
              appConfig={appConfig} />
            )}

          </div>

          {/* Panel de IA desplegable */}
          <div className={`fixed right-0 top-0 h-full shadow-lg transition-all duration-300 ease-in-out ${isIAOpen ? 'w-96' : 'w-16'} flex flex-col ${theme === "dark" ? 'bg-[rgb(28,28,28)]' : 'bg-[rgb(248,248,248)]'}`}>

            {/* Btn Desplegar Panel */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4"
              onClick={() => setIsIAOpen(!isIAOpen)}
              aria-label={isIAOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
            >
              {isIAOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            </Button>

            {/* Interfaz Panel IA */}
            {isIAOpen && (
              <>
                <div className="flex-grow overflow-auto p-4 pt-16" ref={chatRef}>
                  {messages.map((message, index) => (
                    <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex mb-2">

                    {/* Barra de Texto */}
                    <Input
                      type="text"
                      placeholder="Escribe tu mensaje..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleSendMessage}
                      className="flex-grow mr-2" />
                  </div>
                  <div className="flex justify-between">

                    {/* Btn Subir Archivo */}
                    <Button variant="outline" size="icon" onClick={() => document.getElementById('file-upload')?.click()}>
                      <Upload className="h-4 w-4" />
                      <span className="sr-only">Subir archivo</span>
                    </Button>

                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload} />

                    {/* Btn Hablar Para Escuchar */}
                    <Button variant="outline" size="icon" onClick={handleVoiceInput}>
                      <Mic className="h-4 w-4" />
                      <span className="sr-only">Entrada de voz</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

        {/* MODALES */}
        <div>

          {/* Modal para editar campos */}
          <Dialog open={isEditingFields} onOpenChange={setIsEditingFields}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Editar Campos de {editingSection}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {editingSection && Object.entries(appConfig[editingSection]).map(([key, field]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(editingSection, key, { name: e.target.value })} />
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateField(editingSection, key, { type: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de campo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="icon" onClick={() => deleteField(editingSection, key)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={() => addNewField(editingSection as keyof AppConfig)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Campo
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={saveFieldChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de inicio de sesión */}
          <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 mr-0 mb-4">
                  <DialogTitle>Iniciar sesión</DialogTitle>
                </div>
                <DialogDescription>
                  Inicia Sesión para poder utilizar utilizar las funciones.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4 mr-0 mb-4 items-center">
                <Button onClick={handleGoogleLogin} className="flex items-center justify-center space-x-3 w-full">
                  <FcGoogle size={25} />
                  <span>Iniciar sesión con Google</span>
                </Button>
                <Button onClick={() => {
                  setIsLoginModalOpen(false);
                  setIsEmailLoginModalOpen(true);
                } }
                  className="flex items-center justify-center space-x-3 w-full">
                  <TfiEmail size={25} />
                  <span>Iniciar sesión con correo electrónico</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal de inicio de sesión con correo electrónico */}
          <Dialog open={isEmailLoginModalOpen} onOpenChange={setIsEmailLoginModalOpen}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Iniciar sesión con correo electrónico</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEmailLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit">Iniciar sesión</Button>
                </DialogFooter>
              </form>
              <div className="mt-4 text-center">
                <p>¿No tienes una cuenta?</p>
                <Button variant="link" onClick={handleEmailSignUp}>
                  Registrarse
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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

          {/* Modal para unirse a un grupo */}
          <Dialog open={showJoinGroupModal} onOpenChange={setShowJoinGroupModal}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Unirse a Grupo Empresarial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="group-uid">UID de Empresa</Label>
                <Input
                  id="group-uid"
                  value={joinGroupUID}
                  onChange={(e) => setJoinGroupUID(e.target.value)}
                  placeholder="Ingrese el UID del grupo"
                />
              </div>
              <DialogFooter>
                <Button onClick={() => setShowJoinGroupModal(true)}>Cancelar</Button>
                <Button onClick={handleJoinGroup}>Enviar Solicitud</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Autocompletar */}
          <Dialog open={showAutoCompleteModal} onOpenChange={setShowAutoCompleteModal}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Autocompletar Libro Diario</DialogTitle>
              </DialogHeader>
              <p>¿Desea autocompletar este ítem en el libro diario?</p>
              <DialogFooter>
                <Button onClick={() => setShowAutoCompleteModal(false)}>Cancelar</Button>
                <Button onClick={handleAutoCompleteLibroDiario}>Aceptar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Agregar Nuevos Items */}

          {/* Modal para agregar una nueva factura */}
          <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Crear nueva factura</DialogTitle>
              </DialogHeader>

              {/* Contenido */}
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 p-4">
                  <Select onValueChange={handleInventoryItemSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar ítem" />
                    </SelectTrigger>

                    {/* Campos de facturacion */}
                    <SelectContent>
                      {inventoryItems.map(item => (//Mapeado de la funcion inventoryItems y digitacion de los inputs
                        <SelectItem key={item.idElemento} value={item.idElemento}>
                          {item.idElemento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {Object.entries(appConfig.facturacion).map(([key, field]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{field.name}</Label>
                      <Input
                        id={key}
                        type={field.type}
                        value={newInvoiceItem[key as keyof InvoiceItem] || ''}
                        onChange={(e) => setNewInvoiceItem({ ...newInvoiceItem, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Contenido Inferior */}
              <DialogFooter>
                <Button onClick={() => handleCancelCreationFacturacion(() => {
                setNewInvoiceItem({} as InvoiceItem);
                setIsInvoiceModalOpen(false);
                })}>Cancelar
              </Button>
                <Button onClick={handleAddInvoiceItem}>Crear</Button>
              </DialogFooter>

            </DialogContent>
          </Dialog>

          {/* Modal para agregar nuevo ítem al inventario */}
          <Dialog open={isInventoryModalOpen} onOpenChange={setIsInventoryModalOpen}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Ítem al Inventario</DialogTitle>
              </DialogHeader>

              {/* Contenido */}
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 p-4">
                  {Object.entries(appConfig.inventario).map(([key, field]) => (//Mapeado en base a los campos del usuario
                    <div key={key} className="space-y-2"> 
                      <Label htmlFor={key}>{field.name}</Label>
                      <Input //Agregar nuevo input en base a el nombre y rellenar en base al campo
                        id={key}
                        type={field.type}
                        value={newInventoryItem[key] || ''}
                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Contenido Inferior */}
              <DialogFooter>
              <Button onClick={() => handleCancelCreationInventario(() => {
                setNewInventoryItem({} as InventoryItem);
                setIsInventoryModalOpen(false);
                })}>Cancelar
              </Button>
                <Button onClick={handleAddInventoryItem}>Agregar</Button>
              </DialogFooter>

            </DialogContent>
          </Dialog>

          {/* Modal para crear asiento contable */}
          <Dialog open={isCreatingAccountingEntry} onOpenChange={setIsCreatingAccountingEntry}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Crear Asiento Contable</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 p-4">
                  {Object.entries(appConfig.libroDiario).map(([key, field]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{field.name}</Label>
                      <Input
                        id={key}
                        type={field.type}
                        value={newRow[key] || ''}
                        onChange={(e) => handleNewRowChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button onClick={() => handleCancelCreationLibroDiario(() => {
                  setNewRow({});
                  setIsCreatingAccountingEntry(false);
                  })}>Cancelar
                </Button>
                <Button onClick={() => {
                    handleAddRow();
                    setIsCreatingAccountingEntry(false);
                  }}>Crear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Control de Modales */}

          {/* Modal de confirmación para cancelar creación en Libro Diario */}
          <Dialog open={showCancelConfirmModalLibroDiario} onOpenChange={setShowCancelConfirmModalLibroDiario}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Confirmar cancelación - Libro Diario</DialogTitle>
                <DialogDescription>
                  ¿Está seguro de que desea cancelar la creación del nuevo asiento en el Libro Diario? Los datos no guardados se perderán.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCancelConfirmModalLibroDiario(false)}>No, continuar editando</Button>
                <Button variant="destructive" onClick={confirmCancelLibroDiario}>Sí, cancelar creación</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de confirmación para cancelar creación en Inventario */}
          <Dialog open={showCancelConfirmModalInventario} onOpenChange={setShowCancelConfirmModalInventario}>
            <DialogContent aria-describedby={undefined}>

              {/* Contenido */}
              <DialogHeader>
                <DialogTitle>Confirmar cancelación - Inventario</DialogTitle>
                <DialogDescription>
                  ¿Está seguro de que desea cancelar la creación del nuevo ítem de inventario? Los datos no guardados se perderán.
                </DialogDescription>
              </DialogHeader>

              {/* Contenido Inferior */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCancelConfirmModalInventario(false)}>No, continuar editando</Button>
                <Button variant="destructive" onClick={confirmCancelInventario}>Sí, cancelar creación</Button>
              </DialogFooter>
              
            </DialogContent>
          </Dialog>

          {/* Modal de confirmación para cancelar creación en Facturación */}
          <Dialog open={showCancelConfirmModalFacturacion} onOpenChange={setShowCancelConfirmModalFacturacion}>
            <DialogContent aria-describedby={undefined}>

              {/* Contenido */}
              <DialogHeader>
                <DialogTitle>Confirmar cancelación - Facturación</DialogTitle>
                <DialogDescription>
                  ¿Está seguro de que desea cancelar la creación de la nueva factura? Los datos no guardados se perderán.
                </DialogDescription>
              </DialogHeader>

              {/* Contenido Inferior */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCancelConfirmModalFacturacion(false)}>No, continuar editando</Button>
                <Button variant="destructive" onClick={confirmCancelFacturacion}>Sí, cancelar creación</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      </div>
    ) : (
      //Landing Page
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        
        {/* Landing Page */}
        <LandingPage />

      </div>
    )}
    
    </>
  )
}