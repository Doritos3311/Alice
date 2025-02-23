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

//Enrutamiento
import Link from 'next/link';

//Estilos
import stylesContent from "@/components/estilos/contenido.module.css"
import stylesMenu from "@/components/estilos/menu.module.css"
import stylesService from "@/components/estilos/servicio.module.css"
import stylesLDiario from "@/components/estilos/libroDiario.module.css"
import stylesGruposdeTrabajointerfaz from "@/components/estilos/gruposTrabajo.module.css"
import stylesEstFacturacionRec from "@/components/estilos/esFacRec.module.css" 

//Componentes Aplicacion
import ConfiguracionPage from "@/components/Configuracion/ConfiguracionPage"
import UsuariosRegistrados from '@/components/UsuariosRegistrados/UsuariosRegistrados'
import { EmpresasRegistradas } from '@/components/EmpresasRegistradas/EmpresasRegistradas'
import SolicitudIngreso from '@/components/SolicitudIngreso/SolicitudIngreso'
import SolicitudPendiente from '@/components/SolicitudPendiente/SolicitudPendiente'
import AccesoRestringido from '@/components/AccesoRestringido/AccesoRestringido'
import MensajeNoItems from "@/components/MensajeNoItems/MensajeNoItems"
import ChatPanel from "@/components/ChatPanel/ChatPanel";

//Enrutamiento

//Importaciones de Tipos

//Componentes Shadcn
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { FileSpreadsheet, BarChart2, Package, FileText, Bot, X, Plus, Trash2, Save, Calendar, Upload, Mic, /*User,*/ Star, Edit, Users, Moon, Sun, Settings, Mail, UserCircle, Eye, DollarSign, Handshake, LogOut, Home, ChevronUp, ChevronDown, FileUp, CircleUserRound, Info, Check, Building2, CircleUser } from "lucide-react"
import { toast } from "@/components/hooks/use-toast"
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
import { IoMenu, IoTrashBinSharp } from "react-icons/io5";

// Importaciones de Firebase
import { initializeApp } from "firebase/app"
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth"
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc, arrayUnion, onSnapshot, orderBy, query } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

// Modo Obscuro
import { useTheme } from "next-themes"

// Importaciones Archivo de Exel
import { FileDown } from 'lucide-react'
import GenerarRegistros from '@/components/GenerarRegistros/GenerarRegistros';

// Uso de interfaz
import { Toaster } from "@/components/ui/toaster";
import JoyrideWrapper from "@/components/Joyride/JoyrideWrapper";
import { Step } from '../Joyride/CustomJoyride';


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
    // Aquí puedes llamar a las funciones para obtener o guardar datos
  } else {
    console.log("Ningún usuario autenticado.");
  }
});

interface UserData {
  user: User;
  displayName: string;
  type: 'personal' | 'empresa';
  companyName?: string; // Ahora es una propiedad opcional
  rucCI?: string;
}

{/* Declaracion de Tipados */}

// Definición de Libro Diario
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
  tipoFactura: 'emitida' | 'recibida';
  fechaEmision?: any;
  [key: string]: any
}

// Definicion de Totales de Facturas
type TotalesFactura = {
  SubTotal12IVA: number
  SubTotal0IVA: number
  SubTotalExentoIVA: number
  SubTotalNoObjetoIVA: number
  Descuento: number
  SubTotal: number
  ICE: number
  IVA12: number
  Propina: number
  ValorTotalFinal: number
}

// Definicion Contenido Factura
interface DetalleFactura {
  tipoIVA: string;
  idElemento: string;
  cantidad: string;
  detalle: string;
  precioUnitario: string;
  valorTotal: number;
}

// Definicion Servicios
interface Service {
  id: string
  nombre: string
  descripcion: string
  usoDeItem: string
  costoDeServicio: string
  exento: boolean; // Nuevo campo
  [key: string]: any
}

// Definicion de detalles de servicios
interface ServiceDetail {
  usoDeItem: string;
  gastosPorItem: string;
  cantidad: number;
  gastosPorServicio: string;
}

// Definicion Mensaje
type Message = {
  role: "user" | "assistant";
  content: string;
};

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
  facturacionRecibida: SectionConfig  // Añade esta línea
}

// Definición de Proveedor
type Proveedor = {
  id: string
  nombre: string
  correo: string
  telefono: string
  rucCi: string
  direccionMatriz: string
  direccionSucursal: string
}

// Definición de Cliente
type Cliente = {
  id: string
  nombre: string
  correo: string
  telefono: string
  direccion: string
  rucCi: string
}

{/* Configuracion de Items */}

//Chatgpt IA Key
const openai = new OpenAI({
  apiKey: "",
  dangerouslyAllowBrowser: true
});

// Configuración de la API
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "https://tusitio.com"; // Cambia esto por la URL de tu sitio
const SITE_NAME = "Mi Sitio"; // Cambia esto por el nombre de tu sitio

export default function ContabilidadApp() {

  {/* Declaracion de Estados */}

  // Estado que controla la app o la landing page
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true); 

  // Estado de Inicio de Aplicacion
  const [activeTab, setActiveTab] = useState("configuracion")
  const [identificacionAdquiriente, setIdentificacionAdquiriente] = useState("v0")
  const [isMenuExpanded, setIsMenuExpanded] = useState(true); // Estado para controlar si el menú está expandido

  {/* Estado de tipo de Data */}

  //Tipo de Data Libro Diario
  const [data, setData] = useState<RowData[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRow, setNewRow] = useState<Omit<RowData, 'id'>>({})

  // Estados Inventario
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [newInventoryItem, setNewInventoryItem] = useState<InventoryItem>({} as InventoryItem)

  // Estados Terceros
  const [isTercerosOpen, setIsTercerosOpen] = useState(false)

  // Estados Provedores 
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false)
  const [newProveedor, setNewProveedor] = useState<Proveedor>({} as Proveedor)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([])
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null)
  const [searchTermProveedor, setSearchTermProveedor] = useState("")
  const [proveedorNombre, setProveedorNombre] = useState("")
  const [proveedorCorreo, setProveedorCorreo] = useState("")
  const [proveedorRucCi, setProveedorRucCi] = useState("")
  const [proveedorDireccionMatriz, setProveedorDireccionMatriz] = useState("")
  const [proveedorDireccionSucursal, setProveedorDireccionSucursal] = useState("")

  // Estados Clientes
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false)
  const [newCliente, setNewCliente] = useState<Cliente>({} as Cliente)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [searchTermCliente, setSearchTermCliente] = useState("")
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [clienteNombre, setClienteNombre] = useState("")
  const [clienteCorreo, setClienteCorreo] = useState("")
  const [clienteRucCi, setClienteRucCi] = useState("")

  // Estados Facturacion
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [newInvoiceItem, setNewInvoiceItem] = useState<InvoiceItem>({} as InvoiceItem)
  const [detallesFactura, setDetallesFactura] = useState<DetalleFactura[]>([
    { idElemento: '', cantidad: "0", detalle: '', precioUnitario: '0', valorTotal: 0, tipoIVA: "" }
  ]);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceItem | null>(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [nombreEmisor, setNombreEmisor] = useState("")
  const [correoEmisor, setCorreoEmisor] = useState("")
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFacturacionOpen, setIsFacturacionOpen] = useState(false)
  const [isInvoiceReceivedModalOpen, setIsInvoiceReceivedModalOpen] = useState(false)
  const [totales, setTotales] = useState<TotalesFactura>({
    SubTotal12IVA: 0,
    SubTotal0IVA: 0,
    SubTotalExentoIVA: 0,
    SubTotalNoObjetoIVA: 0,
    Descuento: 0,
    SubTotal: 0,
    ICE: 0,
    IVA12: 0,
    Propina: 0,
    ValorTotalFinal: 0,
  });

  // Estados Dashboard
  const [dashboardType, setDashboardType] = useState("financial")

  // Estados de Servicios
  const [servicios, setServicios] = useState<Service[]>([])
  const [isCreatingService, setIsCreatingService] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null)
  const [isAccountingEntryModalOpen, setIsAccountingEntryModalOpen] = useState(false)
  const [isInvoiceConfirmeModalOpen, setIsInvoiceConfirmeModalOpen] = useState(false)
  const [isEditingService, setIsEditingService] = useState(false)
  const [newService, setNewService] = useState<Service>({
    id: "",
    nombre: "",
    descripcion: "",
    usoDeItem: "",
    costoDeServicio: "",
    exento: false,
    detalles: [],
  });
  const [detallesServicio, setDetallesServicio] = useState<ServiceDetail[]>([
    { usoDeItem: '', gastosPorItem: '0', cantidad: 0, gastosPorServicio: '0' }
  ]);

  // Estados de edicion de inventario
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null)
  
  // Estado Seleccion de Fecha
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // Estado Seleccion de Fecha de la Facturacion
  const [invoiceFilterDate, setInvoiceFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [invoiceFilterMonth, setInvoiceFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [invoiceFilterYear, setInvoiceFilterYear] = useState(new Date().getFullYear().toString())

  // Estado de Ia
  const [isIAOpen, setIsIAOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const chatRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado Vista Avanzada
  const [advancedViewInventory] = useState(true)
  const [advancedViewInvoice] = useState(true)
  
  // Estado de Filtros
  const [invoiceFilterType, setInvoiceFilterType] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [timeFrame, setTimeFrame] = useState("diario")

  // Estados para agregar nuevos items
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // Estados para visualizacion de cuentas
  const [isCreatingAccountingEntry, setIsCreatingAccountingEntry] = useState(false);
  const [userData, setUserData] = useState<{
    rucCI?: string;
    type: 'personal' | 'empresa';
    displayName?: string;
    companyName?: string;
  }>({
    type: 'personal',
    displayName: '',
    companyName: '',
  });

  // Estados para la edición de campos
  const [isEditingFields, setIsEditingFields] = useState(false)
  const [editingSection, setEditingSection] = useState<keyof AppConfig | ''>('')
  const [appConfig, setAppConfig] = useState<AppConfig>({
    libroDiario: {},
    inventario: {},
    facturacion: {},
    facturacionRecibida: {}  // Añade esta línea
  })

  // Estados para Autocompletar Campos
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [showInvoiceRecibedAutoCompleteModal, setShowInvoiceRecibedAutoCompleteModal] = useState(false)
  const [showInvoiceEmitedAutoCompleteModal, setShowInvoiceEmitedAutoCompleteModal] = useState(false)
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

  // Estado Informacion Base de Datos
  const db = getFirestore()

  // Estado para Modo Nocturno
  const { setTheme, theme } = useTheme()

  // Estado que de control de los modales
  const [showCancelConfirmModalLibroDiario, setShowCancelConfirmModalLibroDiario] = useState(false)
  const [showCancelConfirmModalInventario, setShowCancelConfirmModalInventario] = useState(false)
  const [showCancelConfirmModalFacturacion, setShowCancelConfirmModalFacturacion] = useState(false)
  const [cancelActionLibroDiario, setCancelActionLibroDiario] = useState<() => void>(() => {})
  const [cancelActionInventario, setCancelActionInventario] = useState<() => void>(() => {})
  const [cancelActionFacturacion, setCancelActionFacturacion] = useState<() => void>(() => {})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isServiceDeleteModalOpen, setIsServiceDeleteModalOpen] = useState(false)

  // Estado de Control de Permisos
  const [permisosUsuario, setPermisosUsuario] = useState({
    permisoLibroDiario: true,
    permisoInventario: true,
    permisoFacturacion: true,
    permisoDashboard: true,
    permisoGenerarRegistros: true,
    permisoServicios: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [runTour, setRunTour] = useState(false);

  const hayItems = (items: any[]): boolean => {
    return items.length > 0
  }

  {/* Funciones */}

  // Simula un tiempo de carga
  useEffect(() => {
    if (theme == "dark" || theme == "light") {
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

  // Efecto para cargar datos cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      loadUserData();
      loadUserConfig()
      const unsubscribe = loadData(viewingUID);
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

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, viewingUID])  

  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded); // Cambia el estado al hacer clic en el botón
  };

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
          fecha: { name: 'Fecha', type: 'date' },
          nombreCuenta: { name: 'Nombre de Cuenta', type: 'text' },
          descripcion: { name: 'Descripción', type: 'text' },
          idElemento: { name: 'Número de Ítem (ID)', type: 'text' },
          debe: { name: 'Debe', type: 'number' },
          haber: { name: 'Haber', type: 'number' }
        },
        //Datos por defecto inventario
        inventario: {
          idElemento: { name: 'Número de Ítem (ID)', type: 'text' },
          category: { name: 'Categoría', type: 'text' },
          descripcion: { name: 'Descripción del Producto', type: 'text' },
          cantidadDisponible: { name: 'Cantidad Disponible', type: 'number' },
          stockMinimo: { name: 'Stock Mínimo', type: 'number' },
          precioCompra: { name: 'Precio de Compra Unitario', type: 'number' },
          precioVenta: { name: 'Precio de Venta Unitario', type: 'number' },
          fechaIngreso: { name: 'Fecha de Ingreso', type: 'date' },
          proveedor: { name: 'Proveedor', type: 'text' }
        },
        //Datos por defecto facturacion Emitida
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
        },
        //Datos por defecto de facturacion recibida
        facturacionRecibida: {
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
  const loadData = (groupUID: string | null = null) => {
    if (!user) return;
  
    const uidToUse = groupUID || user.uid;
  
    try {
      // Escuchar cambios en la colección 'libroDiario'
      const libroDiarioUnsubscribe = onSnapshot(
        collection(db, `users/${uidToUse}/libroDiario`),
        (libroDiarioSnapshot) => {
          const libroDiarioData = libroDiarioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setData(libroDiarioData);
        }
      );
  
      // Escuchar cambios en la colección 'inventario'
      const inventarioUnsubscribe = onSnapshot(
        collection(db, `users/${uidToUse}/inventario`),
        (inventarioSnapshot) => {
          const inventarioData = inventarioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setInventoryItems(inventarioData);
        }
      );
  
      // Escuchar cambios en la colección 'facturacion'
      const facturacionUnsubscribe = onSnapshot(
        collection(db, `users/${uidToUse}/facturacion`),
        (facturacionSnapshot) => {
          const facturacionData = facturacionSnapshot.docs.map(doc => ({
            id: doc.id,
            tipoFactura: doc.data().tipoFactura || 'emitida', // Valor por defecto para facturas existentes
            ...doc.data()
          })) as InvoiceItem[];
          setInvoiceItems(facturacionData);
        }
      );
  
      // Escuchar cambios en la colección 'servicios'
      const serviciosUnsubscribe = onSnapshot(
        collection(db, `users/${uidToUse}/servicios`),
        (serviciosSnapshot) => {
          const serviciosData = serviciosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
          setServicios(serviciosData);
        }
      );

      // Cargar proveedores
      const proveedoresUnsubscribe = onSnapshot(
        query(collection(db, `users/${uidToUse}/proveedores`), orderBy("nombre")),
        (proveedoresSnapshot) => {
          const proveedoresData = proveedoresSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Proveedor[]
          setProveedores(proveedoresData)
          setFilteredProveedores(proveedoresData)
        },
      )

      // Cargar clientes
      const clientesUnsubscribe = onSnapshot(
        query(collection(db, `users/${uidToUse}/clientes`), orderBy("nombre")),
        (clientesSnapshot) => {
          const clientesData = clientesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Cliente[]
          setClientes(clientesData)
          setFilteredClientes(clientesData)
        },
      )
  
      // Establecer UID de visualización
      setViewingUID(uidToUse);
  
      // Retornar las funciones de limpieza para desuscribirse de las colecciones cuando sea necesario
      return () => {
        libroDiarioUnsubscribe();
        inventarioUnsubscribe();
        facturacionUnsubscribe();
        serviciosUnsubscribe();
        proveedoresUnsubscribe();
        clientesUnsubscribe();
      };
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
  
      // Obtiene los permisos de empresa
      const permisosDoc = await getDoc(doc(db, `users/${user.uid}/Usuario/permisos`));
      if (permisosDoc.exists()) {
        const permisos = permisosDoc.data()[empresaId] || {};
        setPermisosUsuario({
          permisoServicios: permisos.permisoServicios || false,
          permisoLibroDiario: permisos.permisoLibroDiario || false,
          permisoInventario: permisos.permisoInventario || false,
          permisoFacturacion: permisos.permisoFacturacion || false,
          permisoDashboard: permisos.permisoDashboard || false,
          permisoGenerarRegistros: permisos.permisoGenerarRegistros || false,
        });
      }
  
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
      await setDoc(doc(db, `users/${joinGroupUID}/Usuario`, 'solicitudes'), {
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
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, `users/${user.uid}/Usuario`, 'datos'));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setNombreEmisor(data.type === 'empresa' ? data.companyName || '' : data.displayName || '');
        }
      }
    };
    fetchUserData();
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

  // Funcion para Cancelar la Creacion del Libro Diario
  const handleCancelCreationLibroDiario = (action: () => void) => {
    setShowCancelConfirmModalLibroDiario(true);
    setCancelActionLibroDiario(() => action);
  };

  // Funcion para Cancelar la Creacion del Inventario
  const handleCancelCreationInventario = (action: () => void) => {
    setShowCancelConfirmModalInventario(true);
    setCancelActionInventario(() => action);
  };

  // Funcion para Cancelar la Creacion de una Factura
  const handleCancelCreationFacturacion = (action: () => void) => {
    setShowCancelConfirmModalFacturacion(true);
    setCancelActionFacturacion(() => action);
  };

  // Funcion para Cancelar Libro Diario
  const confirmCancelLibroDiario = () => {
    cancelActionLibroDiario();
    setShowCancelConfirmModalLibroDiario(false);
  };

  // Funcion para Cancelar Inventario
  const confirmCancelInventario = () => {
    cancelActionInventario();
    setShowCancelConfirmModalInventario(false);
  };

  // Funcion para Cancelar Facturacion
  const confirmCancelFacturacion = () => {
    cancelActionFacturacion();

    setDetallesFactura([{ idElemento: '', cantidad: "0", detalle: '', precioUnitario: '0', valorTotal: 0, tipoIVA: "" }])
    setTotales({ SubTotal12IVA: 0, SubTotal0IVA: 0, SubTotalExentoIVA: 0, SubTotalNoObjetoIVA: 0, Descuento: 0, SubTotal: 0, ICE: 0, IVA12: 0, Propina: 0, ValorTotalFinal: 0, })
    cleanTerceros ();
    setShowCancelConfirmModalFacturacion(false);
  };

  // Funcion para Cancelar Proveedor
  const handleCloseProveedorModal = () => {
    setIsProveedorModalOpen(false)
    setNewProveedor({} as Proveedor)
    setEditingProveedor(null)
  }

  // Funcion para Cancelar Cliente
  const handleCloseClienteModal = () => {
    setIsClienteModalOpen(false)
    setNewCliente({} as Cliente)
    setEditingCliente(null)
  }


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
    if (!user || !viewingUID) return;//Si usuario existe entonces

    try {//Intetar
      const newRowWithIdElemento = { ...newRow, idElemento: newRow.idElemento || `AC-${Date.now().toString()}`,}// Extrae los datos ingresados de la app
      const docRef = await addDoc(collection(db, `users/${viewingUID}/libroDiario`), newRowWithIdElemento); // Añade un documento segun los datos extraidos
      setData([...data, { ...newRowWithIdElemento, id: docRef.id }]); // Coloca los datos por defecto
      setNewRow({}); // Coloca datos por defecto
      setIsCreatingAccountingEntry(false); // Cerrar el Modal
    } catch (error) { //Si no se pudo realizar
      console.error("Error al agregar fila:", error);//Error a consola
      toast({// Error detallado a la consola
        title: "Error",
        description: "Hubo un problema al agregar la fila. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para editar una fila del libro diario
  const handleEditRow = (id: string) => {
    setEditingId(id) //Edita los campos segun la funcion setEditingId en base al id
  }

  // Función para guardar los cambios de una fila del libro diario
  const handleSaveRow = async (id: string) => {
    if (!viewingUID) return // Analiza si usuario

    const editedRow = data.find(row => row.id === id) // Compara si el item por editar existe
    if (!editedRow) return // Si existe entonces

    try { //Intentar
      await updateDoc(doc(db, `users/${viewingUID}/libroDiario`, id), editedRow) // Espera actualice el item en base al id y segun los campos cambiante
      setEditingId(null)// Vacia con datos por defecto
    } catch (error) {// Si no se pudo ejecutar
      console.error("Error al guardar cambios:", error)// error
      toast({// error detallado
        title: "Error",
        description: "Hubo un problema al guardar los cambios. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar una fila del libro diario
  const handleDeleteRow = async (id: string) => {
    if (!viewingUID) return// si usuario existe

    try {//Intentar 
      await deleteDoc(doc(db, `users/${viewingUID}/libroDiario`, id)) // Borra el documento en base al id
      setData(data.filter(row => row.id !== id)) // Comprueba si es que el documento ya se elimino
    } catch (error) {// si no
      console.error("Error al eliminar fila:", error)//error consola
      toast({// error detallado consola
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

  const ordenDeseadoLd = ["fecha", "nombreCuenta", "descripcion", "idElemento", "debe", "haber"]

  const ordenarCategoriasLd = (categorias: string[]): string[] => {
    const categoriasOrdenadas = ordenDeseadoLd.filter((cat) => categorias.includes(cat))
    const categoriasAdicionales = categorias.filter((cat) => !ordenDeseadoLd.includes(cat))
    return [...categoriasOrdenadas, ...categoriasAdicionales]
  }

  {/* Filtros */}

  // Filtrado de datos para el libro diario
  const filteredData = useMemo(() => {
    return data.filter(row => { // retorna la opccion colocada 
      if (!row || !row.fecha) { // analiza si no existe el filtro
        return false; 
      }
      switch (timeFrame) {// Analiza la variable timeFrame
        case "diario": // Compara si es diario
          return row.fecha === selectedDate; //Devulve la fecha seleccionada
        case "mensual": // Compara si es mensual
          return typeof row.fecha === 'string' && row.fecha.startsWith(selectedMonth); //Devulve la fecha seleccionada
        case "anual": // Compara si es anual
          return typeof row.fecha === 'string' && row.fecha.startsWith(selectedYear); //Devulve la fecha seleccionada
        default:
          return true;//Cierre
      }
    });
  }, [data, timeFrame, selectedDate, selectedMonth, selectedYear]);

  // Cálculo de totales para el libro diario segun la fecha
  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => {// Devolver el valor resultante
      acc.debe += parseFloat(row.debe) || 0 // Analizar el valor de debe
      acc.haber += parseFloat(row.haber) || 0 // Analizar el valor de haber
      return acc // Devuelve los valores
    }, { debe: 0, haber: 0 })
  }, [filteredData])

  // Datos para los gráficos
  const chartData = useMemo(() => {
    return [ // Devuelve los valores debe y haber
      { name: 'Totales', Debe: totals.debe, Haber: totals.haber }
    ]
  }, [totals])

  //Metodo Resultado Filtro Libro Diario
  const lineChartData = useMemo(() => { 
    return filteredData.map(row => ({ //Segun el filtro 
      fecha: row.fecha, // Seleccione el item en base al filtro
      Debe: parseFloat(row.debe) || 0, // Devuelva los valores debe
      Haber: parseFloat(row.haber) || 0 // Devuelva los valores haber
    }))
  }, [filteredData])

  //Metodo Interfaz Libro Diario
  const pieChartData = useMemo(() => { 
    return [ // Devolver name debe/haber sus totales
      { name: 'Debe', value: totals.debe },
      { name: 'Haber', value: totals.haber }
    ]
  }, [totals])


  {/* IA */}

  // Función para enviar mensajes a OpenRouter
  const sendMessageToOpenRouter = async (message: string, context: Message[] = []) => {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free", // Modelo de DeepSeek
          messages: [
            ...context,
            { role: "user", content: message },
          ],
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error al comunicarse con OpenRouter:", error);
      return "Lo siento, hubo un error al procesar tu solicitud.";
    }
  };

  // Función para manejar el envío de mensajes
  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (inputMessage.trim()) {
        const userMessage: Message = { role: "user", content: inputMessage };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");

        try {
          const assistantResponse = await sendMessageToOpenRouter(inputMessage, messages);
          const assistantMessage: Message = { role: "assistant", content: assistantResponse };
          setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
          console.error("Error:", error);
          const errorMessage: Message = { role: "assistant", content: "Lo siento, hubo un error al procesar tu solicitud." };
          setMessages((prev) => [...prev, errorMessage]);
        }
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setInputMessage((prev) => prev + '\n');
    }
  };

  // Función para manejar la entrada de voz
  const handleVoiceInput = () => {
    // Aquí iría la lógica para manejar la entrada de voz
    console.log("Iniciando entrada de voz...")
  }


  {/* Inventario */}

  // Función para agregar un nuevo ítem al inventario
  const handleAddInventoryItem = async () => {
    if (!viewingUID) return;// Si usuario existe entonces

    try {//Intentar
      const docRef = await addDoc(collection(db, `users/${viewingUID}/inventario`), newInventoryItem);// Agregar Documento a la base de datos en base a la ruta y con los datos de esta funcion newInventoryItem
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
    if (!viewingUID || !editingInventoryId) return// Si usuario existe

    try {//Intentar
      await updateDoc(doc(db, `users/${viewingUID}/inventario`, editingInventoryId), newInventoryItem)//Entra a la ruta y actualiza los datos segun la funcion editingInventoryId y newInventoryItem
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
    if (!viewingUID) return;//Si usuario existe
  
    try {//Intentar
      await deleteDoc(doc(db, `users/${viewingUID}/inventario`, id));//Borrar el documento en base al id dentro de la ruta
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

  const ordenDeseadoIv = ["idElemento", "category", "descripcion", "cantidadDisponible", "stockMinimo", "precioCompra" , "precioVenta" , "fechaIngreso", "proveedor"]

  // Funcion para ordenar categorias en inventario
  const ordenarCategoriasIv = (categorias: string[]): string[] => {
    const categoriasOrdenadas = ordenDeseadoIv.filter((cat) => categorias.includes(cat))
    const categoriasAdicionales = categorias.filter((cat) => !ordenDeseadoIv.includes(cat))
    return [...categoriasOrdenadas, ...categoriasAdicionales]
  }

  {/* Provedores */}

  // Función para agregar un nuevo proveedor
  const handleAddProveedor = async () => {
    if (!viewingUID) return

    try {
      const docRef = await addDoc(collection(db, `users/${viewingUID}/proveedores`), newProveedor)
      setProveedores([...proveedores, { ...newProveedor, id: docRef.id }])
      setNewProveedor({} as Proveedor)
      setIsProveedorModalOpen(false)
      toast({
        title: "Éxito",
        description: "Nuevo proveedor agregado.",
      })
    } catch (error) {
      console.error("Error al agregar proveedor:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el proveedor. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para editar un proveedor
  const handleEditProveedor = async (proveedor: Proveedor) => {
    if (!viewingUID) return

    try {
      await updateDoc(doc(db, `users/${viewingUID}/proveedores`, proveedor.id), proveedor)
      setProveedores(proveedores.map((p) => (p.id === proveedor.id ? proveedor : p)))
      setEditingProveedor(null)
      toast({
        title: "Éxito",
        description: "Proveedor actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error al actualizar proveedor:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el proveedor. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un proveedor
  const handleDeleteProveedor = async (id: string) => {
    if (!viewingUID) return

    try {
      await deleteDoc(doc(db, `users/${viewingUID}/proveedores`, id))
      setProveedores(proveedores.filter((p) => p.id !== id))
      toast({
        title: "Éxito",
        description: "Proveedor eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar proveedor:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el proveedor. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Filtro seleccion en factura
  const filterProveedoresFac = (term: string) => {
    const filtered = proveedores.filter((proveedor) => proveedor.nombre.toLowerCase().includes(term.toLowerCase()))
    setFilteredProveedores(filtered)
    if (filtered.length > 0) {
      setSelectedProveedor(filtered[0])
    } else {
      setSelectedProveedor(null)
    }
  }

  // Filtro Proveedores
  const filterProveedores = (term: string) => {
    const filtered = proveedores.filter(
      (proveedor) =>
        proveedor.nombre.toLowerCase().includes(term.toLowerCase()) ||
        (proveedor.rucCi && proveedor.rucCi.toString().toLowerCase().includes(term.toLowerCase()))
    )
    setFilteredProveedores(filtered)
  }

  {/* Clientes */}

  const handleAddCliente = async () => {
    if (!viewingUID) return

    try {
      const docRef = await addDoc(collection(db, `users/${viewingUID}/clientes`), newCliente)
      setClientes([...clientes, { ...newCliente, id: docRef.id }])
      setNewCliente({} as Cliente)
      setIsClienteModalOpen(false)
      toast({
        title: "Éxito",
        description: "Nuevo cliente agregado.",
      })
    } catch (error) {
      console.error("Error al agregar cliente:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el cliente. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para editar un cliente
  const handleEditCliente = async (cliente: Cliente) => {
    if (!viewingUID) return

    try {
      await updateDoc(doc(db, `users/${viewingUID}/clientes`, cliente.id), cliente)
      setClientes(clientes.map((c) => (c.id === cliente.id ? cliente : c)))
      setEditingCliente(null)
      toast({
        title: "Éxito",
        description: "Cliente actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error al actualizar cliente:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el cliente. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un cliente
  const handleDeleteCliente = async (id: string) => {
    if (!viewingUID) return

    try {
      await deleteDoc(doc(db, `users/${viewingUID}/clientes`, id))
      setClientes(clientes.filter((c) => c.id !== id))
      toast({
        title: "Éxito",
        description: "Cliente eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el cliente. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Filtro para Seleccion en Factura
  const filterClientesFac = (term: string) => {
    const filtered = clientes.filter((cliente) => cliente.nombre.toLowerCase().includes(term.toLowerCase()))
    setFilteredClientes(filtered)
    if (filtered.length > 0) {
      setSelectedCliente(filtered[0])
    } else {
      setSelectedCliente(null)
    }
  }

  // Filtro Clientes
  const filterClientes = (term: string) => {
    const filtered = clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(term.toLowerCase()) ||
        (cliente.rucCi && cliente.rucCi.toString().toLowerCase().includes(term.toLowerCase()))
    )
    setFilteredClientes(filtered)
  }

  {/* Facturacion */}

  // Funcion llamar al modal para separar entre factura emitida y recibida
  const handleCreateInvoice = (tipo: 'emitida' | 'recibida') => () => {
    handleAddInvoiceItem(tipo);
  };

  // Funcion para agregar nueva factura
  const handleAddInvoiceItem = async (tipo: 'emitida' | 'recibida') => {
    if (!viewingUID || !db) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una factura.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      if (typeof window === "undefined") return;
  
      const getValue = (id: string) => {
        if (typeof document !== "undefined") {
          return (document.getElementById(id) as HTMLInputElement)?.value || "";
        }
        return "";
      };
  
      // Calcular los totales usando los valores del DOM y la lista de servicios
      const totalesFactura = calcularTotalesFactura(detallesFactura, servicios);
  
      // Recopilar todos los datos de la factura
      const newInvoiceData = {
        ...newInvoiceItem,
        tipoFactura: tipo,
        empresaGuardada: getValue("empresaGuardada"),
        correoEmisorRecibido: getValue("correoEmisorRecibido"),
        idElemento: newInvoiceItem.idElemento || Date.now().toString(),
        nombreEmisor: nombreEmisor,
        correoEmisor: user?.email || correoEmisor || "Sin correo",
        direccionCliente: getValue("direccionCliente"),
        telefono: getValue("telefono"),
        rucEmisor: getValue("rucEmisor"),
        numeroAutorizacion: getValue("numeroAutorizacion"),
        numeroFactura: getValue("numeroFactura"),
        fechaAutorizacion: getValue("fechaAutorizacion"),
        direccionMatriz: getValue("direccionMatriz"),
        direccionSucursal: getValue("direccionSucursal"),
        identificacionAdquiriente: getValue("identificacionAdquiriente"),
        fechaEmision: getValue("fechaEmision"),
        rucCi: getValue("rucCi"),
        guiaRemision: getValue("guiaRemision"),
        formaPago: getValue("formaPago"),
        otros: getValue("otros"),
        detalles: detallesFactura,
        ...totalesFactura,
      };
  
      // Guardar la factura en Firebase
      const docRef = await addDoc(collection(db, `users/${viewingUID}/facturacion`), newInvoiceData);
  
      const createdInvoice = { ...newInvoiceData, id: docRef.id };
  
      // Actualizar el estado local
      setLastCreatedInvoice(createdInvoice);
  
      // Limpiar el formulario y cerrar el modal
      setNewInvoiceItem({} as InvoiceItem);
      if (tipo == "recibida") {
        setIsInvoiceReceivedModalOpen(false);
      } else {
        setIsInvoiceModalOpen(false);
      }
      setDetallesFactura([
        { idElemento: "", cantidad: "0", detalle: "", precioUnitario: "0", valorTotal: 0, tipoIVA: "" },
      ]);
      setTotales({
        SubTotal12IVA: 0,
        SubTotal0IVA: 0,
        SubTotalExentoIVA: 0,
        SubTotalNoObjetoIVA: 0,
        Descuento: 0,
        SubTotal: 0,
        ICE: 0,
        IVA12: 0,
        Propina: 0,
        ValorTotalFinal: 0,
      });
  
      toast({
        title: "Éxito",
        description: "La factura se ha guardado correctamente.",
      });
  
      // Opcional: Mostrar modal de autocompletar
      if (tipo == "recibida") {
        setShowInvoiceRecibedAutoCompleteModal(true);
      } else {
        setShowInvoiceEmitedAutoCompleteModal(true);
      }
    } catch (error) {
      console.error("Error al agregar factura:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Funcion para calcular totales Edicion
  const calcularTotales = (detalles: any[] = []) => {
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return { sumaTotalFilas: 0, iva12: 0, subTotal12IVA: 0 }
    }
    const sumaTotalFilas = detalles.reduce((sum, detalle) => sum + Number.parseFloat(detalle.valorTotal || "0"), 0)
    const iva12 = sumaTotalFilas * 0.15
    const subTotal12IVA = sumaTotalFilas + iva12
  
    return {
      sumaTotalFilas,
      iva12,
      subTotal12IVA,
    }
  }

  // Funcion calcular total en base al iva aplicado
  const calcularValorTotal = (invoice: InvoiceItem) => {
    const { sumaTotalFilas, iva12 } = calcularTotales(invoice.detalles || [])
    const subTotal = Number.parseFloat(invoice.subtotal?.toString() || "0")
    const ice = Number.parseFloat(invoice.ice?.toString() || "0")
    const propina = Number.parseFloat(invoice.propina?.toString() || "0")
  
    return sumaTotalFilas + subTotal + ice + iva12 + propina
  }

  // Funcion para calcular totales creacion
  const calcularTotalesFactura = (detalles: DetalleFactura[], servicios: Service[]): TotalesFactura => {
    let subTotal12IVA = 0;
    let subTotal0IVA = 0;
    let subTotalExentoIVA = 0;
    let subTotalNoObjetoIVA = 0;
  
    detalles.forEach((detalle) => {
      const valorTotal = detalle.valorTotal || 0;
      const servicioSeleccionado = servicios.find((servicio) => servicio.nombre === detalle.idElemento);
  
      if (servicioSeleccionado) {
        switch (servicioSeleccionado.tipoIVA) {
          case "12":
            subTotal12IVA += valorTotal;
            break;
          case "0":
            subTotal0IVA += valorTotal;
            break;
          case "exento":
            subTotalExentoIVA += valorTotal;
            break;
          case "noObjeto":
            subTotalNoObjetoIVA += valorTotal;
            break;
          default:
            subTotal12IVA += valorTotal;
            break;
        }
      }
    });
  
    const descuento = 0; // Siempre 0
    const ice = 0; // Siempre 0
    const propina = 0; // Siempre 0
  
    const subTotal = subTotal12IVA + subTotal0IVA + subTotalExentoIVA + subTotalNoObjetoIVA - descuento;
    const iva12 = subTotal12IVA * 0.15; // Calcular IVA solo para los servicios con IVA del 12%
    const valorTotalFinal = subTotal + ice + iva12 + propina;
  
    return {
      SubTotal12IVA: subTotal12IVA,
      SubTotal0IVA: subTotal0IVA,
      SubTotalExentoIVA: subTotalExentoIVA,
      SubTotalNoObjetoIVA: subTotalNoObjetoIVA,
      Descuento: descuento,
      SubTotal: subTotal,
      ICE: ice,
      IVA12: iva12,
      Propina: propina,
      ValorTotalFinal: valorTotalFinal,
    };
  };

  const calcularTotalesFacturaV2 = (detalles: DetalleFactura[]): TotalesFactura => {
    let subTotal12IVA = 0
    let subTotal0IVA = 0
    let subTotalExentoIVA = 0
    let subTotalNoObjetoIVA = 0

    detalles.forEach((detalle) => {
      const valorTotal = detalle.valorTotal || 0

      switch (detalle.tipoIVA) {
        case "12":
          subTotal12IVA += valorTotal
          break
        case "0":
          subTotal0IVA += valorTotal
          break
        case "exento":
          subTotalExentoIVA += valorTotal
          break
        case "noObjeto":
          subTotalNoObjetoIVA += valorTotal
          break
        default:
          subTotal12IVA += valorTotal
          break
      }
    })

    const descuento = 0 // Siempre 0
    const ice = 0 // Siempre 0
    const propina = 0 // Siempre 0

    const subTotal = subTotal12IVA + subTotal0IVA + subTotalExentoIVA + subTotalNoObjetoIVA - descuento
    const iva12 = subTotal12IVA * 0.15 // Calcular IVA solo para los items/servicios con IVA del 12%
    const valorTotalFinal = subTotal + ice + iva12 + propina

    return {
      SubTotal12IVA: subTotal12IVA,
      SubTotal0IVA: subTotal0IVA,
      SubTotalExentoIVA: subTotalExentoIVA,
      SubTotalNoObjetoIVA: subTotalNoObjetoIVA,
      Descuento: descuento,
      SubTotal: subTotal,
      ICE: ice,
      IVA12: iva12,
      Propina: propina,
      ValorTotalFinal: valorTotalFinal,
    }
  }

  // Función para editar una factura
  const handleEditInvoiceItem = () => {
    setIsEditingInvoice(true);
  };

  // Función para guardar los cambios de una factura
  const handleSaveInvoiceItem = async () => {
    if (!viewingUID || !currentInvoice) {
      toast({
        title: "Error",
        description: "No se pudo guardar la factura. Información de usuario o factura no disponible.",
        variant: "destructive",
      })
      return
    }
  
    try {
      // Verificar si currentInvoice.detalles existe y es un array
      if (!Array.isArray(currentInvoice.detalles) || currentInvoice.detalles.length === 0) {
        toast({
          title: "Error",
          description: "La factura no tiene detalles válidos.",
          variant: "destructive",
        })
        return
      }
  
      // Calcular los totales
      const { sumaTotalFilas, iva12, subTotal12IVA } = calcularTotales(currentInvoice.detalles)
      const valorTotal = calcularValorTotal(currentInvoice)
  
      // Autocompletar los campos calculables
      const updatedInvoice: InvoiceItem = {
        ...currentInvoice,
        nombreEmisor: nombreEmisor,
        correoEmisor: correoEmisor,
        subtotal12iva: subTotal12IVA.toFixed(2),
        iva12: iva12.toFixed(2),
        valortotal: valorTotal.toFixed(2),
        sumaTotalFilas: sumaTotalFilas.toFixed(2),
      }
  
      // Actualizar en Firestore
      await updateDoc(doc(db, `users/${viewingUID}/facturacion`, updatedInvoice.id), updatedInvoice)
  
      // Actualizar el estado local
      setCurrentInvoice(updatedInvoice)
      setInvoiceItems((prevItems) => prevItems.map((item) => (item.id === updatedInvoice.id ? updatedInvoice : item)))
  
      setIsEditingInvoice(false)
      toast({
        title: "Éxito",
        description: "La factura se ha guardado correctamente.",
      })
    } catch (error) {
      console.error("Error al guardar la factura:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar una factura
  const handleDeleteInvoiceItem = async () => {
    if (!viewingUID || !currentInvoice) return

    try {
      await deleteDoc(doc(db, `users/${viewingUID}/facturacion`, currentInvoice.id))
      setInvoiceItems(invoiceItems.filter((item) => item.id !== currentInvoice.id))
      setIsViewInvoiceModalOpen(false)
      setIsDeleteModalOpen(false)
      setCurrentInvoice(null)

      toast({
        title: "Éxito",
        description: "Factura eliminada correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar factura:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Funcion eliminar una fila dentro de la factura
  const eliminarFila = (index: number) => {
    setDetallesFactura(detallesFactura.filter((_, i) => i !== index));
  };

  // Funcion para visualizar la factura creada
  const handleViewInvoice = (invoice: InvoiceItem) => {
    setCurrentInvoice(invoice)
    setNombreEmisor(invoice.nombreEmisor || "")
    setCorreoEmisor(invoice.correoEmisor || "")
    setIsViewInvoiceModalOpen(true)
  };

  // Funcion Crear nueva fila dentro de factura
  const agregarNuevaFila = () => {
    setDetallesFactura([...detallesFactura, { idElemento: '', cantidad: "0", detalle: '', precioUnitario: '0', valorTotal: 0, tipoIVA: "" }]);
  };

  //Funcion de actualizar detalles de factura
  const handleDetalleChange = (index: number, field: string, value: string) => {
    const newDetalles = [...detallesFactura];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
  
    // Si el campo es "cantidad" o "precioUnitario", recalcular el valorTotal
    if (field === "cantidad" || field === "precioUnitario") {
      const cantidad = Number.parseFloat(newDetalles[index].cantidad) || 0;
      const precioUnitario = Number.parseFloat(newDetalles[index].precioUnitario) || 0;
      newDetalles[index].valorTotal = cantidad * precioUnitario;
    }
  
    // Si el campo es "valorTotal", asegúrate de que el valor sea un número válido
    if (field === "valorTotal") {
      newDetalles[index].valorTotal = Number.parseFloat(value) || 0;
    }

    const nuevosTotales = calcularTotalesFactura(newDetalles, servicios);
  
    // Actualizar el estado de detallesFactura y totales
    setDetallesFactura(newDetalles);
    setTotales(nuevosTotales);
  };

  // Funcion para actualizar los inputs dentro de las facturas
  const handleDetalleChangeIv = (index: number, field: string, value: string) => {
    const newDetalles = [...detallesFactura];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
  
    // Si el campo es "cantidad" o "precioUnitario", recalcular el valorTotal
    if (field === "cantidad" || field === "precioUnitario") {
      const cantidad = Number.parseFloat(newDetalles[index].cantidad) || 0;
      const precioUnitario = Number.parseFloat(newDetalles[index].precioUnitario) || 0;
      newDetalles[index].valorTotal = cantidad * precioUnitario;
    }
  
    // Si el campo es "valorTotal", asegúrate de que el valor sea un número válido
    if (field === "valorTotal") {
      newDetalles[index].valorTotal = Number.parseFloat(value) || 0;
    }
  
    // Recalcular los totales basados en los nuevos detalles y la lista de servicios
    const nuevosTotales = calcularTotalesFacturaV2(newDetalles)

    // Actualizar el estado de detallesFactura y totales
    setDetallesFactura(newDetalles);
    setTotales(nuevosTotales)
  };

  // Funcion para limiar los inputs de terceros seleccionados en factura
  const cleanTerceros = () => {
    // Proveedores
    setSelectedProveedor(null)
    setSearchTermProveedor('')
    setProveedorNombre('')
    setProveedorCorreo('')
    setProveedorRucCi('')
    setProveedorDireccionMatriz('')
    setProveedorDireccionSucursal('')
    setProveedorDireccionMatriz('')
    setProveedorDireccionSucursal('')

    //Clientes
    setSelectedCliente(null)
    setSearchTermCliente('')
    setClienteNombre('')
    setClienteCorreo('')
    setClienteRucCi('')
  }

  {/* Servicios */}

  // Funcion para agregar nuevo servicio
  const handleAddService = async () => {
    if (!viewingUID) return;
  
    try {
      const gastosTotalesPorServicio = detallesServicio
        .reduce((total, detalle) => total + parseFloat(detalle.gastosPorServicio || "0"), 0)
        .toFixed(2);
  
      // Crear el objeto del servicio SIN el id (Firebase lo generará automáticamente)
      const serviceToAdd = {
        nombre: newService.nombre,
        descripcion: newService.descripcion,
        usoDeItem: newService.usoDeItem,
        costoDeServicio: newService.costoDeServicio,
        exento: newService.exento,
        tipoIVA: newService.tipoIVA, // Incluir el tipo de IVA
        detalles: detallesServicio,
        fechaCreacion: new Date().toISOString(),
        gastosTotalesPorServicio,
      };
  
      // Agregar el servicio a Firestore y obtener el id generado por Firebase
      const docRef = await addDoc(collection(db, `users/${viewingUID}/servicios`), serviceToAdd);
  
      // Crear el objeto del servicio con el id generado por Firebase
      const addedService = { ...serviceToAdd, id: docRef.id }; // Aquí se usa el id generado por Firebase
  
      // Actualizar el estado con el nuevo servicio
      setServicios([...servicios, addedService]);
  
      // Cerrar el modal y resetear el formulario
      setIsCreatingService(false);
      resetNewService();
  
      // Mostrar notificación de éxito
      toast({
        title: "Éxito",
        description: "Servicio creado correctamente.",
      });
  
    } catch (error) {
      console.error("Error al agregar servicio:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el servicio. Por favor, intenta de nuevo.",
      });
    }
  };

  // Funcion para editar servicio
  const handleEditService = (service: Service) => {
    setNewService({ ...service })
    setDetallesServicio(service.detalles || [])
    setEditingServiceId(service.id)
    setIsEditingService(true)
  }
  
  // Funcion guardar servicio
  const handleSaveService = async () => {
    if (!viewingUID || !editingServiceId) return;
  
    try {
      setIsEditingService(false);
      const gastosTotalesPorServicio = detallesServicio
        .reduce((total, detalle) => total + Number.parseFloat(detalle.gastosPorServicio || "0"), 0)
        .toFixed(2);
  
      const updatedService: Service = {
        ...newService,
        gastosTotalesPorServicio,
        detalles: detallesServicio,
        exento: newService.exento, // Mantener como boolean
        tipoIVA: newService.tipoIVA, // Incluir el tipo de IVA
      };
  
      const serviceRef = doc(db, `users/${viewingUID}/servicios`, editingServiceId);
      await updateDoc(serviceRef, updatedService);
      setServicios(servicios.map((service) => (service.id === editingServiceId ? updatedService : service)));
      resetNewService();
      toast({
        title: "Éxito",
        description: "Servicio Guardado Correctamente.",
      });
    } catch (error) {
      setIsEditingService(true);
      console.error("Error al actualizar servicio:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el servicio. Por favor, intenta de nuevo.",
      });
    }
  };

  // Funcion para limpiar campos del servicio
  const resetNewService = () => {
    setNewService({
      id: "",
      nombre: "",
      descripcion: "",
      usoDeItem: "",
      costoDeServicio: "",
      gastosPorItem: "",
      gastosPorServicio: "",
      cantidad: 1,
      gastosTotalesPorServicio: "0",
      fechaCreacion: "",
      exento: false, // Resetear a false
      tipoIVA: "12", // Valor por defecto "12"
      detalles: [],
    });
    setDetallesServicio([{ usoDeItem: "", gastosPorItem: "0", cantidad: 0, gastosPorServicio: "0" }]);
    setEditingServiceId(null);
  };

  // Funcion borrar servicio
  const handleDeleteService = async () => {
    if (!user?.uid || !serviceToDelete) return

    try {
      await deleteDoc(doc(db, `users/${user.uid}/servicios`, serviceToDelete))
      setServicios(servicios.filter((service) => service.id !== serviceToDelete))
      setIsServiceDeleteModalOpen(false)
      setServiceToDelete(null)
      toast({
        title: "Éxito",
        description: "Servicio eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar servicio:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el servicio. Por favor, intenta de nuevo.",
      })
    }
  }

  // Funcion abrir modal auto generar asiento contable
  const handleGenerarLibroDiario = (serviceId: string) => {
    setCurrentServiceId(serviceId)
    setIsAccountingEntryModalOpen(true)
  }

  // Funcion auto generar asiento contable
  const confirmGenerateAccountingEntry = async () => {
    if (!user?.uid || !currentServiceId) return

    try {
      const service = servicios.find((s) => s.id === currentServiceId)
      if (!service) throw new Error("Servicio no encontrado")

      const asientoContable = {
        fecha: new Date().toISOString().split('T')[0],
        nombreCuenta: `Servicio ${service.nombre}`,
        descripcion: `Ingreso por servicio: ${service.descripcion}`,
        idElemento: service.nombre || "",
        debe: Number.parseFloat(service.costoDeServicio),
        haber: Number.parseFloat(service.gastosTotalesPorServicio) || 0
      }

      await addDoc(collection(db, `users/${user.uid}/libroDiario`), asientoContable)

      toast({
        title: "Éxito",
        description: `Asiento contable generado para el servicio ${service.nombre}`,
      })
    } catch (error) {
      console.error("Error al generar asiento contable:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al generar el asiento contable. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsAccountingEntryModalOpen(false)
      setCurrentServiceId(null)
    }
  }

  // Funcion para agregar nuevos items seleccionables dentro de servicio
  const agregarNuevaFilaService = () => {
    const newDetalles = [...detallesServicio, { usoDeItem: '', gastosPorItem: '0', cantidad: 0, gastosPorServicio: '0' }];
    setDetallesServicio(newDetalles);
  
    // Recalcular los gastos totales
    const gastosTotalesPorServicio = newDetalles.reduce((total, detalle) => 
      total + parseFloat(detalle.gastosPorServicio || '0'), 0).toFixed(2);
  
    setNewService({
      ...newService,
      gastosTotalesPorServicio,
    });
  };

  // Funcion para eliminar items agregados
  const eliminarFilaService = (index: number) => {
    if (detallesServicio.length > 1) {
      const newDetalles = detallesServicio.filter((_, i) => i !== index);
      setDetallesServicio(newDetalles);
      
      // Recalcular los gastos totales
      const gastosTotalesPorServicio = newDetalles.reduce((total, detalle) => 
        total + parseFloat(detalle.gastosPorServicio || '0'), 0).toFixed(2);
  
      setNewService({
        ...newService,
        gastosTotalesPorServicio,
      });
    }
  };

  // Función para manejar cambios en los campos de la fila
  const handleDetalleChangeService = (index: number, field: string, value: string) => {
    const newDetalles = [...detallesServicio];
    newDetalles[index] = {
      ...newDetalles[index],
      [field]: value,
      gastosPorServicio:
        field === "cantidad" && newDetalles[index].usoDeItem
          ? (parseInt(value) * parseFloat(newDetalles[index].gastosPorItem)).toString()
          : newDetalles[index].gastosPorServicio,
    };
    setDetallesServicio(newDetalles);
  
    const gastosTotalesPorServicio = newDetalles.reduce((total, detalle) => 
      total + parseFloat(detalle.gastosPorServicio || '0'), 0).toFixed(2);
  
    setNewService({
      ...newService,
      gastosTotalesPorServicio,
    });
  };

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
    return invoiceItems.filter(item => {
      const itemDate = new Date(item.fechaEmision);
      const isCorrectType = activeTab === "facturacion-emitidas" ? item.tipoFactura === 'emitida' : item.tipoFactura === 'recibida';
      
      if (!isCorrectType) return false;
  
      switch (invoiceFilterType) {
        case "day":
          return item.fechaEmision === invoiceFilterDate;
        case "month":
          return typeof item.fechaEmision === "string" && item.fechaEmision.startsWith(invoiceFilterMonth);
        case "year":
          return typeof item.fechaEmision === "string" && item.fechaEmision.startsWith(invoiceFilterYear);
        default:
          return true;
      }
    });
  }, [invoiceItems, invoiceFilterType, invoiceFilterDate, invoiceFilterMonth, invoiceFilterYear, activeTab]);//Devolver las funciones en base al analisis de la funcion filteredInvoiceItems

  // Filtrado de Proveedores
  useEffect(() => {
    filterProveedores(searchTermProveedor)
  }, [searchTermProveedor])

  // Filtrado de Clientes
  useEffect(() => {
    filterClientes(searchTermCliente)
  }, [searchTermCliente])

  {/* Vinculacion entre tablas */}

  // Función para Seleccionar Item en Facturacion
  const handleInventoryItemSelect = (itemId: string, index: number) => {
    const selectedItem = inventoryItems.find((item) => item.idElemento === itemId)
    if (selectedItem) {
      const newDetalles = [...detallesFactura]
      newDetalles[index] = {
        idElemento: selectedItem.idElemento,
        cantidad: "1",
        detalle: selectedItem.descripcion || selectedItem.nombre,
        precioUnitario: selectedItem.precioCompra,
        valorTotal: Number(selectedItem.precioCompra),
        tipoIVA: selectedItem.tipoIVA,
      }
      setDetallesFactura(newDetalles)

      const nuevosTotales = calcularTotalesFacturaV2(newDetalles)
      setTotales(nuevosTotales)
    }
  }

  // Función para Seleccionar un Servicio en Facturacion
  const handleServiceSelect = (serviceId: string, index: number) => {
    const selectedService = servicios.find((service) => service.id === serviceId);
    if (selectedService) {
      const newDetalles = [...detallesFactura];
      newDetalles[index] = {
        idElemento: selectedService.nombre || "nombre",
        cantidad: '0',
        detalle: selectedService.descripcion,
        precioUnitario: selectedService.costoDeServicio,
        valorTotal: Number(selectedService.costoDeServicio),
        tipoIVA: selectedService.tipoIVA || "15", // Usar el tipo de IVA seleccionado en el servicio
      };
      setDetallesFactura(newDetalles);
      setSelectedService(selectedService);
    }
  };

  // Función para autocompletar la factura recibida en el libro diario 
  const handleInvoiceRecibedAutoCompleteLibroDiario = async () => {
  
    if (!user) {// Si usuario no existe
      console.error("Usuario no autenticado"); // Consola error
      toast({// error detallado
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción.",
        variant: "destructive",
      });
      return;
    }
  
    if (!selectedInventoryItem) { //si item seleccionado no existe
      console.error("No se ha seleccionado un ítem del inventario"); //error
      toast({// error
        title: "Error",
        description: "Por favor, selecciona un ítem del inventario.",
        variant: "destructive",
      });
      return;
    }
  
    if (!lastCreatedInvoice) { //si ultimo item seleccionado no existe
      console.error("No hay factura creada recientemente"); //error
      toast({ //error
        title: "Error",
        description: "No hay factura reciente para autocompletar en el libro diario.",
        variant: "destructive",
      });
      return;
    }
  
    try {// Intentar
      const valorTotal = lastCreatedInvoice.detalles.reduce((total: number, detalle: { valorTotal: string; }) => 
        total + parseFloat(detalle.valorTotal), 0);

      const newLibroDiarioItem = { // Crear un metodo con los datos para una nueva tabla
        fecha: lastCreatedInvoice.fechaEmision || new Date().toISOString().split('T')[0], // Valor fecha segun fecha de facturacion
        nombreCuenta: "Venta "+`Factura #${lastCreatedInvoice.numeroFactura}`, // Nombre de cuenta vacio
        descripcion: lastCreatedInvoice.detallesProducto || selectedInventoryItem.descripcion, // Descriocion segun descripcion facturacion
        idElemento: selectedInventoryItem.idElemento || "", // IdElemento segun idElemento de inventario
        haber: valorTotal.toFixed(2), // Haber 0
        debe: 0 // Debe segun total de facturacion o 0
      };
      
      const docRef = await addDoc(collection(db, `users/${user.uid}/libroDiario`), newLibroDiarioItem);// Agrega a la base de datos el nuevo documento
      console.log("Documento agregado con ID:", docRef.id); // Control de funcionamiento
    
      toast({ //error detallado
        title: "Éxito",
        description: "Se ha agregado el ítem al libro diario.",
      });
  
      setShowInvoiceRecibedAutoCompleteModal(false); // Cerrar el modal de autocompletar 
      setSelectedInventoryItem(null); // Vacia la funcion setSelectedInventoryItem
      setLastCreatedInvoice(null); // Vacia la funcion setLastCreatedInvoice
    } catch (error) { //error
      console.error("Error al agregar ítem al libro diario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el ítem al libro diario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para autocompletar la factura emitida en el libro diario 
  const handleAutoCompleteLibroDiario = async () => {
    if (!user) {// Si usuario no existe
      console.error("Usuario no autenticado"); // Consola error
      toast({// error detallado
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción.",
        variant: "destructive",
      });
      return;
    }
  
    if (!selectedService) { //si item seleccionado no existe
      console.error("No se ha seleccionado un servicio"); //error
      toast({// error
        title: "Error",
        description: "Por favor, selecciona un ítem del inventario.",
        variant: "destructive",
      });
      return;
    }
  
    if (!lastCreatedInvoice) { //si ultimo item seleccionado no existe
      console.error("No hay factura creada recientemente"); //error
      toast({ //error
        title: "Error",
        description: "No hay factura reciente para autocompletar en el libro diario.",
        variant: "destructive",
      });
      return;
    }

    try {
      const valorTotal = lastCreatedInvoice.detalles.reduce((total: number, detalle: { valorTotal: string; }) => 
        total + parseFloat(detalle.valorTotal), 0);

      const newLibroDiarioItem = {
        fecha: lastCreatedInvoice.fechaEmision || new Date().toISOString().split('T')[0],
        nombreCuenta: `Compra Item - Factura #${lastCreatedInvoice.numeroFactura}`,
        descripcion: selectedService.descripcion || lastCreatedInvoice.detallesProducto,
        idElemento: selectedService.id || "",
        haber: 0,
        debe: valorTotal.toFixed(2)
      };
      
      const docRef = await addDoc(collection(db, `users/${user.uid}/libroDiario`), newLibroDiarioItem);
      console.log("Documento agregado con ID:", docRef.id);

      toast({
        title: "Éxito",
        description: "Se ha agregado el servicio al libro diario.",
      });

      setShowInvoiceEmitedAutoCompleteModal(false);
      setSelectedService(null);
      setLastCreatedInvoice(null);
    } catch (error) {
      console.error("Error al agregar servicio al libro diario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el servicio al libro diario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para manejar la selección de un ítem del inventario
  const handleUsoDeItemSelect = (value: any, index: number) => {
    const selectedItem = inventoryItems.find((item) => item.idElemento === value);

    // Actualizar la fila seleccionada
    const newDetalles = [...detallesServicio];
    newDetalles[index] = {
      ...newDetalles[index],
      usoDeItem: value,
      gastosPorItem: selectedItem ? selectedItem.precioCompra : "0",
      gastosPorServicio: selectedItem
        ? (newDetalles[index].cantidad * selectedItem.precioCompra).toString()
        : "0",
    };
    setDetallesServicio(newDetalles);

    // Actualizar el estado newService si es necesario
    if (index === 0) {
      // Suponiendo que solo la primera fila afecta a newService
      setNewService({
        ...newService,
        usoDeItem: value,
        gastosPorItem: selectedItem ? selectedItem.precioCompra : "0",
        gastosPorServicio: selectedItem
          ? (newDetalles[index].cantidad * selectedItem.precioCompra).toString()
          : "0",
      });
    }
  };

  {/* Tour */}

  // Pasos del Menu
  const steps: Step[] = [
    {
      target: '#menu-section',
      content: 'Este es el menú principal. Aquí puedes navegar entre las diferentes secciones de la aplicación.',
      placement: 'right',
      title: 'Menú Principal'
    },
    {
      target: '#inventory-section',
      content: 'Aquí puedes gestionar tu inventario, añadir nuevos productos o actualizar el stock existente.',
      placement: 'right',
      title: 'Inventario'
    },
    {
      target: '#services-section',
      content: 'En la sección de servicios, puedes ver y gestionar todos los servicios que ofreces.',
      placement: 'right',
      title: 'Servicios'
    },
    {
      target: '#terceros-section',
      content: 'En la sección de terceros, puedes ver y gestionar todos proveedores y clientes registrados.',
      placement: 'right',
      title: 'Terceros'
    },
    {
      target: '#billing-section',
      content: 'En la sección de facturación, puedes crear nuevas facturas y ver el historial de facturación.',
      placement: 'right',
      title: 'Facturación'
    },
    {
      target: '#journal-section',
      content: 'El diario contable te permite registrar todas las transacciones financieras de tu negocio.',
      placement: 'right',
      title: 'Diario Contable'
    },
    {
      target: '#dashboard-section',
      content: 'El dashboard te ofrece una visión general de las finanzas de tu negocio con gráficos y estadísticas clave.',
      placement: 'right',
      title: 'Dashboard'
    },
    {
      target: '#coo-work-section',
      content: 'Conecta con tu grupo de trabajo para administrar eficientemente junto a tu equipo.',
      placement: 'right',
      title: 'Grupos de Trabajo'
    },
    {
      target: '#generate-section',
      content: 'Genera un iforme de tus registros en tablas de exel para el manejo de tus datos.',
      placement: 'right',
      title: 'Generar Registros'
    },
  ];

  return (
    <>

    {isLoading ? (

      // Muestra la pantalla de carga
      <div className={`${stylesContent.pantallaCarga} ${theme === "light" ? stylesContent.pantallaCargaLight : stylesContent.pantallaCargaDark}`} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <l-grid size="160" speed="1.5" color={theme === "light" ? "#000" : "#ffffff"}></l-grid>
      </div>

    ) : (

      // Muestra el contenido principal de la aplicación
      <div>
           
           {/* Visualizador Principal */}
          <div className={`flex h-screen ${theme === 'dark' ? 'bg-black text-gray-200' : 'bg-gray-100 text-gray-900'}`}>

            {/* Visualizador */}
            
              {/* Toast */}
              <div>
              <Toaster/>
              </div>

              {/* Menu Izquierda */}
              <div id="menu-section" className={`${stylesMenu.menuContentPrincipal} ${theme === "light" ? stylesMenu.themeLight : stylesMenu.themeDark} ${isMenuExpanded ? "" : stylesMenu.collapsed}`}>
                <div className={`${stylesMenu.menucontent} ${isMenuExpanded ? "" : stylesMenu.collapsed}`}>

                  <div className={stylesMenu.menuheader}>
                    <h1 className={stylesMenu.apptitle}>Alice</h1>

                    <div className={stylesMenu.contentButtons}>
                      <Button className={`${stylesMenu.btnTour} ${theme === "light" ? stylesMenu.btnTourLight : stylesMenu.btnTourDark}`} onClick={() => setRunTour(true)}>
                        <Info className={stylesMenu.iconTour}/>
                      </Button>
                      <Button
                        size="icon"
                        className={`${stylesMenu.menudesplegable1} ${isMenuExpanded ? "" : stylesMenu.collapsed} ${theme === "light" ? stylesMenu.menudesplegable1Light : stylesMenu.menudesplegable1Dark}`}
                        onClick={toggleMenu} // Controla la apertura/cierre del menú
                      >
                        <IoMenu className={stylesMenu.iconmenu} /> {/* Icono para abrir/cerrar el menú */}
                      </Button>
                    </div>
                  </div>

                  {user ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className={stylesMenu.userbutton}>
                          <Avatar className={stylesMenu.useravatar}>
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                            <AvatarFallback className={stylesMenu.avatar}>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                          </Avatar>
                          <span className={stylesMenu.username}>{user.displayName || user.email}</span>
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className={`${stylesMenu.userpopover} ${theme === "light" ? stylesMenu.userpopoverLight : stylesMenu.userpopoverDark}`}>
                        <div className={stylesMenu.userinfo}>
                          <Avatar className={stylesMenu.useravatarlarge}>
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                            <AvatarFallback className={stylesMenu.avatarfallback}>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className={stylesMenu.userdisplayname}>{user.displayName || "Usuario"}</h3>
                            <p className={stylesMenu.useremail}>{user.email}</p>
                          </div>
                        </div>

                        <div className={stylesMenu.divider}></div>

                        <Link href="/" passHref>
                          <Button variant="ghost" size="sm" className={stylesMenu.menuitem}>
                            <Home className={stylesMenu.icon} />
                            Inicio
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={stylesMenu.menuitem}
                          onClick={() => setActiveTab("configuracion")}
                        >
                          <Settings className={stylesMenu.icon} />
                          Configuracion
                        </Button>

                        <div className={stylesMenu.divider}></div>

                        <Button variant="ghost" size="sm" className={stylesMenu.menuitemlogout} onClick={() => setIsLogOutModalOpen(true)}>
                          <LogOut className={stylesMenu.icon} />
                          Cerrar sesión
                        </Button>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Button className={stylesMenu.loginbutton} onClick={() => setIsLoginModalOpen(true)}>
                      Iniciar sesión
                    </Button>
                  )}
                  
                  <nav className={stylesMenu.mainnav}>

                    <Button
                      id="inventory-section"
                      variant={activeTab === "inventario" ? "default" : "ghost"}
                      className={stylesMenu.navitem}
                      onClick={() => setActiveTab("inventario")}
                    >
                      <Package className={stylesMenu.icon} />
                      Registro de Inventario
                    </Button>

                    <Button
                      id="services-section"
                      variant={activeTab === "servicios" ? "default" : "ghost"}
                      className={stylesMenu.navitem}
                      onClick={() => setActiveTab("servicios")}
                    >
                      <Handshake className={stylesMenu.icon} />
                      Servicios
                    </Button>

                    <div className={stylesMenu.navitemgroup}>
                      <Button
                        id="terceros-section"
                        variant={activeTab.startsWith("terceros") ? "default" : "ghost"}
                        className={stylesMenu.navitem}
                        onClick={() => setIsTercerosOpen(!isTercerosOpen)}
                      >
                        <Users className={stylesMenu.icon} />
                        Terceros
                        {isTercerosOpen ? <ChevronUp className={stylesMenu.iconsmall} /> : <ChevronDown className={stylesMenu.iconsmall} />}
                      </Button>
                      {isTercerosOpen && (
                        <div className={stylesMenu.subnav}>
                          <Button
                            variant={activeTab === "proveedores" ? "default" : "ghost"}
                            className={stylesMenu.navitem}
                            onClick={() => setActiveTab("proveedores")}
                          >
                            <Building2 className={stylesMenu.icon} />
                            Proveedores
                          </Button>
                          <Button
                            variant={activeTab === "clientes" ? "default" : "ghost"}
                            className={stylesMenu.navitem}
                            onClick={() => setActiveTab("clientes")}
                          >
                            <CircleUser className={stylesMenu.icon} />
                            Clientes
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className={stylesMenu.navitemgroup}>
                      <Button
                        id="billing-section"
                        variant={activeTab.startsWith("facturacion") ? "default" : "ghost"}
                        className={stylesMenu.navitem}
                        onClick={() => setIsFacturacionOpen(!isFacturacionOpen)}
                      >
                        <FileText className={stylesMenu.icon} />
                        Facturación
                        {isFacturacionOpen ? <ChevronUp className={stylesMenu.iconsmall} /> : <ChevronDown className={stylesMenu.iconsmall} />}
                      </Button>
                      {isFacturacionOpen && (
                        <div className={stylesMenu.subnav}>
                          <Button
                            variant={activeTab === "facturacion-emitidas" ? "default" : "ghost"}
                            className={stylesMenu.navitem}
                            onClick={() => setActiveTab("facturacion-emitidas")}
                          >
                            <FileUp className={stylesMenu.icon} />
                            Facturas Emitidas
                          </Button>
                          <Button
                            variant={activeTab === "facturacion-recibidas" ? "default" : "ghost"}
                            className={stylesMenu.navitem}
                            onClick={() => setActiveTab("facturacion-recibidas")}
                          >
                            <FileDown className={stylesMenu.icon} />
                            Facturas Recibidas
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button
                      id="journal-section"
                      variant={activeTab === "libro-diario" ? "default" : "ghost"}
                      className={stylesMenu.navitem}
                      onClick={() => setActiveTab("libro-diario")}
                    >
                      <FileSpreadsheet className={stylesMenu.icon} />
                      Libro Diario
                    </Button>

                    <Button
                      id="dashboard-section"
                      variant={activeTab === "dashboard" ? "default" : "ghost"}
                      className={stylesMenu.navitem}
                      onClick={() => setActiveTab("dashboard")}
                    >
                      <BarChart2 className={stylesMenu.icon} />
                      Dashboard
                    </Button>

                    <Button
                      id="coo-work-section"
                      variant={activeTab === "grupos-trabajo" ? "default" : "ghost"}
                      className={stylesMenu.navitem}
                      onClick={() => setActiveTab("grupos-trabajo")}
                    >
                      <Users className={stylesMenu.icon} />
                      Grupos de Trabajo
                    </Button>

                    <Button
                      id="generate-section"
                      variant={activeTab === "generar-registros" ? "default" : "ghost"}
                      className={stylesMenu.navitem}
                      onClick={() => setActiveTab("generar-registros")}
                    >
                      <FileDown className={stylesMenu.icon} />
                      Generar Registros
                    </Button>
                  </nav>

                </div>
                <Button
                  size="icon"
                  className={`${stylesMenu.menudesplegable2} ${isMenuExpanded ? "" : stylesMenu.collapsed} ${theme === "light" ? stylesMenu.menudesplegable2Light : stylesMenu.menudesplegable2Dark} ${isMenuExpanded ? "" : stylesMenu.collapsed}`}
                  onClick={toggleMenu} // Controla la apertura/cierre del menú
                >
                  <IoMenu className={stylesMenu.iconmenu} /> {/* Icono para abrir/cerrar el menú */}
                </Button>
              </div>

              {/* Contenido principal */}
              <div className={`flex-1 p-8 overflow-auto mr-12 ${theme === "dark" ? "bg-[rgb(15,15,15)] text-gray-300" : " bg-[rgb(85, 85, 85)] text-gray-900"}`}>

                {/* Configuracion Interfaz Estilo */}
                {activeTab === "configuracion" && (
                  <div>
                    <ConfiguracionPage
                      user={user}
                      setShowLandingPage={setShowLandingPage}
                      setActiveTab={setActiveTab}
                    />
                  </div>
                  
                )}

                {/* Grupos de Trabajo Interfaz Estilo */}
                {activeTab === "grupos-trabajo" && (
                  <div>
                    <h2 className={stylesGruposdeTrabajointerfaz.titulo}>Grupos de Trabajo</h2>
                    {user && (
                      <>
                        {userData.type === 'personal' ? (
                          <div className={stylesGruposdeTrabajointerfaz.mt8}>
                            <Card className={stylesGruposdeTrabajointerfaz.tarjeta}>
                              <h2 className={stylesGruposdeTrabajointerfaz.subtitulo}>Empresas Registradas</h2>
                              <div className={stylesGruposdeTrabajointerfaz.botonesContainer}>
                                <Button onClick={() => setShowJoinGroupModal(true)}>Unirse a Grupo de Trabajo</Button>
                              </div>
                              <EmpresasRegistradas userId={user.uid} onCargarEmpresa={handleCargarEmpresa} />
                              <SolicitudIngreso userId={user.uid} />
                            </Card>
                          </div>
                        ) : (
                          <div className={stylesGruposdeTrabajointerfaz.mt8}>
                            <Card className={stylesGruposdeTrabajointerfaz.tarjeta}>
                              <h2 className={stylesGruposdeTrabajointerfaz.subtitulo}>Usuarios Registrados</h2>
                              <UsuariosRegistrados user={user} />
                              <SolicitudPendiente userId={user.uid} />
                            </Card>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Libro Diario Interfaz Estilo */}
                {activeTab === "libro-diario" && (
                  <AccesoRestringido tienePermiso={permisosUsuario.permisoLibroDiario}>
                    <div>
                      {/* Titulo */}
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-bold">Libro Diario</h2>
                      </div>

                      <div className="border-t border-gray-400 my-4"></div>

                      <div className="mb-4 flex items-center space-x-4">

                        {/* Nav */}
                        <Button onClick={() => openFieldEditor('libroDiario')}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Campos
                        </Button>
                        <Button onClick={() => setIsCreatingAccountingEntry(true)}>
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
                      {hayItems(filteredData) ? (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {ordenarCategoriasLd(Object.keys(appConfig.libroDiario)).map((categoria) => (
                                <TableHead key={categoria}>{appConfig.libroDiario[categoria]?.name || categoria}</TableHead>
                              ))}
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                          {filteredData.map((row) => (
                            <TableRow key={row.id}>
                              {ordenarCategoriasLd(Object.keys(appConfig.libroDiario)).map((categoria) => (
                                <TableCell key={categoria}>
                                  {editingId === row.id ? (
                                    <Input
                                      type={appConfig.libroDiario[categoria]?.type || "text"}
                                      value={row[categoria] || ""}
                                      onChange={(e) => handleInputChange(row.id, categoria, e.target.value)}
                                    />
                                  ) : (
                                    row[categoria]
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
                      </>
                      ) : (
                        <div className={stylesContent.contentNoItemsLDiario}>
                          <MensajeNoItems
                          mensaje="Aún no has agregado ningún asiento contable."
                          accion={() => setIsCreatingAccountingEntry(true)}
                          textoBoton="Agregar Asiento Contable"
                          />
                        </div>
                      )}
                    </div>
                  </AccesoRestringido>
                )}

                {/* Dashboard Interfaz Estilo */}
                {activeTab === "dashboard" && (
                  <AccesoRestringido tienePermiso={permisosUsuario.permisoDashboard}>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>

                      <div className="border-t border-gray-400 my-4"></div>

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
                  </AccesoRestringido>
                )}

                {/* Inventario Interfaz Estilo */} 
                {activeTab === "inventario" && (
                  <AccesoRestringido tienePermiso={permisosUsuario.permisoInventario}>
                    <div>

                      <div className="flex justify-between items-center mb-4 mr-10">
                        <h2 className="text-3xl font-bold">Registro de Inventario</h2>
                      </div>

                      <div className="border-t border-gray-400 my-4"></div>

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
                      {hayItems(inventoryItems) ? (
                      <>        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {ordenarCategoriasIv(Object.keys(appConfig.inventario)).map((categoria) => (
                                <TableHead key={categoria}>{appConfig.inventario[categoria]?.name || categoria}</TableHead>
                              ))}
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inventoryItems
                              .filter((item) => selectedCategory === "all" || item.category === selectedCategory)
                              .map((item) => (
                                <TableRow key={item.id}>
                                  {ordenarCategoriasIv(Object.keys(appConfig.inventario)).map((categoria) => (
                                    <TableCell key={categoria}>
                                      {editingInventoryId === item.id ? (
                                        <Input
                                          type={appConfig.inventario[categoria]?.type || "text"}
                                          value={newInventoryItem[categoria] || ""}
                                          onChange={(e) =>
                                            setNewInventoryItem({ ...newInventoryItem, [categoria]: e.target.value })
                                          }
                                        />
                                      ) : advancedViewInventory ? (
                                        item[categoria]
                                      ) : categoria === "descripcion" ? (
                                        item[categoria]
                                      ) : (
                                        "•••"
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
                                    <Button
                                      className="m-1"
                                      variant="destructive"
                                      onClick={() => handleDeleteInventoryItem(item.id)}
                                    >
                                      <IoTrashBinSharp size={20} />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>

                      </>
                      ) : (
                        <div className={stylesContent.contentNoItemsInventario}>
                          <MensajeNoItems
                            mensaje="Aún no has agregado ningún ítem al inventario."
                            accion={() => setIsInventoryModalOpen(true)}
                            textoBoton="Agregar Ítem al Inventario"
                          />
                        </div>
                      )}
                    </div>
                  </AccesoRestringido>
                )}  

                {/* Facturacion Emitidas Interfaz Estilo */}
                {activeTab === "facturacion-emitidas" && (
                  <AccesoRestringido tienePermiso={permisosUsuario.permisoFacturacion}>
                  <div className={stylesEstFacturacionRec.facturaContainer}>

                    <div className={stylesEstFacturacionRec.headerContainer}>
                      <h2 className={stylesEstFacturacionRec.headerTitle}>Registro de Facturación Emitida</h2>
                    </div>
                    
                    <div className={`${stylesEstFacturacionRec.divider} ${theme === "light" ? stylesEstFacturacionRec.dividerLight : stylesEstFacturacionRec.dividerDark}`}></div>
                    
                    <div className={stylesEstFacturacionRec.contentContainer}>
                      <div className={stylesEstFacturacionRec.innerContainer}>
                        
                          {/* Crear Factura Emitida */}
                          <Button onClick={() => setIsInvoiceModalOpen(true)}>Emitir Factura</Button>

                          {/* Seleccionar Fecha */}
                          <Select value={invoiceFilterType} onValueChange={setInvoiceFilterType}>
                          <SelectTrigger className={stylesEstFacturacionRec.selectContainer}>
                              <SelectValue placeholder="Filtrar por fecha" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas las fechas</SelectItem>
                              <SelectItem value="day">Por día</SelectItem>
                              <SelectItem value="month">Por mes</SelectItem>
                              <SelectItem value="year">Por año</SelectItem>
                            </SelectContent>
                          </Select>
                          {invoiceFilterType === "day" && (
                            <Input
                              type="date"
                              value={invoiceFilterDate}
                              onChange={(e) => setInvoiceFilterDate(e.target.value)}
                              className={stylesEstFacturacionRec.inputField} />
                          )}
                          {invoiceFilterType === "month" && (
                            <Input
                              type="month"
                              value={invoiceFilterMonth}
                              onChange={(e) => setInvoiceFilterMonth(e.target.value)}
                              className={stylesEstFacturacionRec.inputField} />
                          )}
                          {invoiceFilterType === "year" && (
                            <Input
                              type="number"
                              value={invoiceFilterYear}
                              onChange={(e) => setInvoiceFilterYear(e.target.value)}
                              min="1900"
                              max="2099"
                              step="1"
                              className={stylesEstFacturacionRec.inputField} />
                          )}
                        </div>
                    </div>
                      
                    {hayItems(filteredInvoiceItems) ? (
                    <>
                      <div className={stylesEstFacturacionRec.invoiceGrid}>
                        {filteredInvoiceItems.map((factura) => (
                          <Card key={factura.id} className={stylesEstFacturacionRec.cardContainer}>
                            <CardHeader className={`${stylesEstFacturacionRec.cardHeader} ${theme === "light" ? stylesEstFacturacionRec.cardHeaderLight : stylesEstFacturacionRec.cardHeaderDark}`}>
                          <CardTitle className={`${stylesService.cardTitle} ${theme === "light" ? stylesService.cardTitleLight : stylesService.cardTitleDark}`}>
                                <span className={stylesEstFacturacionRec.titulo}>Factura N°{factura.numeroFactura}</span>
                              </CardTitle>
                            </CardHeader>
                            
                            <CardContent className={stylesEstFacturacionRec.cardContent}>
                            <div className={stylesEstFacturacionRec.container}>
                            <p className={stylesEstFacturacionRec.textSmall}>
                            <Calendar className={stylesEstFacturacionRec.icon} />
                                <span className="font-medium text-muted-foreground">Emisión:</span>
                                <span className={stylesEstFacturacionRec.truncate}>{factura.fechaEmision}</span>
                                </p>
                                <p className={stylesEstFacturacionRec.textSmall}>
                                <CircleUserRound className={stylesEstFacturacionRec.icon} />
                                <span className="font-medium text-muted-foreground">Cliente:</span>
                                <span className={stylesEstFacturacionRec.truncate}>{factura.identificacionAdquiriente}</span>
                                </p>
                                <p className={stylesEstFacturacionRec.textSmall}>
                                <UserCircle className={stylesEstFacturacionRec.icon} />
                                  <span className="font-medium text-muted-foreground">Emisor:</span>
                                  <span className={stylesEstFacturacionRec.truncate}>{factura.empresaGuardada}</span>
                                </p>
                                <p className={stylesEstFacturacionRec.textSmall}>
                                  <Mail className={stylesEstFacturacionRec.icon} />
                                  <span className="font-medium text-muted-foreground">Correo:</span>
                                  <span className={stylesEstFacturacionRec.truncate}>{factura.correoEmisorRecibido}</span>
                                </p>
                              </div>
                            </CardContent>

                            <CardFooter className={`${stylesEstFacturacionRec.cardFooter} ${theme === "light" ? stylesEstFacturacionRec.cardFooterLight : stylesEstFacturacionRec.cardFooterDark}`}>
                              <p className={stylesEstFacturacionRec.textSmallBold}>
                                Total: ${typeof factura.ValorTotalFinal === 'number' ? factura.ValorTotalFinal.toFixed(2) : (parseFloat(factura.ValorTotalFinal) || 0).toFixed(2)}
                              </p>
                              <Button
                                  size="icon"
                                  onClick={() => handleViewInvoice(factura)}>
                                  <Eye className={stylesEstFacturacionRec.iconLarge} />
                                </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </>
                    ) : (
                      <div className={stylesContent.contentNoItems}>
                        <MensajeNoItems
                          mensaje="Aún no has agregado ninguna factura."
                          accion={() => setIsInvoiceModalOpen(true)}
                          textoBoton="Crear Nueva Factura"
                        />
                      </div>
                    )}
                  </div>
                  </AccesoRestringido>
                )}

                {/* Facturacion Recibidas Interfaz Estilo */}
                {activeTab === "facturacion-recibidas" && (
                  <AccesoRestringido tienePermiso={permisosUsuario.permisoFacturacion}>
                    <div className={stylesEstFacturacionRec.facturaContainer}>
                      <div className={stylesEstFacturacionRec.headerContainer}>
                        <h2 className={stylesEstFacturacionRec.headerTitle}>Registro de Facturación Recibida</h2>
                      </div>

                      <div className={`${stylesEstFacturacionRec.divider} ${theme === "light" ? stylesEstFacturacionRec.dividerLight : stylesEstFacturacionRec.dividerDark}`}></div>

                      <div className={stylesEstFacturacionRec.contentContainer}>
                        <div className={stylesEstFacturacionRec.innerContainer}>
                          
                            {/* Crear Factura Recibida */}
                            <Button onClick={() => setIsInvoiceReceivedModalOpen(true)}>Registrar Factura Recibida</Button>

                            {/* Seleccionar Fecha */}
                            <Select value={invoiceFilterType} onValueChange={setInvoiceFilterType}>
                            <SelectTrigger className={stylesEstFacturacionRec.selectContainer}>
                                <SelectValue placeholder="Filtrar por fecha" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todas las fechas</SelectItem>
                                <SelectItem value="day">Por día</SelectItem>
                                <SelectItem value="month">Por mes</SelectItem>
                                <SelectItem value="year">Por año</SelectItem>
                              </SelectContent>
                            </Select>
                            {invoiceFilterType === "day" && (
                              <Input
                                type="date"
                                value={invoiceFilterDate}
                                onChange={(e) => setInvoiceFilterDate(e.target.value)}
                                className={stylesEstFacturacionRec.inputField} />
                            )}
                            {invoiceFilterType === "month" && (
                              <Input
                                type="month"
                                value={invoiceFilterMonth}
                                onChange={(e) => setInvoiceFilterMonth(e.target.value)}
                                className={stylesEstFacturacionRec.inputField} />
                            )}
                            {invoiceFilterType === "year" && (
                              <Input
                                type="number"
                                value={invoiceFilterYear}
                                onChange={(e) => setInvoiceFilterYear(e.target.value)}
                                min="1900"
                                max="2099"
                                step="1"
                                className={stylesEstFacturacionRec.inputField} />
                            )}
                          </div>
                      </div>
                      
                      {hayItems(filteredInvoiceItems.filter(item => item.tipoFactura === 'recibida')) ? (
                        <div className={stylesEstFacturacionRec.invoiceGrid}>
                          {filteredInvoiceItems
                            .filter(factura => factura.tipoFactura === 'recibida')
                            .map((factura) => (
                              <Card key={factura.id} className={stylesEstFacturacionRec.cardContainer}>
                                <CardHeader className={`${stylesEstFacturacionRec.cardHeader} ${theme === "light" ? stylesEstFacturacionRec.cardHeaderLight : stylesEstFacturacionRec.cardHeaderDark}`}>
                                <CardTitle className={`${stylesEstFacturacionRec.cardTitle} ${theme === "light" ? stylesEstFacturacionRec.cardTitleLight : stylesEstFacturacionRec.cardTitleDark}`}>
                                      <span className={stylesEstFacturacionRec.titulo}>Factura N°{factura.numeroFactura}</span>
                                    </CardTitle>
                                  </CardHeader>
                                  
                                  <CardContent className={stylesEstFacturacionRec.cardContent}>
                                  <div className={stylesEstFacturacionRec.container}>
                                  <p className={stylesEstFacturacionRec.textSmall}>
                                  <Calendar className={stylesEstFacturacionRec.icon} />
                                      <span className="font-medium text-muted-foreground">Emisión:</span>
                                      <span className={stylesEstFacturacionRec.truncate}>{factura.fechaEmision}</span>
                                      </p>
                                      <p className={stylesEstFacturacionRec.textSmall}>
                                      <CircleUserRound className={stylesEstFacturacionRec.icon} />
                                      <span className="font-medium text-muted-foreground">Cliente:</span>
                                      <span className={stylesEstFacturacionRec.truncate}>{factura.identificacionAdquiriente}</span>
                                      </p>
                                      <p className={stylesEstFacturacionRec.textSmall}>
                                      <UserCircle className={stylesEstFacturacionRec.icon} />
                                        <span className="font-medium text-muted-foreground">Emisor:</span>
                                        <span className={stylesEstFacturacionRec.truncate}>{factura.empresaGuardada}</span>
                                      </p>
                                      <p className={stylesEstFacturacionRec.textSmall}>
                                        <Mail className={stylesEstFacturacionRec.icon} />
                                        <span className="font-medium text-muted-foreground">Correo:</span>
                                        <span className={stylesEstFacturacionRec.truncate}>{factura.correoEmisorRecibido}</span>
                                      </p>
                                    </div>
                                  </CardContent>

                                  <CardFooter className={`${stylesEstFacturacionRec.cardFooter} ${theme === "light" ? stylesEstFacturacionRec.cardFooterLight : stylesEstFacturacionRec.cardFooterDark}`}>
                                    <p className={stylesEstFacturacionRec.textSmallBold}>
                                      Total: ${typeof factura.ValorTotalFinal === 'number' ? factura.ValorTotalFinal.toFixed(2) : (parseFloat(factura.ValorTotalFinal) || 0).toFixed(2)}
                                    </p>
                                    <Button
                                        size="icon"
                                        onClick={() => handleViewInvoice(factura)}>
                                        <Eye className={stylesEstFacturacionRec.iconLarge} />
                                      </Button>
                                  </CardFooter>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className={stylesEstFacturacionRec.contenedor}>
                          <MensajeNoItems
                            mensaje="Aún no has agregado ninguna factura recibida."
                            accion={() => setIsInvoiceReceivedModalOpen(true)}
                            textoBoton="Crear Nueva Factura Recibida"
                          />
                        </div>
                      )}
                    </div>
                  </AccesoRestringido>
                )}

                {/* Registros Interfaz Estilo */}
                {activeTab === "generar-registros" && (
                  <AccesoRestringido tienePermiso={permisosUsuario.permisoGenerarRegistros}>
                    <GenerarRegistros 
                    data={data} 
                    inventoryItems={inventoryItems} 
                    invoiceItems={invoiceItems} 
                    appConfig={appConfig} />
                  </AccesoRestringido>
                )}

                {/* Servicios Interfaz Estilo */}
                {activeTab === "servicios" && (
                  
                  <AccesoRestringido tienePermiso={permisosUsuario.permisoServicios}>
                    <div className={stylesService.serviciosPrincipalContent}>

                      <div className={stylesService.serviciosContainer}>
                        <h2 className="text-3xl font-bold">Servicios</h2>
                      </div>

                      <div className={`${stylesContent.separacion} ${theme === "light" ? stylesContent.separacionLight : stylesContent.separacionDark}`}></div>

                      <div className={stylesService.serviciosCabecera}>
                        <Button onClick={() => setIsCreatingService(true)} disabled={isCreatingService}>
                          Agregar Nuevo Servicio
                        </Button>
                      </div>

                      {hayItems(servicios) ? (
                      <>
                      <div className={stylesService.serviciosContentent}>
                        {servicios.map((servicio) => (

                        <Card key={servicio.id} className={stylesService.card}>

                          <CardHeader className={`${stylesService.cardHeader} ${theme === "light" ? stylesService.cardHeaderLight : stylesService.cardHeaderDark}`}>
                            <CardTitle className={`${stylesService.cardTitle} ${theme === "light" ? stylesService.cardTitleLight : stylesService.cardTitleDark}`} >
                              <span className={stylesService.nameService}>{servicio.nombre}</span>
                            </CardTitle>
                          </CardHeader>

                          <CardContent className={stylesService.cardContent}>
                            <div className={stylesService.cardContentInner}>
                              <p>
                                <Calendar className={stylesService.icon} />
                                <span className="font-medium text-muted-foreground">Descripción:</span>
                                <span className="ml-2 truncate">{servicio.descripcion}</span>
                              </p>
                              <p>
                                <CircleUserRound className={stylesService.icon} />
                                <span className="font-medium text-muted-foreground">IVA:</span>
                                <span className="ml-2 truncate">{servicio.tipoIVA}</span>
                              </p>
                              <p>
                                <DollarSign className={stylesService.icon} />
                                <span className="font-medium text-muted-foreground">Gasto por de Servicio:</span>
                                <span className="ml-2 truncate">${servicio.gastosTotalesPorServicio}</span>
                              </p>
                              <p>
                                <DollarSign className={stylesService.icon} />
                                <span className="font-medium text-muted-foreground">Costo de Servicio:</span>
                                <span className="ml-2 truncate">${servicio.costoDeServicio}</span>
                              </p>
                            </div>
                          </CardContent>

                          <CardFooter className={`${stylesService.cardFooter} ${theme === "light" ? stylesService.cardFooterLight : stylesService.cardFooterDark}`}>
                            <div className={stylesService.buttonGroupA}>
                              <Button size="sm" onClick={() => handleGenerarLibroDiario(servicio.id)}>
                                Generar Asiento Contable
                              </Button>
                            </div>
                            <div className={stylesService.buttonGroupB}>
                              <Button size="sm" onClick={() => handleEditService(servicio)}>
                                <RiEditLine className={stylesService.icon} />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setServiceToDelete(servicio.id);
                                  setIsServiceDeleteModalOpen(true);
                                }}
                              >
                                <IoTrashBinSharp className={stylesService.icon} />
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>

                        ))}
                      </div>
                      </>
                      ) : (
                        <div className={stylesContent.contentNoItems}>
                          <MensajeNoItems
                            mensaje="Aún no has agregado ningún servicio."
                            accion={() => setIsCreatingService(true)}
                            textoBoton="Agregar Nuevo Servicio"
                          />
                        </div>
                      )}
                    </div>
                  </AccesoRestringido>
                  
                )}

                {/* Proveedores Interfaz Estilo */}
                {activeTab === "proveedores" && (
                  <div>
                    <h2 className="text-3xl font-bold mb-4">Proveedores</h2>

                    <div className={`${stylesContent.separacion} ${theme === "light" ? stylesContent.separacionLight : stylesContent.separacionDark}`}></div>

                    <div className="flex items-center mb-4">
                      <Button onClick={() => setIsProveedorModalOpen(true)}>Agregar Proveedor</Button>
                      <Input
                        placeholder="Buscar proveedor"
                        value={searchTermProveedor}
                        onChange={(e) => setSearchTermProveedor(e.target.value)}
                        className="max-w-sm ml-4"
                      />
                    </div>
                    {filteredProveedores.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>Telefono</TableHead>
                            <TableHead>RUC/CI</TableHead>
                            <TableHead>Dirección Matriz</TableHead>
                            <TableHead>Dirección Sucursal</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProveedores.map((proveedor) => (
                            <TableRow key={proveedor.id}>
                              <TableCell>{proveedor.nombre}</TableCell>
                              <TableCell>{proveedor.correo}</TableCell>
                              <TableCell>{proveedor.telefono}</TableCell>
                              <TableCell>{proveedor.rucCi}</TableCell>
                              <TableCell>{proveedor.direccionMatriz}</TableCell>
                              <TableCell>{proveedor.direccionSucursal}</TableCell>
                              <TableCell>
                                <Button onClick={() => setEditingProveedor(proveedor)}>Editar</Button>
                                <Button variant="destructive" onClick={() => handleDeleteProveedor(proveedor.id)}>
                                  Eliminar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className={stylesContent.contentNoItems}>
                        <MensajeNoItems
                          mensaje="Aún no has agregado ningún proveedor."
                          accion={() => setIsProveedorModalOpen(true)}
                          textoBoton="Agregar Proveedor"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Clientes Interfaz Estilo */}
                {activeTab === "clientes" && (
                  <div>
                    <h2 className="text-3xl font-bold mb-4">Clientes</h2>

                    <div className={`${stylesContent.separacion} ${theme === "light" ? stylesContent.separacionLight : stylesContent.separacionDark}`}></div>

                    <div className="flex items-center mb-4">
                      <Button onClick={() => setIsClienteModalOpen(true)}>Agregar Cliente</Button>
                      <Input
                        placeholder="Buscar cliente"
                        value={searchTermCliente}
                        onChange={(e) => setSearchTermCliente(e.target.value)}
                        className="max-w-sm ml-4"
                      />
                    </div>
                    {filteredClientes.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Correo</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Dirección</TableHead>
                          <TableHead>RUC/CI</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClientes.map((cliente) => (
                          <TableRow key={cliente.id}>
                            <TableCell>{cliente.nombre}</TableCell>
                            <TableCell>{cliente.correo}</TableCell>
                            <TableCell>{cliente.telefono}</TableCell>
                            <TableCell>{cliente.direccion}</TableCell>
                            <TableCell>{cliente.rucCi}</TableCell>
                            <TableCell>
                              <Button onClick={() => setEditingCliente(cliente)}>Editar</Button>
                              <Button variant="destructive" onClick={() => handleDeleteCliente(cliente.id)}>
                                Eliminar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    ) : (
                      <div className={stylesContent.contentNoItems}>
                        <MensajeNoItems
                          mensaje="Aún no has agregado ningún cliente."
                          accion={() => setIsClienteModalOpen(true)}
                          textoBoton="Agregar Cliente"
                        />
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Panel de IA desplegable */}
              <ChatPanel 
              isIAOpen={isIAOpen} 
                setIsIAOpen={setIsIAOpen} 
                setActiveTab={setActiveTab} 
                setIsCreatingAccountingEntry={setIsCreatingAccountingEntry} 
                setIsInventoryModalOpen={setIsInventoryModalOpen} 
                setIsInvoiceModalOpen={setIsInvoiceModalOpen}
                setIsInvoiceReceivedModalOpen={setIsInvoiceReceivedModalOpen}
                setNewRow={setNewRow}
              />

            {/* MODALES */}
            <div>

              {/* Modal para editar campos */}
              <Dialog open={isEditingFields} onOpenChange={setIsEditingFields}>
                <DialogContent aria-describedby={undefined}>

                  {/* Cabecera */}
                  <DialogHeader>
                    <DialogTitle>Editar Campos de {editingSection}</DialogTitle>
                  </DialogHeader>

                  {/* Contenido */}
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

                  {/* Contenido Inferior */}
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
                    <Link href="/" passHref> 
                      <Button className="flex items-center justify-center space-x-3 w-full bg-red-600 hover:bg-red-400"
                      onClick={()=> {
                        handleLogout()
                        setIsLogOutModalOpen(false)
                        }}>
                        Confirmar
                      </Button>
                    </Link>
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

              {/* Modal de Autocompletar Factura Recibida */}
              <Dialog open={showInvoiceRecibedAutoCompleteModal} onOpenChange={setShowInvoiceRecibedAutoCompleteModal}>
                <DialogContent aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>Autocompletar Libro Diario</DialogTitle>
                  </DialogHeader>
                  <p>¿Desea autocompletar este ítem en el libro diario?</p>
                  <DialogFooter>
                    <Button onClick={() => setShowInvoiceRecibedAutoCompleteModal(false)}>Cancelar</Button>
                    <Button onClick={handleInvoiceRecibedAutoCompleteLibroDiario}>Aceptar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Modal de Autocompletar Factura Emitida */}
              <Dialog open={showInvoiceEmitedAutoCompleteModal} onOpenChange={setShowInvoiceEmitedAutoCompleteModal}>
                <DialogContent aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>Autocompletar Libro Diario</DialogTitle>
                  </DialogHeader>
                  <p>¿Desea autocompletar este ítem en el libro diario?</p>
                  <DialogFooter>
                    <Button onClick={() => setShowInvoiceEmitedAutoCompleteModal(false)}>Cancelar</Button>
                    <Button onClick={handleAutoCompleteLibroDiario}>Aceptar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Modal Provedores */}

              {/* Modal para agregar/editar proveedor */}
              <Dialog open={isProveedorModalOpen || editingProveedor !== null} onOpenChange={handleCloseProveedorModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingProveedor ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={editingProveedor?.nombre || newProveedor.nombre || ""}
                        onChange={(e) =>
                          editingProveedor
                            ? setEditingProveedor({ ...editingProveedor, nombre: e.target.value })
                            : setNewProveedor({ ...newProveedor, nombre: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="correo">Correo</Label>
                      <Input
                        id="correo"
                        type="email"
                        value={editingProveedor?.correo || newProveedor.correo || ""}
                        onChange={(e) =>
                          editingProveedor
                            ? setEditingProveedor({ ...editingProveedor, correo: e.target.value })
                            : setNewProveedor({ ...newProveedor, correo: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={editingProveedor?.telefono || newProveedor.telefono || ""}
                        onChange={(e) =>
                          editingProveedor
                            ? setEditingProveedor({ ...editingProveedor, telefono: e.target.value })
                            : setNewProveedor({ ...newProveedor, telefono: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="rucCi">RUC/CI</Label>
                      <Input
                        id="rucCi"
                        value={editingProveedor?.rucCi || newProveedor.rucCi || ""}
                        onChange={(e) =>
                          editingProveedor
                            ? setEditingProveedor({ ...editingProveedor, rucCi: e.target.value })
                            : setNewProveedor({ ...newProveedor, rucCi: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccionMatriz">Dirección Matriz</Label>
                      <Input
                        id="direccionMatriz"
                        value={editingProveedor?.direccionMatriz || newProveedor.direccionMatriz || ""}
                        onChange={(e) =>
                          editingProveedor
                            ? setEditingProveedor({ ...editingProveedor, direccionMatriz: e.target.value })
                            : setNewProveedor({ ...newProveedor, direccionMatriz: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccionSucursal">Dirección Sucursal</Label>
                      <Input
                        id="direccionSucursal"
                        value={editingProveedor?.direccionSucursal || newProveedor.direccionSucursal || ""}
                        onChange={(e) =>
                          editingProveedor
                            ? setEditingProveedor({ ...editingProveedor, direccionSucursal: e.target.value })
                            : setNewProveedor({ ...newProveedor, direccionSucursal: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCloseProveedorModal}>Cancelar</Button>
                    <Button
                      onClick={() => {
                        if (editingProveedor) {
                          handleEditProveedor(editingProveedor)
                        } else {
                          handleAddProveedor()
                        }
                      }}
                    >
                      {editingProveedor ? "Guardar Cambios" : "Agregar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Modal Clientes */}

              {/* Modal para agregar/editar cliente */}
              <Dialog open={isClienteModalOpen || editingCliente !== null} onOpenChange={handleCloseClienteModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCliente ? "Editar Cliente" : "Agregar Nuevo Cliente"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={editingCliente?.nombre || newCliente.nombre || ""}
                        onChange={(e) =>
                          editingCliente
                            ? setEditingCliente({ ...editingCliente, nombre: e.target.value })
                            : setNewCliente({ ...newCliente, nombre: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="correo">Correo</Label>
                      <Input
                        id="correo"
                        type="email"
                        value={editingCliente?.correo || newCliente.correo || ""}
                        onChange={(e) =>
                          editingCliente
                            ? setEditingCliente({ ...editingCliente, correo: e.target.value })
                            : setNewCliente({ ...newCliente, correo: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={editingCliente?.telefono || newCliente.telefono || ""}
                        onChange={(e) =>
                          editingCliente
                            ? setEditingCliente({ ...editingCliente, telefono: e.target.value })
                            : setNewCliente({ ...newCliente, telefono: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccion">Direccion</Label>
                      <Input
                        id="direccion"
                        value={editingCliente?.direccion || newCliente.direccion || ""}
                        onChange={(e) =>
                          editingCliente
                            ? setEditingCliente({ ...editingCliente, direccion: e.target.value })
                            : setNewCliente({ ...newCliente, direccion: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="rucCi">RUC/CI</Label>
                      <Input
                        id="rucCi"
                        value={editingCliente?.rucCi || newCliente.rucCi || ""}
                        onChange={(e) =>
                          editingCliente
                            ? setEditingCliente({ ...editingCliente, rucCi: e.target.value })
                            : setNewCliente({ ...newCliente, rucCi: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCloseClienteModal}>Cancelar</Button>
                    <Button
                      onClick={() => {
                        if (editingCliente) {
                          handleEditCliente(editingCliente)
                        } else {
                          handleAddCliente()
                        }
                      }}
                    >
                      {editingCliente ? "Guardar Cambios" : "Agregar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Modales Facturacion */}

              {/* Modal para visualizar una factura */}
              <Dialog open={isViewInvoiceModalOpen} onOpenChange={setIsViewInvoiceModalOpen}>
                <DialogContent className="bg-background text-foreground max-w-4xl" aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditingInvoice ? "Editor de Factura" : "Visualizador de Factura"}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Visualizador */}
                  {currentInvoice && (
                    <ScrollArea className="max-h-[80vh]">
                      <div className="space-y-4 p-4">

                        {/* Cabecera */}
                        <div className="grid grid-cols-2 gap-4">

                          {/* Superior Izquierda */}
                          <div className="border p-4 rounded-md">
                            <div className="col-span-2">
                              {isEditingInvoice ? (
                                <>
                                  <Label htmlFor="empresaGuardada">Empresa Emisora</Label>
                                  <Input
                                    id="empresaGuardada"
                                    className={`${!isEditingInvoice ? 'bg-background border-none' : ''}`} 
                                    style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                    value={currentInvoice.empresaGuardada || ''}
                                    onChange={(e) => setCurrentInvoice({...currentInvoice, empresaGuardada: e.target.value})}
                                    disabled={!isEditingInvoice}
                                  />
                                </>
                              ) : (
                                <h2 className="text-xl font-bold">{currentInvoice.empresaGuardada || "Nombre Comercial"}</h2>
                              )}
                            </div>
                            <div className="col-span-2 mt-2">
                              {isEditingInvoice ? (
                                <>
                                  <Label htmlFor="correoEmisorRecibido">Correo de Empresa Emisora</Label>
                                  <Input
                                    id="correoEmisorRecibido"
                                    className={`${!isEditingInvoice ? 'bg-background border-none' : ''}`} 
                                    style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                    value={currentInvoice.correoEmisorRecibido || ''}
                                    onChange={(e) => setCurrentInvoice({...currentInvoice, correoEmisorRecibido: e.target.value})}
                                    disabled={!isEditingInvoice}
                                  />
                                </>
                              ) : (
                                <p className="text-sm text-gray-600">{currentInvoice.correoEmisorRecibido || "Razón Social Emisor"}</p>
                              )}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                              <div className="space-y-2">
                                <Label htmlFor="direccionMatriz">Dirección Matriz:</Label>
                                <Input 
                                  id="direccionMatriz" 
                                  className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                  style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                  value={currentInvoice.direccionMatriz || ''} 
                                  onChange={(e) => setCurrentInvoice({...currentInvoice, direccionMatriz: e.target.value})}
                                  disabled={!isEditingInvoice}
                                />
                              </div>
                              <div className="space-y-2 mt-2">
                                <Label htmlFor="direccionSucursal">Dirección Sucursal:</Label>
                                <Input 
                                  id="direccionSucursal" 
                                  className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                  style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                  value={currentInvoice.direccionSucursal || ''} 
                                  onChange={(e) => setCurrentInvoice({...currentInvoice, direccionSucursal: e.target.value})}
                                  disabled={!isEditingInvoice}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Superior Derecha */}
                          <div className="border p-4 rounded-md space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="rucEmisor">R.U.C Emisor:</Label>
                              <Input 
                                id="rucEmisor" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.rucEmisor || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, rucEmisor: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="numeroAutorizacion">Número de Autorización:</Label>
                              <Input 
                                id="numeroAutorizacion" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.numeroAutorizacion || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, numeroAutorizacion: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="numeroFactura">Número de Factura:</Label>
                              <Input 
                                id="numeroFactura" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.numeroFactura || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, numeroFactura: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fechaAutorizacion">Fecha Autorización:</Label>
                              <Input 
                                id="fechaAutorizacion" 
                                type="date" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.fechaAutorizacion || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, fechaAutorizacion: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                          </div>

                        </div>
                        
                        {/* Inferior de Cabecera */}
                        <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                          <div className="space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="identificacionAdquiriente">Identificación Adquiriente:</Label>
                              <Input 
                                id="identificacionAdquiriente" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.identificacionAdquiriente || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, identificacionAdquiriente: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="correoEmisorRecibido">Correo Adquiriente:</Label>
                              <Input 
                                id="correoEmisorRecibido" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.correoEmisorRecibido} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, correoEmisorRecibido: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="telefono">Teléfono Adquiriente:</Label>
                              <Input 
                                id="telefono" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.telefono} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, telefono: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fechaEmision">Fecha de Emisión:</Label>
                              <Input 
                                id="fechaEmision" 
                                type="date" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.fechaEmision || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, fechaEmision: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="rucCi">R.U.C/C.I:</Label>
                              <Input 
                                id="rucCi" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.rucCi || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, rucCi: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="direccionCliente">Dirección Adquiriente:</Label>
                              <Input 
                                id="direccionCliente" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.direccionCliente} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, direccionCliente: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="guiaRemision">Guía de Remisión:</Label>
                              <Input 
                                id="guiaRemision" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.guiaRemision || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, guiaRemision: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="border p-4 rounded-md">
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="w-1/6">Código</th>
                                <th className="w-1/6">Cantidad</th>
                                <th className="w-2/6">Detalle</th>
                                <th className="w-1/6">P. Unitario</th>
                                <th className="w-1/6">V. Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentInvoice.detalles && currentInvoice.detalles.map((detalle: { idElemento: string | number | readonly string[] | undefined; cantidad: string | number | readonly string[] | undefined; detalle: string | number | readonly string[] | undefined; precioUnitario: string | number | readonly string[] | undefined; valorTotal: string | number | readonly string[] | undefined; }, index: number) => (
                                <tr key={index}>
                                  <td>
                                    <Input 
                                      className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                      style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                      value={detalle.idElemento} 
                                      onChange={(e) => {
                                        const newDetalles = [...currentInvoice.detalles];
                                        newDetalles[index] = {...newDetalles[index], idElemento: e.target.value};
                                        setCurrentInvoice({...currentInvoice, detalles: newDetalles});
                                      }}
                                      disabled={!isEditingInvoice}
                                    />
                                  </td>
                                  <td>
                                    <Input 
                                      className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                      style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                      value={detalle.cantidad} 
                                      onChange={(e) => {
                                        const newDetalles = [...currentInvoice.detalles];
                                        newDetalles[index] = {...newDetalles[index], cantidad: e.target.value};
                                        setCurrentInvoice({...currentInvoice, detalles: newDetalles});
                                      }}
                                      disabled={!isEditingInvoice}
                                    />
                                  </td>
                                  <td>
                                    <Input 
                                      className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                      style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                      value={detalle.detalle} 
                                      onChange={(e) => {
                                        const newDetalles = [...currentInvoice.detalles];
                                        newDetalles[index] = {...newDetalles[index], detalle: e.target.value};
                                        setCurrentInvoice({...currentInvoice, detalles: newDetalles});
                                      }}
                                      disabled={!isEditingInvoice}
                                    />
                                  </td>
                                  <td>
                                    <Input 
                                      className={`${!isEditingInvoice ? 'bg-background ' : ''}`}
                                      style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                      value={detalle.precioUnitario} 
                                      onChange={(e) => {
                                        const newDetalles = [...currentInvoice.detalles];
                                        newDetalles[index] = {...newDetalles[index], precioUnitario: e.target.value};
                                        setCurrentInvoice({...currentInvoice, detalles: newDetalles});
                                      }}
                                      disabled={!isEditingInvoice}
                                    />
                                  </td>
                                  <td>
                                    <Input 
                                      className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                      style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                      value={detalle.valorTotal} 
                                      readOnly 
                                      disabled={!isEditingInvoice}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Contenido Inferior */}
                        <div className="grid grid-cols-2 gap-4">

                          {/* Inferior Izquierda */}
                          <div className="border p-4 rounded-md space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="formaPago">Forma de Pago:</Label>
                              <Input 
                                id="formaPago" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.formaPago || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, formaPago: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="otros">Otros:</Label>
                              <Input 
                                id="otros" 
                                className={`${!isEditingInvoice ? 'bg-background' : ''}`}
                                style={!isEditingInvoice ? { color: 'white', opacity: 1, cursor: 'default' } : {}}
                                value={currentInvoice.otros || ''} 
                                onChange={(e) => setCurrentInvoice({...currentInvoice, otros: e.target.value})}
                                disabled={!isEditingInvoice}
                              />
                            </div>
                          </div>

                          {/* Inferior Derecha */}
                          <div className="border p-4 rounded-md space-y-2">
                            {[
                              { id: "SubTotal12IVA", label: "Sub. Total 15% IVA" },
                              { id: "SubTotal0IVA", label: "Sub. Total 0% IVA" },
                              { id: "SubTotalExentoIVA", label: "Sub. Total Exento IVA" },
                              { id: "SubTotalNoObjetoIVA", label: "Sub. Total No Objeto IVA" },
                              { id: "Descuento", label: "Descuento" },
                              { id: "SubTotal", label: "Sub Total" },
                              { id: "ICE", label: "ICE" },
                              { id: "IVA12", label: "IVA 15%" },
                              { id: "Propina", label: "Propina" },
                              { id: "ValorTotalFinal", label: "Valor Total" },
                            ].map((item) => (
                              <div key={item.id} className="space-y-2">
                                <Label htmlFor={item.id}>{item.label}:</Label>
                                <Input
                                  id={item.id}
                                  type="number"
                                  placeholder="0.00"
                                  value={currentInvoice[item.id] || 0}
                                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, [item.id]: e.target.value })}
                                  className={`${!isEditingInvoice ? "bg-background" : ""}`}
                                  style={!isEditingInvoice ? { color: "white", opacity: 1, cursor: "default" } : {}}
                                  disabled={!isEditingInvoice}
                                  readOnly
                                />
                              </div>
                            ))}
                          </div>

                        </div>
                      </div>
                    </ScrollArea>
                  )}

                  {/* Editor */}
                  <DialogFooter>
                    {isEditingInvoice ? (
                      <>
                        <Button onClick={() => setIsEditingInvoice(false)}>Cancelar</Button>
                        <Button onClick={handleSaveInvoiceItem}>Guardar Cambios</Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => setIsViewInvoiceModalOpen(false)}>Cerrar</Button>
                        <Button onClick={handleEditInvoiceItem}>
                          <RiEditLine size={20} />
                        </Button>
                        <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                          <IoTrashBinSharp size={20} />
                        </Button>
                      </>
                    )}
                  </DialogFooter>

                </DialogContent>
              </Dialog>

              {/* Modal para emitir una nueva factura */}
              <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
                <DialogContent className="max-w-4xl" aria-describedby={undefined}>

                  <DialogHeader>
                    <DialogTitle>Crear nueva factura</DialogTitle>
                  </DialogHeader>

                  <ScrollArea className="max-h-[80vh]">
                    <div className="space-y-4 p-4">

                      
                      {/* Cabecera */}
                      <div className="grid grid-cols-2 gap-4">

                        {/* Superior Izquierda */}
                        <div className="border p-4 rounded-md">
                          <div className="col-span-2">
                            <Label htmlFor="empresaGuardada">Empresa Emisora</Label>
                            <Input id="empresaGuardada" placeholder="Ingrese el nombre de la empresa" value={nombreEmisor || "Nombre Comercial"}/>
                          </div>
                          <div className="col-span-2 mt-2">
                            <Label htmlFor="correoEmisor">Correo Empresa Emisora</Label>
                            <Input id="correoEmisor" placeholder="Ingrese el nombre de la empresa" value={correoEmisor || "Correo Comercial"}/>
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor="direccionMatriz">Dirección Matriz:</Label>
                              <Input id="direccionMatriz" placeholder="Ingrese la dirección matriz" />
                            </div>
                            <div className="space-y-2 mt-2">
                              <Label htmlFor="direccionSucursal">Dirección Sucursal (si es necesario):</Label>
                              <Input id="direccionSucursal" placeholder="Ingrese la dirección de la sucursal" />
                            </div>
                          </div>
                        </div>

                        {/* Superior Derecha */}
                        <div className="border p-4 rounded-md space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="rucEmisor">R.U.C Emisor:</Label>
                            <Input id="rucEmisor" placeholder="Ingrese el R.U.C del emisor" type="number" value={userData.rucCI} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numeroAutorizacion">Número de Autorización:</Label>
                            <Input id="numeroAutorizacion" placeholder="Ingrese el número de autorización" type="number" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numeroFactura">Número de Factura:</Label>
                            <Input id="numeroFactura" placeholder="Ingrese el número de factura" type="number" value={1} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fechaAutorizacion">Fecha Autorización:</Label>
                            <Input id="fechaAutorizacion" type="date" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button onClick={() => setIsClienteModalOpen(true)}>
                          Agregar Nuevo Cliente
                        </Button>
                        <Input
                          placeholder="Buscar cliente"
                          value={searchTermCliente}
                          onChange={(e) => {
                            setSearchTermCliente(e.target.value)
                            filterClientesFac(e.target.value)
                          }}
                        />
                        <Select
                          value={selectedCliente?.id || ""}
                          onValueChange={(value) => {
                            const cliente = filteredClientes.find((c) => c.id === value)
                            if (cliente) setSelectedCliente(cliente)
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredClientes.map((cliente) => (
                              <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => {
                            if (selectedCliente) {
                              setClienteNombre(selectedCliente.nombre)
                              setClienteCorreo(selectedCliente.correo)
                              setClienteRucCi(selectedCliente.rucCi)
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Inferior de Cabecera */}
                      <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="identificacionAdquiriente">Identificación Adquiriente:</Label>
                            <Input id="identificacionAdquiriente" placeholder="Ingrese la identificación del adquiriente" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="correoEmisorRecibido">Correo Adquiriente:</Label>
                            <Input id="correoEmisorRecibido" placeholder="Correo del adquiriente" value={clienteCorreo} onChange={(e) => setClienteCorreo(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono Adquiriente:</Label>
                            <Input id="telefono" placeholder="Teléfono del adquiriente" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fechaEmision">Fecha de Emisión:</Label>
                            <Input id="fechaEmision" type="date" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="rucCi">R.U.C/C.I:</Label>
                            <Input id="rucCi" placeholder="Ingrese el R.U.C o C.I" type="number" value={clienteRucCi} onChange={(e) => setClienteRucCi(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="direccionCliente">Dirección Adquiriente:</Label>
                            <Input id="direccionCliente" placeholder="Dirección del adquiriente" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="guiaRemision">Guía de Remisión:</Label>
                            <Input id="guiaRemision" placeholder="Ingrese la guía de remisión" type="number" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Button onClick={() => setIsCreatingService(true)} disabled={isCreatingService}>
                          Agregar Nuevo Servicio
                        </Button>
                      </div>

                      {/* Contenido */}
                      <div className="border p-4 rounded-md">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="w-1/6">Código</th>
                              <th className="w-1/6">Cantidad</th>
                              <th className="w-2/6">Detalle</th>
                              <th className="w-1/6">P. Unitario</th>
                              <th className="w-1/6">V. Total</th>
                              <th className="w-1/12">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detallesFactura?.map((detalle, index) => (
                              <tr key={index}>
                                <td>
                                  <Select
                                    onValueChange={(value) => handleServiceSelect(value, index)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Seleccionar servicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {servicios.map((servicio) => (
                                        <SelectItem key={servicio.id} value={servicio.id || 'default'}>
                                          {servicio.nombre} {servicio.exento ? "(Exento de IVA)" : ""}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td><Input className="w-full"  type="number" value={detalle.cantidad || ""} onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)} /></td>
                                <td><Input className="w-full" value={detalle.detalle || ""} onChange={(e) => handleDetalleChange(index, 'detalle', e.target.value)} /></td>
                                <td><Input className="w-full"  type="number" value={detalle.precioUnitario || "0.00"} onChange={(e) => handleDetalleChange(index, 'precioUnitario', e.target.value)} /></td>
                                <td><Input className="w-full"  type="number" value={detalle.valorTotal || "0.00"} readOnly/></td>
                                <td>
                                  <Button 
                                    variant="destructive" 
                                    size="icon"
                                    onClick={() => eliminarFila(index)}
                                    disabled={detallesFactura.length === 1}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button className="mt-2 w-full" onClick={agregarNuevaFila}>Agregar Fila</Button>
                      </div>

                      {/* Contenido Inferior */}
                      <div className="grid grid-cols-2 gap-4">

                        {/* Inferior Izquierda */}
                        <div className="border p-4 rounded-md space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="formaPago">Forma de Pago:</Label>
                            <Input id="formaPago" placeholder="Ingrese la forma de pago" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="otros">Otros:</Label>
                            <Input id="otros" placeholder="Ingrese otros detalles" />
                          </div>
                        </div>

                        {/* Inferior Derecha */}
                        <div className="border p-4 rounded-md space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="SubTotal12IVA">Sub. Total 15% IVA:</Label>
                            <Input
                              id="SubTotal12IVA"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotal12IVA.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="SubTotal0IVA">Sub. Total 0% IVA:</Label>
                            <Input
                              id="SubTotal0IVA"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotal0IVA.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="SubTotalExentoIVA">Sub. Total Exento IVA:</Label>
                            <Input
                              id="SubTotalExentoIVA"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotalExentoIVA.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="SubTotalNoObjetoIVA">Sub. Total No Objeto IVA:</Label>
                            <Input
                              id="SubTotalNoObjetoIVA"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotalNoObjetoIVA.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="Descuento">Descuento:</Label>
                            <Input
                              id="Descuento"
                              type="number"
                              placeholder="0.00"
                              value={totales.Descuento.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="SubTotal">Sub Total:</Label>
                            <Input
                              id="SubTotal"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotal.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ICE">ICE:</Label>
                            <Input
                              id="ICE"
                              type="number"
                              placeholder="0.00"
                              value={totales.ICE.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="IVA12">IVA 15%:</Label>
                            <Input
                              id="IVA12"
                              type="number"
                              placeholder="0.00"
                              value={totales.IVA12.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="Propina">Propina:</Label>
                            <Input
                              id="Propina"
                              type="number"
                              placeholder="0.00"
                              value={totales.Propina.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ValorTotalFinal">Valor Total:</Label>
                            <Input
                              id="ValorTotalFinal"
                              type="number"
                              placeholder="0.00"
                              value={totales.ValorTotalFinal.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Contenido de Botones */}
                  <DialogFooter>
                    <Button onClick={() => handleCancelCreationFacturacion(() => {
                      setNewInvoiceItem({} as InvoiceItem);
                      setIsInvoiceModalOpen(false);
                    })}>Cancelar</Button>
                    <Button onClick={handleCreateInvoice('emitida')}>Crear</Button>
                  </DialogFooter>
                </DialogContent>

              </Dialog>

              {/* Modal para registrar una nueva factura */}
              <Dialog open={isInvoiceReceivedModalOpen} onOpenChange={setIsInvoiceReceivedModalOpen}>
                <DialogContent className="max-w-4xl" aria-describedby={undefined}>

                <DialogHeader>
                  <DialogTitle>
                    {newInvoiceItem.tipoFactura === "emitida" ? "Emitir Factura" : "Registrar Factura Recibida"}
                  </DialogTitle>
                </DialogHeader>

                  <ScrollArea className="max-h-[80vh]">
                    <div className="space-y-4 p-4">

                      <div className="flex items-center space-x-2">
                        <Button onClick={() => setIsProveedorModalOpen(true)}>
                          Agregar Proveedor
                        </Button>
                        <Input
                          placeholder="Buscar proveedor"
                          value={searchTermProveedor}
                          onChange={(e) => {
                            setSearchTermProveedor(e.target.value)
                            filterProveedoresFac(e.target.value)
                          }}
                        />
                        <Select
                          value={selectedProveedor?.id || ""}
                          onValueChange={(value) => {
                            const proveedor = filteredProveedores.find((p) => p.id === value)
                            if (proveedor) setSelectedProveedor(proveedor)
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar proveedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredProveedores.map((proveedor) => (
                              <SelectItem key={proveedor.id} value={proveedor.id}>
                                {proveedor.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                        onClick={() => {
                          if (selectedProveedor) {
                            setProveedorNombre(selectedProveedor.nombre)
                            setProveedorRucCi(selectedProveedor.rucCi)
                            setProveedorDireccionMatriz(selectedProveedor.direccionMatriz)
                            setProveedorDireccionSucursal(selectedProveedor.direccionSucursal)
                          }
                        }}
                      >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Cabecera */}
                      <div className="grid grid-cols-2 gap-4">

                        {/* Superior Izquierda */}
                        <div className="border p-4 rounded-md">
                          <div className="col-span-2">
                            <div className="space-y-2">
                            <Label htmlFor="empresaGuardada">Empresa Emisora:</Label>
                            <Input id="empresaGuardada" placeholder="Ingrese el nombre de la empresa emisora" value={proveedorNombre} onChange={(e) => setProveedorNombre(e.target.value)} />
                            </div>
                          </div>
                          <div className="col-span-2 mt-2">
                            <div className="space-y-2">
                            <Label htmlFor="correoEmisorRecibido">Correo Empresa Emisora:</Label>
                            <Input id="correoEmisorRecibido" placeholder="Ingrese el correo de la empresa emisora" value={proveedorCorreo} onChange={(e) => setProveedorCorreo(e.target.value)} />
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor="direccionMatriz">Dirección Matriz:</Label>
                              <Input id="direccionMatriz" placeholder="Ingrese la dirección matriz" value={proveedorDireccionMatriz} onChange={(e) => setProveedorDireccionMatriz(e.target.value)}/>
                            </div>
                            <div className="space-y-2 mt-2">
                              <Label htmlFor="direccionSucursal">Dirección Sucursal (si es necesario):</Label>
                              <Input id="direccionSucursal" placeholder="Ingrese la dirección de la sucursal" value={proveedorDireccionSucursal} onChange={(e) => setProveedorDireccionSucursal(e.target.value)}/>
                            </div>
                          </div>
                        </div>

                        {/* Superior Derecha */}
                        <div className="border p-4 rounded-md space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="rucEmisor">R.U.C Emisor:</Label>
                            <Input id="rucEmisor" placeholder="Ingrese el R.U.C del emisor" type="number" value={proveedorRucCi} onChange={(e) => setProveedorRucCi(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numeroAutorizacion">Número de Autorización:</Label>
                            <Input id="numeroAutorizacion" placeholder="Ingrese el número de autorización" type="number" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numeroFactura">Número de Factura:</Label>
                            <Input id="numeroFactura" placeholder="Ingrese el número de factura" type="number" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fechaAutorizacion">Fecha Autorización:</Label>
                            <Input id="fechaAutorizacion" type="date" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Inferior de Cabecera */}
                      <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="identificacionAdquiriente">Identificación Adquiriente:</Label>
                            <Input
                              id="identificacionAdquiriente"
                              value={nombreEmisor}
                              onChange={(e) => setIdentificacionAdquiriente(e.target.value)}
                              placeholder="Identificación del adquiriente"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="correoCliente">Correo Adquiriente:</Label>
                            <Input id="correoCliente" placeholder="Correo del adquiriente" value={correoEmisor} onChange={(e) => setIdentificacionAdquiriente(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono Adquiriente:</Label>
                            <Input id="telefono" placeholder="Teléfono del adquiriente" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fechaEmision">Fecha de Emisión:</Label>
                            <Input id="fechaEmision" type="date" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="rucCi">R.U.C/C.I:</Label>
                            <Input 
                              id="rucCi" 
                              value={userData.rucCI || ''}
                              placeholder="Ingrese el R.U.C o C.I" 
                              type="number" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="direccionCliente">Dirección Adquiriente:</Label>
                            <Input id="direccionCliente" placeholder="Dirección del adquiriente" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="guiaRemision">Guía de Remisión:</Label>
                            <Input id="guiaRemision" placeholder="Ingrese la guía de remisión" type="number" />
                          </div>
                        </div>
                      </div>

                      <Button onClick={() => setIsInventoryModalOpen(true)}>
                        Agregar Nuevo Ítem
                      </Button>

                      {/* Contenido */}
                      <div className="border p-4 rounded-md">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="w-1/6">Código</th>
                              <th className="w-1/6">Cantidad</th>
                              <th className="w-2/6">Detalle</th>
                              <th className="w-1/6">P. Unitario</th>
                              <th className="w-1/6">V. Total</th>
                              <th className="w-1/12">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detallesFactura.map((detalle, index) => (
                              <tr key={index}>
                                <td>
                                <Select
                                  value={detalle.idElemento}
                                  onValueChange={(value) => handleInventoryItemSelect(value, index)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar item" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {inventoryItems.map((item) => (
                                      <SelectItem key={item.idElemento} value={item.idElemento}>
                                        {item.idElemento}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                </td>
                                <td><Input className="w-full"  type="number" value={detalle.cantidad || ""} onChange={(e) => handleDetalleChangeIv(index, 'cantidad', e.target.value)} /></td>
                                <td><Input className="w-full" value={detalle.detalle || ""} onChange={(e) => handleDetalleChangeIv(index, 'detalle', e.target.value)} /></td>
                                <td><Input className="w-full"  type="number" value={detalle.precioUnitario || "0.00"} onChange={(e) => handleDetalleChangeIv(index, 'precioUnitario', e.target.value)} /></td>
                                <td><Input className="w-full"  type="number" value={detalle.valorTotal || "0.00"} readOnly/></td>
                                <td>
                                  <Button 
                                    variant="destructive" 
                                    size="icon"
                                    onClick={() => eliminarFila(index)}
                                    disabled={detallesFactura.length === 1}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button className="mt-2 w-full" onClick={agregarNuevaFila}>Agregar Fila</Button>
                      </div>

                      {/* Contenido Inferior */}
                      <div className="grid grid-cols-2 gap-4">

                        {/* Inferior Izquierda */}
                        <div className="border p-4 rounded-md space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="formaPago">Forma de Pago:</Label>
                            <Input id="formaPago" placeholder="Ingrese la forma de pago" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="otros">Otros:</Label>
                            <Input id="otros" placeholder="Ingrese otros detalles" />
                          </div>
                        </div>

                        {/* Inferior Derecha */}
                        <div className="border p-4 rounded-md space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="SubTotal12IVA">Sub. Total 15% IVA:</Label>
                            <Input
                              id="SubTotal12IVA"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotal12IVA.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="SubTotal0IVA">Sub. Total 0% IVA:</Label>
                            <Input
                              id="SubTotal0IVA"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotal0IVA.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="SubTotalExentoIVA">Sub. Total Exento IVA:</Label>
                            <Input
                              id="SubTotalExentoIVA"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotalExentoIVA.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="SubTotalNoObjetoIVA">Sub. Total No Objeto IVA:</Label>
                            <Input
                              id="SubTotalNoObjetoIVA"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotalNoObjetoIVA.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="Descuento">Descuento:</Label>
                            <Input
                              id="Descuento"
                              type="number"
                              placeholder="0.00"
                              value={totales.Descuento.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="SubTotal">Sub Total:</Label>
                            <Input
                              id="SubTotal"
                              type="number"
                              placeholder="0.00"
                              value={totales.SubTotal.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ICE">ICE:</Label>
                            <Input
                              id="ICE"
                              type="number"
                              placeholder="0.00"
                              value={totales.ICE.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="IVA12">IVA 15%:</Label>
                            <Input
                              id="IVA12"
                              type="number"
                              placeholder="0.00"
                              value={totales.IVA12.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="Propina">Propina:</Label>
                            <Input
                              id="Propina"
                              type="number"
                              placeholder="0.00"
                              value={totales.Propina.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ValorTotalFinal">Valor Total:</Label>
                            <Input
                              id="ValorTotalFinal"
                              type="number"
                              placeholder="0.00"
                              value={totales.ValorTotalFinal.toFixed(2) || "0.00"}
                              readOnly
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  </ScrollArea>

                  <DialogFooter>
                    <Button onClick={() => handleCancelCreationFacturacion(() => {
                      setNewInvoiceItem({} as InvoiceItem);
                      setIsInvoiceReceivedModalOpen(false);
                    })}>Cancelar</Button>
                    <Button onClick={handleCreateInvoice('recibida')}>Crear</Button>
                  </DialogFooter>
                </DialogContent>

              </Dialog>

              {/* Modal Inventario */}

              {/* Modal para agregar nuevo ítem al inventario */}
              <Dialog open={isInventoryModalOpen} onOpenChange={setIsInventoryModalOpen}>
                <DialogContent aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Ítem al Inventario</DialogTitle>
                  </DialogHeader>

                  {/* Contenido */}
                  <ScrollArea className="max-h-[70vh]">
                    <div className="space-y-4 p-4">
                      {(Object.entries(appConfig.inventario)).map(([key, field]) => (//Mapeado en base a los campos del usuario
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

              {/* Modal Libro Diario */}

              {/* Modal para crear asiento contable */}
              <Dialog open={isCreatingAccountingEntry} onOpenChange={setIsCreatingAccountingEntry}>
                <DialogContent aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>Crear Asiento Contable</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className={stylesLDiario.scrollArea}>
                    <div className={stylesLDiario.container}>
                      {Object.entries(appConfig.libroDiario).map(([key, field]) => (
                        <div key={key} className={stylesLDiario.fieldContainer}>
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
                    })}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
                      handleAddRow();
                      setIsCreatingAccountingEntry(false);
                    }}>
                      Crear
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Modales Servicios */}

              {/* Modal para crear/editar servicio */}
              <Dialog open={isCreatingService || isEditingService} onOpenChange={() => { setIsCreatingService(false); setIsEditingService(false); resetNewService();}}>
                <DialogContent className={stylesService.dialogServiceContent}>
                  <DialogHeader>
                    <DialogTitle>{isEditingService ? "Editar Servicio" : "Crear Nuevo Servicio"}</DialogTitle>
                    <DialogDescription>
                      {isEditingService ? "Modifica los detalles del servicio." : "Ingresa los detalles del nuevo servicio."}
                    </DialogDescription>
                  </DialogHeader>

                  <div className={stylesService.contenidoservicio}>
                    <div className={stylesService.contenidoIzquierdoServicio}>
                      <div className={stylesService.camposIzq}>
                        <Label htmlFor="nombre">Nombre del Servicio</Label>
                        <Input
                          id="nombre"
                          value={newService.nombre || ""}
                          onChange={(e) => setNewService({ ...newService, nombre: e.target.value })}
                        />
                      </div>
                      <div className={stylesService.camposIzq}>
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input
                          id="descripcion"
                          value={newService.descripcion || ""}
                          onChange={(e) => setNewService({ ...newService, descripcion: e.target.value })}
                        />
                      </div>
                      <div className={stylesService.camposIzq}>
                        <Label htmlFor="tipoIVA">Tipo de IVA</Label>
                        <Select
                          value={newService.tipoIVA || "15"} // Valor por defecto "12"
                          onValueChange={(value) => setNewService({ ...newService, tipoIVA: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de IVA" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">Sub. Total 15% IVA</SelectItem>
                            <SelectItem value="0">Sub. Total 0% IVA</SelectItem>
                            <SelectItem value="exento">Sub. Total Exento IVA</SelectItem>
                            <SelectItem value="noObjeto">Sub. Total No Objeto IVA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={stylesService.camposIzq}>
                        <Label htmlFor="costoDeServicio">Costo de Servicio</Label>
                        <Input
                          id="costoDeServicio"
                          type="number"
                          value={newService.costoDeServicio || ""}
                          onChange={(e) => setNewService({ ...newService, costoDeServicio: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className={stylesService.contenidoDerechoServicio}>
                      <div className={stylesService.contenedorTabla}>
                        <table className={stylesService.tabla}>
                          <thead>
                            <tr>
                              <th className={stylesService.camposDere}>Uso de Item</th>
                              <th className={stylesService.camposDere}>Gastos por Item</th>
                              <th className={stylesService.camposDere}>Cantidad</th>
                              <th className={stylesService.camposDere}>Gastos Servicio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detallesServicio.map((detalle, index) => (
                              <tr key={index}>
                                <td className={stylesService.camposDetalle}>
                                  <Select
                                    value={detalle.usoDeItem || ""}
                                    onValueChange={(value) => handleUsoDeItemSelect(value, index)}
                                  >
                                    <SelectTrigger className={stylesService.SelectTrigger}>
                                      <SelectValue placeholder="Seleccionar item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">Ninguno</SelectItem>
                                      {inventoryItems.map((item) => (
                                        <SelectItem key={item.idElemento} value={item.idElemento}>
                                          {item.idElemento}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className={stylesService.camposDetalle}>
                                  <Input
                                    className={stylesService.inputDetalle}
                                    type="number"
                                    value={detalle.gastosPorItem || ""}
                                    readOnly
                                  />
                                </td>
                                <td className={stylesService.camposDetalle}>
                                  <Input
                                    className={stylesService.inputDetalle}
                                    type="number"
                                    value={detalle.cantidad || 0}
                                    onChange={(e) => handleDetalleChangeService(index, "cantidad", e.target.value)}
                                  />
                                </td>
                                <td className={stylesService.camposDetalle}>
                                  <Input
                                    className={stylesService.inputDetalle}
                                    type="number"
                                    value={detalle.gastosPorServicio || ""}
                                    readOnly
                                  />
                                </td>
                                <td>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => eliminarFilaService(index)}
                                    disabled={detallesServicio.length === 1}
                                  >
                                    <IoTrashBinSharp className={stylesService.icon} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button className={stylesService.botonAdd} onClick={agregarNuevaFilaService}>
                          Agregar Fila
                        </Button>
                        <div>
                          <div className={stylesService.campoVTot}>
                            <Label htmlFor="gastosTotalesPorServicio">Gastos Totales por Servicio</Label>
                            <Input
                              id="gastosTotalesPorServicio"
                              type="number"
                              value={newService.gastosTotalesPorServicio || "0"}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingService(false)
                        setIsEditingService(false)
                        resetNewService()
                      }}
                      className={stylesService.btnFooter}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={isEditingService ? handleSaveService : handleAddService} className={stylesService.btnFooter}>{isEditingService ? "Guardar" : "Crear"}</Button>
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

              {/* Modal para la confirmacion de borrar factura */}
              <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteInvoiceItem}>
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Modal para la confirmacion de borrar servicio */}
              <Dialog open={isServiceDeleteModalOpen} onOpenChange={setIsServiceDeleteModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsServiceDeleteModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteService}>
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Modal Generacion Asiento Contable desde Servicios */}
              <Dialog open={isAccountingEntryModalOpen} onOpenChange={setIsAccountingEntryModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Generación de Asiento Contable</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que deseas generar un asiento contable para este servicio?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAccountingEntryModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={confirmGenerateAccountingEntry}>Generar Asiento Contable</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </div>

          </div>
        
          {/* Tour */}
          <div>
            <JoyrideWrapper
              steps={steps}
              run={runTour}
              continuous={true}
              showSkipButton={true}
              showProgress={true}
              styles={{
                options: {
                  primaryColor: '#4338ca',
                },
              }}
              callback={(data) => {
                const { status } = data;
                if (status === 'finished' || status === 'skipped') {
                  setRunTour(false);
                }
              }}
            />
          </div>

      </div>
    )}

    </>
  )
}