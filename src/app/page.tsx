"use client"

{/*
  REQUERIMIENTOS: 
    Node.js Instalado
    Descargar libreria de OpenAI, unicamente si es descargado de GitHub
    Firebase instalado

  Abrir Terminal: Crl+ñ
  Comando ejecutable en Carpeta Main: npm install openai
  Reiniciar "Entorno de desarrollo integrado (IDE)"
*/}

{/* Importacion de Librerias */}
import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { FileSpreadsheet, BarChart2, Package, FileText, Bot, X, Plus, Trash2, Save, Calendar, Upload, Mic, User, Star, Edit } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import OpenAI from "openai"

//Diseño Iconos
import { FcGoogle } from "react-icons/fc";
import { TfiEmail } from "react-icons/tfi";
import { RiEditLine } from "react-icons/ri";
import { IoIosSave } from "react-icons/io";
import { IoTrashBinSharp } from "react-icons/io5";


// Importaciones de Firebase
import { initializeApp } from "firebase/app"
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore"
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

// Nota: Se ha eliminado la inicialización de analytics para evitar el error en entornos sin soporte para cookies

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

// Definición de Tipos
type RowData = {
  id: string
  [key: string]: any
}

//Definicion Inventario
type InventoryItem = {
  id: string
  [key: string]: any
}

//Definicion Factura
type InvoiceItem = {
  id: string
  [key: string]: any
}

//Definicion Mensaje
type Message = {
  role: 'user' | 'assistant'
  content: string
}

type FieldConfig = {
  name: string
  type: string
}

type SectionConfig = {
  [key: string]: FieldConfig
}

type AppConfig = {
  libroDiario: SectionConfig
  inventario: SectionConfig
  facturacion: SectionConfig
}

{/* Configuracion de Items */}

//Items Inventario
const inventoryFields = [
  { id: 'id', label: 'Número de Ítem (ID)', type: 'text' },
  { id: 'descripcion', label: 'Descripción del Producto', type: 'text' },
  { id: 'categoria', label: 'Categoría', type: 'text' },
  { id: 'codigoBarras', label: 'Código de Barras/SKU', type: 'text' },
  { id: 'cantidadInicial', label: 'Cantidad Inicial', type: 'number' },
  { id: 'cantidadDisponible', label: 'Cantidad Disponible', type: 'number' },
  { id: 'unidadMedida', label: 'Unidades de Medida', type: 'text' },
  { id: 'stockMinimo', label: 'Stock Mínimo', type: 'number' },
  { id: 'stockMaximo', label: 'Stock Máximo', type: 'number' },
  { id: 'precioCompra', label: 'Precio de Compra Unitario', type: 'number' },
  { id: 'precioVenta', label: 'Precio de Venta Unitario', type: 'number' },
  { id: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
  { id: 'proveedor', label: 'Proveedor', type: 'text' },
  { id: 'ubicacion', label: 'Ubicación en el Almacén', type: 'text' },
  { id: 'fechaVencimiento', label: 'Fecha de Vencimiento', type: 'date' },
  { id: 'estado', label: 'Estado del Producto', type: 'text' },
  { id: 'valorTotal', label: 'Valor Total', type: 'number' },
  { id: 'responsable', label: 'Responsable del Registro', type: 'text' },
  { id: 'notas', label: 'Notas o Comentarios', type: 'textarea' },
]

//Items Facturacion
const invoiceFields = [
  { id: 'id', label: 'Número de Factura', type: 'text' },
  { id: 'fechaEmision', label: 'Fecha de Emisión', type: 'date' },
  { id: 'nombreCliente', label: 'Nombre del Cliente', type: 'text' },
  { id: 'direccionCliente', label: 'Dirección del Cliente', type: 'text' },
  { id: 'rfc', label: 'RFC/NIF', type: 'text' },
  { id: 'detallesProducto', label: 'Detalles del Producto/Servicio', type: 'text' },
  { id: 'cantidad', label: 'Cantidad de Productos/Servicios', type: 'number' },
  { id: 'precioUnitario', label: 'Precio Unitario', type: 'number' },
  { id: 'subtotal', label: 'Subtotal', type: 'number' },
  { id: 'impuestos', label: 'Impuestos Aplicables', type: 'number' },
  { id: 'total', label: 'Total a Pagar', type: 'number' },
  { id: 'metodoPago', label: 'Método de Pago', type: 'text' },
  { id: 'fechaVencimiento', label: 'Fecha de Vencimiento del Pago', type: 'date' },
  { id: 'estado', label: 'Estado de la Factura', type: 'text' },
  { id: 'numeroOrdenCompra', label: 'Número de Orden de Compra', type: 'text' },
  { id: 'descuentos', label: 'Descuentos Aplicados', type: 'number' },
  { id: 'notas', label: 'Observaciones o Notas', type: 'textarea' },
  { id: 'detallesEmisor', label: 'Datos del Emisor', type: 'text' },
  { id: 'firma', label: 'Firma', type: 'text' },
]

//Chatgpt IA Key
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export default function ContabilidadApp() {
  
  //Configuracion de Cabeceras
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
  const [isCreatingInventoryItem, setIsCreatingInventoryItem] = useState(false)
  const [isCreatingInvoiceItem, setIsCreatingInvoiceItem] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [advancedViewInventory, setAdvancedViewInventory] = useState(false)
  const [advancedViewInvoice, setAdvancedViewInvoice] = useState(false)
  const [invoiceFilterDate, setInvoiceFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [invoiceFilterMonth, setInvoiceFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [invoiceFilterYear, setInvoiceFilterYear] = useState(new Date().getFullYear().toString())
  const [invoiceFilterType, setInvoiceFilterType] = useState("all")

  // Nuevos estados para la edición de campos
  const [isEditingFields, setIsEditingFields] = useState(false)
  const [editingSection, setEditingSection] = useState<keyof AppConfig | ''>('')
  const [appConfig, setAppConfig] = useState<AppConfig>({
    libroDiario: {},
    inventario: {},
    facturacion: {}
  })

  // Estado de autenticación
  const [user] = useAuthState(auth);

  // Estados para el inicio de sesión
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEmailLoginModalOpen, setIsEmailLoginModalOpen] = useState(false);
  const db = getFirestore()

  // Efecto para cargar datos cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      loadUserConfig()
      loadData()
      setIsLoginModalOpen(false)
    }else{
      checkUserAuthentication();
    }
  }, [user])

  // Función para cargar la configuración del usuario desde Firestore
  const loadUserConfig = async () => {
    if (!user) return

    const configDoc = await getDoc(doc(db, `users/${user.uid}/config`, 'fields'))
    if (configDoc.exists()) {
      setAppConfig(configDoc.data() as AppConfig)
    } else {
      // Funcion Datos Por Defecto
      const defaultConfig: AppConfig = {
        libroDiario: {
          fecha: { name: 'Fecha' , type: 'date'},
          nombreCuenta: { name: 'Nombre de Cuenta', type: 'text' },
          descripcion: { name: 'Descripción', type: 'text' },
          debe: { name: 'Debe', type: 'number' },
          haber: { name: 'Haber', type: 'number' }
        },
        inventario: {
          id: { name: 'Número de Ítem (ID)', type: 'text' },
          descripcion: { name: 'Descripción del Producto', type: 'text' },
          cantidadDisponible: { name: 'Cantidad Disponible', type: 'number' },
          stockMinimo: { name: 'Stock Mínimo', type: 'number' },
          precioCompra: { name: 'Precio de Compra Unitario', type: 'number' },
          precioVenta: { name: 'Precio de Venta Unitario', type: 'number' },
          fechaIngreso: { name: 'Fecha de Ingreso', type: 'date' },
          proveedor: { name: 'Proveedor', type: 'text' }
        },
        facturacion: {
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

  // Funcion Requerimiento Inicio de Sesion
  const checkUserAuthentication = (): void => {
    setIsLoginModalOpen(true);
  };

  // Función para cargar datos
  const loadData = async () => {
    if (!user) return

    try {
      // Cargar datos del libro diario
      const libroDiarioSnapshot = await getDocs(collection(db, `users/${user.uid}/libroDiario`))
      const libroDiarioData = libroDiarioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setData(libroDiarioData)

      // Cargar datos de inventario
      const inventarioSnapshot = await getDocs(collection(db, `users/${user.uid}/inventario`))
      const inventarioData = inventarioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setInventoryItems(inventarioData)

      // Cargar datos de facturación
      const facturacionSnapshot = await getDocs(collection(db, `users/${user.uid}/facturacion`))
      const facturacionData = facturacionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setInvoiceItems(facturacionData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al cargar los datos. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para abrir el modal de edición de campos
  const openFieldEditor = (section: keyof AppConfig) => {
    setEditingSection(section)
    setIsEditingFields(true)
  }

  // Función para guardar los cambios en la configuración de campos
  const saveFieldChanges = async () => {
    if (!user) return

    try {
      await setDoc(doc(db, `users/${user.uid}/config`, 'fields'), appConfig)
      setIsEditingFields(false)
      loadData() // Recargar los datos con la nueva configuración
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

  // Función para agregar una nueva fila al libro diario
  const handleAddRow = async () => {
    if (!user) return

    try {
      const docRef = await addDoc(collection(db, `users/${user.uid}/libroDiario`), newRow)
      setData([...data, { id: docRef.id, ...newRow }])
      setNewRow({})
    } catch (error) {
      console.error("Error al agregar fila:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al agregar la fila. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

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
      const rowDate = new Date(row.fecha)
      switch (timeFrame) {
        case "diario":
          return row.fecha === selectedDate
        case "mensual":
          return row.fecha.startsWith(selectedMonth)
        case "anual":
          return row.fecha.startsWith(selectedYear)
        default:
          return true
      }
    })
  }, [data, timeFrame, selectedDate, selectedMonth, selectedYear])

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

  // Función para agregar un nuevo ítem al inventario
  const handleAddInventoryItem = async () => {
    if (!user) return

    try {
      const docRef = await addDoc(collection(db, `users/${user.uid}/inventario`), newInventoryItem)
      setInventoryItems([...inventoryItems, { ...newInventoryItem, id: docRef.id }])
      setNewInventoryItem({} as InventoryItem)
      setIsCreatingInventoryItem(false)
    } catch (error) {
      console.error("Error al agregar ítem al inventario:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el ítem al inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para agregar una nueva factura
  const handleAddInvoiceItem = async () => {
    if (!user) return

    try {
      const docRef = await addDoc(collection(db, `users/${user.uid}/facturacion`), newInvoiceItem)
      setInvoiceItems([...invoiceItems, { ...newInvoiceItem, id: docRef.id }])
      setNewInvoiceItem({} as InvoiceItem)
      setIsCreatingInvoiceItem(false)
    } catch (error) {
      console.error("Error al agregar factura:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al agregar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para editar un ítem del inventario
  const handleEditInventoryItem = (id: string) => {
    setEditingInventoryId(id)
    const itemToEdit = inventoryItems.find(item => item.id === id)
    if (itemToEdit) {
      setNewInventoryItem(itemToEdit)
    }
  }

  // Función para guardar los cambios de un ítem del inventario
  const handleSaveInventoryItem = async () => {
    if (!user || !editingInventoryId) return

    try {
      await updateDoc(doc(db, `users/${user.uid}/inventario`, editingInventoryId), newInventoryItem)
      setInventoryItems(inventoryItems.map(item => 
        item.id === editingInventoryId ? { ...newInventoryItem, id: editingInventoryId } : item
      ))
      setEditingInventoryId(null)
      setNewInventoryItem({} as InventoryItem)
    } catch (error) {
      console.error("Error al guardar cambios en el inventario:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los cambios en el inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un ítem del inventario
  const handleDeleteInventoryItem = async (id: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, `users/${user.uid}/inventario`, id))
      setInventoryItems(inventoryItems.filter(item => item.id !== id))
    } catch (error) {
      console.error("Error al eliminar ítem del inventario:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el ítem del inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para editar una factura
  const handleEditInvoiceItem = (id: string) => {
    setEditingInvoiceId(id)
    const itemToEdit = invoiceItems.find(item => item.id === id)
    if (itemToEdit) {
      setNewInvoiceItem(itemToEdit)
    }
  }

  // Función para guardar los cambios de una factura
  const handleSaveInvoiceItem = async () => {
    if (!user || !editingInvoiceId) return

    try {
      await updateDoc(doc(db, `users/${user.uid}/facturacion`, editingInvoiceId), newInvoiceItem)
      setInvoiceItems(invoiceItems.map(item => 
        item.id === editingInvoiceId ? { ...newInvoiceItem, id: editingInvoiceId } : item
      ))
      setEditingInvoiceId(null)
      setNewInvoiceItem({} as InvoiceItem)
    } catch (error) {
      console.error("Error al guardar cambios en la factura:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los cambios en la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar una factura
  const handleDeleteInvoiceItem = async (id: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, `users/${user.uid}/facturacion`, id))
      setInvoiceItems(invoiceItems.filter(item => item.id !== id))
    } catch (error) {
      console.error("Error al eliminar factura:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

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

  // Función para obtener categorías únicas
  const getUniqueCategories = () => {
    const categories = new Set(inventoryItems.map(item => item.categoria))
    return Array.from(categories).filter(Boolean) // Filtra valores nulos o undefined
  }

  // Filtrado de facturas
  const filteredInvoiceItems = useMemo(() => {
    return invoiceItems.filter(item => {
      const itemDate = new Date(item.fechaEmision)
      switch (invoiceFilterType) {
        case "day":
          return item.fechaEmision === invoiceFilterDate
        case "month":
          return item.fechaEmision.startsWith(invoiceFilterMonth)
        case "year":
          return item.fechaEmision.startsWith(invoiceFilterYear)
        default:
          return true
      }
    })
  }, [invoiceItems, invoiceFilterType, invoiceFilterDate, invoiceFilterMonth, invoiceFilterYear])

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Menu Izquierda*/}

      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Alice</h1>
          {user ? (
            <div className="mb-4 flex items-center">
              <Avatar className="h-10 w-10 mr-2">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                <AvatarFallback>{user.displayName ? user.displayName[0] : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.displayName || user.email}</p>

                {/* Btn Cerrar Sesion */}
                <Button variant="ghost" size="sm" onClick={handleLogout}>Cerrar sesión</Button>
              </div>
            </div>
          ) : (
            <>
              <Button className="w-full mb-4" onClick={() => setIsLoginModalOpen(true)}>
                Iniciar sesión
              </Button>
            </>
          )}
          <nav>

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
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-8 overflow-auto mr-12">

          {/* Libro Diario Interfaz Estilo */}
        {activeTab === "libro-diario" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Libro Diario</h2>
            </div>
            <div className="mb-4 flex items-center space-x-4">
              <Button onClick={() => openFieldEditor('libroDiario')}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Campos
              </Button>
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-[180px] ml-4">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>

                {/* Seleccion De Fecha */}
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
                  className="w-[180px]"
                />
              )}
              {timeFrame === "anual" && (
                <Input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  min="1900"
                  max="2099"
                  step="1"
                  className="w-[180px]"
                />
              )}
            </div>
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
                            onChange={(e) => handleInputChange(row.id, key, e.target.value)}
                          />
                        ) : (
                          row[key]
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {editingId === row.id ? (
                        <Button onClick={() => handleSaveRow(row.id)} className="mr-4">
                          <IoIosSave size={20}/>
                        </Button>
                      ) : (
                        <Button onClick={() => handleEditRow(row.id)} className="mr-4">
                          <RiEditLine size={20}/>
                        </Button>
                      )}
                      <Button variant="destructive" onClick={() => handleDeleteRow(row.id)}>
                        <IoTrashBinSharp size={20}/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Agregar nueva fila</h3>
              <div className="flex space-x-2">
                {Object.entries(appConfig.libroDiario).map(([key, field]) => (
                  <Input
                    key={key}
                    type={field.type}
                    placeholder={field.name}
                    value={newRow[key] || ''}
                    onChange={(e) => handleNewRowChange(key, e.target.value)}
                  />
                ))}
                <Button onClick={handleAddRow}>Agregar</Button>
              </div>
            </div>
            
            <div className="mt-4">
            <Card className="col-span-2">
            {/*Libro Diario Resumen Financiaero*/}
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
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
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
                  className="w-[180px]"
                />
              )}
              {timeFrame === "anual" && (
                <Input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  min="1900"
                  max="2099"
                  step="1"
                  className="w-[180px]"
                />
              )}
            </div>
            <Tabs defaultValue="financial" className="w-full">
              <TabsList>
                <TabsTrigger value="financial" onClick={() => setDashboardType("financial")}>Financiero</TabsTrigger>
                <TabsTrigger value="inventory" onClick={() => setDashboardType("inventory")}>Inventario</TabsTrigger>
              </TabsList>
              <TabsContent value="financial">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="col-span-2">

                  {/*Dashboard Resumen Financiaero*/}
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
                              acc[item.categoria] = (acc[item.categoria] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
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
                          {Array.from(new Set(inventoryItems.map(item => item.categoria))).map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Table>
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
                        .filter(item => selectedCategory === "all" || item.categoria === selectedCategory)
                        .map(item => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell>{item.descripcion}</TableCell>
                              <TableCell>{item.categoria}</TableCell>
                              <TableCell>{item.cantidadDisponible}</TableCell>
                              <TableCell>${item.precioCompra.toFixed(2)}</TableCell>
                              <TableCell>${item.precioVenta.toFixed(2)}</TableCell>
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
              <h2 className="text-2xl font-bold">Registro de Inventario</h2>
            </div>

            <div className="flex space-x-2">
                <Button onClick={() => openFieldEditor('inventario')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Campos
                </Button>
                <Button onClick={() => setIsCreatingInventoryItem(true)}>Agregar Ítem</Button>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] ml-4">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {getUniqueCategories().map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
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
                  .filter(item => selectedCategory === "all" || item.categoria === selectedCategory)
                  .map((item) => (
                    <TableRow key={item.id}>
                      {Object.entries(appConfig.inventario).map(([key, field]) => (
                        <TableCell key={key}>
                          {editingInventoryId === item.id ? (
                            <Input
                              type={field.type}
                              value={newInventoryItem[key] || ''}
                              onChange={(e) => setNewInventoryItem({ ...newInventoryItem, [key]: e.target.value })}
                            />
                          ) : (
                            advancedViewInventory ? item[key] : (key === 'descripcion' ? item[key] : '•••')
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        {editingInventoryId === item.id ? (
                          <Button onClick={handleSaveInventoryItem}>Guardar</Button>
                        ) : (
                          <Button onClick={() => handleEditInventoryItem(item.id)}>Editar</Button>
                        )}
                        <Button variant="destructive" onClick={() => handleDeleteInventoryItem(item.id)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {isCreatingInventoryItem && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Agregar nuevo ítem</h3>
                <div className="flex space-x-2">
                  {Object.entries(appConfig.inventario).map(([key, field]) => (
                    <Input
                      key={key}
                      type={field.type}
                      placeholder={field.name}
                      value={newInventoryItem[key] || ''}
                      onChange={(e) => setNewInventoryItem({ ...newInventoryItem, [key]: e.target.value })}
                    />
                  ))}
                  <Button onClick={handleAddInventoryItem}>Agregar</Button>
                  <Button variant="secondary" onClick={() => setIsCreatingInventoryItem(false)}>Cancelar</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Facturacion Interfaz Estilo */}
        {activeTab === "facturacion" && (
          <div>
            <div className="flex justify-between items-center mb-4 mr-10">
              <h2 className="text-2xl font-bold">Registro de Facturación</h2>
            </div>

            <div className="flex justify-between items-center mb-4 mr-10">
            <div className="flex space-x-2">
                  {/* Btn Editar Campos */}
                  <Button onClick={() => openFieldEditor('facturacion')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Campos
                  </Button>
                  {/* Crear Factura */}
                  <Button onClick={() => setIsCreatingInvoiceItem(true)}>Crear Factura</Button>

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
                  {invoiceFilterType === "day" && (
                    <Input
                      type="date"
                      value={invoiceFilterDate}
                      onChange={(e) => setInvoiceFilterDate(e.target.value)}
                      className="ml-4"
                    />
                  )}
                  {invoiceFilterType === "month" && (
                    <Input
                      type="month"
                      value={invoiceFilterMonth}
                      onChange={(e) => setInvoiceFilterMonth(e.target.value)}
                      className="ml-4"
                    />
                  )}
                  {invoiceFilterType === "year" && (
                    <Input
                      type="number"
                      value={invoiceFilterYear}
                      onChange={(e) => setInvoiceFilterYear(e.target.value)}
                      min="1900"
                      max="2099"
                      step="1"
                      className="ml-4"
                    />
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
                            onChange={(e) => setNewInvoiceItem({ ...newInvoiceItem, [key]: e.target.value })}
                          />
                        ) : (
                          advancedViewInvoice ? item[key] : (key === 'numeroFactura' || key === 'cliente' ? item[key] : '•••')
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {editingInvoiceId === item.id ? (
                        <Button onClick={handleSaveInvoiceItem}>Guardar</Button>
                      ) : (
                        <Button onClick={() => handleEditInvoiceItem(item.id)}>Editar</Button>
                      )}
                      <Button variant="destructive" onClick={() => handleDeleteInvoiceItem(item.id)}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isCreatingInvoiceItem && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Crear nueva factura</h3>
                <div className="flex space-x-2">
                  {Object.entries(appConfig.facturacion).map(([key, field]) => (
                    <Input
                      key={key}
                      type={field.type}
                      placeholder={field.name}
                      value={newInvoiceItem[key] || ''}
                      onChange={(e) => setNewInvoiceItem({ ...newInvoiceItem, [key]: e.target.value })}
                    />
                  ))}
                  <Button onClick={handleAddInvoiceItem}>Crear</Button>
                  <Button variant="secondary" onClick={() => setIsCreatingInvoiceItem(false)}>Cancelar</Button>
                </div>
              </div>
            )}
          </div>
        )}
        
      </div>

      {/* Panel de IA desplegable */}
      <div className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out ${isIAOpen ? 'w-96' : 'w-16'} flex flex-col`}>
        
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
                  className="flex-grow mr-2"
                />
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
                  onChange={handleFileUpload}
                />

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

      {/* Modal para editar campos */}
      <Dialog open={isEditingFields} onOpenChange={setIsEditingFields}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Campos de {editingSection}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingSection && Object.entries(appConfig[editingSection]).map(([key, field]) => (
              <div key={key} className="flex items-center space-x-2">
                <Input
                  value={field.name}
                  onChange={(e) => updateField(editingSection, key, { name: e.target.value })}
                />
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
        <DialogContent>
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
              setIsEmailLoginModalOpen(true);}}
            className="flex items-center justify-center space-x-3 w-full">
              <TfiEmail size={25}/>
              <span>Iniciar sesión con correo electrónico</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de inicio de sesión con correo electrónico */}
      <Dialog open={isEmailLoginModalOpen} onOpenChange={setIsEmailLoginModalOpen}>
        <DialogContent>
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
    </div>
  )
}

function loadUserConfig() {
  throw new Error("Function not implemented.")
}
