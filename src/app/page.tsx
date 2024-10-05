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
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { FileSpreadsheet, BarChart2, Package, FileText, Bot, X, Plus, Trash2, Save, Calendar, Upload, Mic, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, parse, isValid } from "date-fns"
import { es } from "date-fns/locale"
import OpenAI from "openai"

// Importaciones de Firebase
import firebase from 'firebase/app';
import { initializeApp } from "firebase/app"
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
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
const db = getFirestore(app);

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

//Definicion de Libro Diario
type RowData = {
  id: string
  fecha: string
  cuenta: string
  descripcion: string
  debe: number
  haber: number
}

//Definicion Mensajes Ia
type Message = {
  role: 'user' | 'assistant'
  content: string
}

//Definicion Inventario 
type InventoryItem = {
  id: string
  descripcion: string
  categoria: string
  codigoBarras: string
  cantidadInicial: number
  cantidadDisponible: number
  unidadMedida: string
  stockMinimo: number
  stockMaximo: number
  precioCompra: number
  precioVenta: number
  fechaIngreso: string
  proveedor: string
  ubicacion: string
  fechaVencimiento: string
  estado: string
  valorTotal: number
  responsable: string
  notas: string
}

//Definicion Facturacion
type InvoiceItem = {
  id: string
  fechaEmision: string
  nombreCliente: string
  direccionCliente: string
  rfc: string
  detallesProducto: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  impuestos: number
  total: number
  metodoPago: string
  fechaVencimiento: string
  estado: string
  numeroOrdenCompra: string
  descuentos: number
  notas: string
  detallesEmisor: string
  firma: string
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

//Chatgpt IA
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export default function ContabilidadApp() {
  
  //Configuracion de Cabeceras
  const [activeTab, setActiveTab] = useState("libro-diario")
  const [data, setData] = useState<RowData[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRow, setNewRow] = useState<Omit<RowData, 'id'>>({
    fecha: new Date().toISOString().split('T')[0],
    cuenta: "",
    descripcion: "",
    debe: 0,
    haber: 0
  })
  const [timeFrame, setTimeFrame] = useState("diario")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [isIAOpen, setIsIAOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const chatRef = useRef<HTMLDivElement>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [newInventoryItem, setNewInventoryItem] = useState<InventoryItem>({
    id: '',
    descripcion: '',
    categoria: '',
    cantidadDisponible: 0,
    stockMinimo: 0,
    precioCompra: 0,
    precioVenta: 0,
    fechaIngreso: new Date().toISOString().split('T')[0],
    proveedor: '',
  } as InventoryItem)
  const [selectedInventoryFields, setSelectedInventoryFields] = useState<string[]>([
    'id', 'descripcion', 'categoria', 'cantidadDisponible', 'stockMinimo', 'precioCompra', 'precioVenta', 'fechaIngreso', 'proveedor'
  ])
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [newInvoiceItem, setNewInvoiceItem] = useState<InvoiceItem>({
    id: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    nombreCliente: '',
    detallesProducto: '',
    cantidad: 0,
    precioUnitario: 0,
    subtotal: 0,
    impuestos: 0,
    total: 0,
    metodoPago: '',
  } as InvoiceItem)
  const [selectedInvoiceFields, setSelectedInvoiceFields] = useState<string[]>([
    'id', 'fechaEmision', 'nombreCliente', 'detallesProducto', 'cantidad', 'precioUnitario', 'subtotal', 'impuestos', 'total', 'metodoPago'
  ])
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

  // Estado de autenticación
  const [user] = useAuthState(auth);

  // Estados para el inicio de sesión
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEmailLoginModalOpen, setIsEmailLoginModalOpen] = useState(false);

  // Efecto para cargar datos cuando el usuario inicia sesión
  useEffect(() => {
    loadData();
  }, [user]);

  // Función para cargar datos de Firebase
  const loadData = async () => {
    try {
      const user = auth.currentUser;  // Verificar si el usuario está autenticado
      if (!user) {
        throw new Error("No hay un usuario autenticado.");
      }
  
      const uid = user.uid;  // Obtener el UID del usuario
  
      // Cargar datos del libro diario para el usuario autenticado
      const libroSnapshot = await getDocs(collection(db, `users/${uid}/libroDiario`));
      const libroData = libroSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RowData));
      setData(libroData);
  
      // Cargar datos de inventario para el usuario autenticado
      const inventorySnapshot = await getDocs(collection(db, `users/${uid}/inventario`));
      const inventoryData = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setInventoryItems(inventoryData);
  
      // Cargar datos de facturación para el usuario autenticado
      const invoiceSnapshot = await getDocs(collection(db, `users/${uid}/facturacion`));
      const invoiceData = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceItem));
      setInvoiceItems(invoiceData);
  
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar los datos. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  {/* Items Libro Diario */}

  //Metodo Retorno de listra libro diario
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  //Metodo Configuracion de Errores
  const handleAddRow = async () => {
    if (Object.values(newRow).some(value => value === "")) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos antes de agregar una nueva fila.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const user = auth.currentUser;  // Verificar si el usuario está autenticado
      if (!user) {
        throw new Error("No hay un usuario autenticado.");
      }
  
      const uid = user.uid;  // Obtener el UID del usuario
  
      // Agregar la nueva fila en la colección del usuario autenticado
      const docRef = await addDoc(collection(db, `users/${uid}/libroDiario`), newRow);
      
      // Actualizar el estado con el nuevo dato
      setData([...data, { id: docRef.id, ...newRow }]);
      
      // Resetear el formulario para agregar una nueva fila
      setNewRow({
        fecha: new Date().toISOString().split('T')[0],
        cuenta: "",
        descripcion: "",
        debe: 0,
        haber: 0,
      });
    } catch (error) {
      console.error("Error al agregar fila:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar la fila. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  //Metodo Editor de Items Libro Diario
  const handleEditRow = (id: string) => {
    setEditingId(id)
  }
  
  //Metodo Btn Guardar Cambios Items Libro Diario
  const handleSaveRow = async (id: string) => {
    const editedRow = data.find(row => row.id === id);
    
    // Verificar si hay un usuario autenticado
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }
    
    const uid = user.uid;  // Obtener el UID del usuario
    
    if (editedRow && Object.values(editedRow).some(value => value === "")) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos antes de guardar la fila.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      // Actualizar el documento en la colección del usuario autenticado
      await updateDoc(doc(db, `users/${uid}/libroDiario`, id), editedRow as RowData);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los cambios. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  //Metodo Btn Borrar Item Libro Diario
  const handleDeleteRow = async (id: string) => {
    // Verificar si el usuario está autenticado
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }
  
    const uid = user.uid;  // Obtener el UID del usuario
  
    try {
      // Eliminar el documento en la colección del usuario autenticado
      await deleteDoc(doc(db, `users/${uid}/libroDiario`, id));
      setData(data.filter(row => row.id !== id));
    } catch (error) {
      console.error("Error al eliminar fila:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar la fila. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };
  


  //Metodo Cargar Cambios Items Libro Diario
  const handleInputChange = (id: string, field: keyof RowData, value: string | number) => {
    setData(data.map(row => 
      row.id === id ? { ...row, [field]: field === 'debe' || field === 'haber' ? Number(value) : value } : row
    ))
  }

  //Metodo Crear Items Libro Diario
  const handleNewRowChange = (field: keyof Omit<RowData, 'id'>, value: string | number) => {
    setNewRow({ ...newRow, [field]: field === 'debe' || field === 'haber' ? Number(value) : value })
  }

  //Metodo Filtro por Fecha Items Libro Diario
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

  //Metodo Calculo Libro Diario
  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      acc.debe += row.debe
      acc.haber += row.haber
      return acc
    }, { debe: 0, haber: 0 })
  }, [filteredData])

  //Metodo Resultado Libro Diario
  const chartData = useMemo(() => {
    return [
      { name: 'Totales', Debe: totals.debe, Haber: totals.haber }
    ]
  }, [totals])

  //Metodo Resultado Filtro Libro Diario
  const lineChartData = useMemo(() => {
    return filteredData.map(row => ({
      fecha: row.fecha,
      Debe: row.debe,
      Haber: row.haber
    }))
  }, [filteredData])

  //Metodo Interfaz Libro Diario
  const pieChartData = useMemo(() => {
    return [
      { name: 'Debe', value: totals.debe },
      { name: 'Haber', value: totals.haber }
    ]
  }, [totals])

  {/* Mensajes IA */}

  //Metodo Enter Enviar Openai
  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (inputMessage.trim()) {
            const userMessage = { role: 'user' as const, content: inputMessage };
            setMessages(prev => [...prev, userMessage]);
            setInputMessage("");

            try {
              const completion = await openai.chat.completions.create({
                  model: "gpt-3.5-turbo",
                  messages: [
                      { "role": "system", "content": "Eres un asistente en contabilidad y en manejo de empresas..." },
                      ...messages,
                      userMessage,
                  ],
              });
          
              const assistantMessage = {
                  role: 'assistant' as const,
                  content: completion.choices[0]?.message.content || "Lo siento, no pude generar una respuesta."
              };
              setMessages(prev => [...prev, assistantMessage]);
          
              // Generar audio de la respuesta
              const speech = await openai.audio.speech.create({
                  model: "tts-1",
                  voice: "nova",
                  input: assistantMessage.content,
              });
          
              const audioUrl = URL.createObjectURL(new Blob([await speech.arrayBuffer()], { type: 'audio/mpeg' }));
              const audio = new Audio(audioUrl);
              audio.play();
          
          } catch (error) {
              console.error("Error al comunicarse con la IA:", error);
              console.error("Detalles del error:", error || error || error);
              if (error === 429) {
                setMessages(prev => [...prev, { role: 'assistant', content: "Has alcanzado el límite de uso de la API. Por favor, revisa tu plan y detalles de facturación." }]);
              } else {
                  setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error al procesar tu solicitud." }]);
              }
          }          
        }
    } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        setInputMessage(prev => prev + '\n');
    }
  }

  //Metodo Envio de Archivos IA
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Aquí iría la lógica para manejar la subida de archivos
    console.log("Archivo seleccionado:", event.target.files?.[0])
  }

  //Metodo Envio de Audio IA
  const handleVoiceInput = () => {
    // Aquí iría la lógica para manejar la entrada de voz
    console.log("Iniciando entrada de voz...")
  }

  {/* Registros Firebase */}

  //Metodo Error Registro De Inventario
  const handleAddInventoryItem = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }
  
    const uid = user.uid; // Obtener el UID del usuario
  
    if (selectedInventoryFields.some(field => !newInventoryItem[field as keyof InventoryItem])) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos seleccionados antes de agregar un nuevo ítem.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const docRef = await addDoc(collection(db, `users/${uid}/inventario`), newInventoryItem);
      setInventoryItems([...inventoryItems, { ...newInventoryItem, id: docRef.id }]);
      setNewInventoryItem({
        id: '',
        descripcion: '',
        categoria: '',
        cantidadDisponible: 0,
        stockMinimo: 0,
        precioCompra: 0,
        precioVenta: 0,
        fechaIngreso: new Date().toISOString().split('T')[0],
        proveedor: '',
      } as InventoryItem);
      setIsCreatingInventoryItem(false);
    } catch (error) {
      console.error("Error al agregar ítem al inventario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el ítem al inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  //Metodo Error Registro de Factura
  const handleAddInvoiceItem = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }
  
    const uid = user.uid; // Obtener el UID del usuario
  
    if (selectedInvoiceFields.some(field => !newInvoiceItem[field as keyof InvoiceItem])) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos seleccionados antes de agregar una nueva factura.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const docRef = await addDoc(collection(db, `users/${uid}/facturacion`), newInvoiceItem);
      setInvoiceItems([...invoiceItems, { ...newInvoiceItem, id: docRef.id }]);
      setNewInvoiceItem({
        id: '',
        fechaEmision: new Date().toISOString().split('T')[0],
        nombreCliente: '',
        detallesProducto: '',
        cantidad: 0,
        precioUnitario: 0,
        subtotal: 0,
        impuestos: 0,
        total: 0,
        metodoPago: '',
      } as InvoiceItem);
      setIsCreatingInvoiceItem(false);
    } catch (error) {
      console.error("Error al agregar factura:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  //Metodo Carga de Item en ID
  const handleEditInventoryItem = (id: string) => {
    setEditingInventoryId(id)
    const itemToEdit = inventoryItems.find(item => item.id === id)
    if (itemToEdit) {
      setNewInventoryItem(itemToEdit)
      setSelectedInventoryFields(Object.keys(itemToEdit))
    }
  }

  //Metodo Almacenamiento de Item Firestore
  const handleSaveInventoryItem = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }
  
    const uid = user.uid; // Obtener el UID del usuario
  
    try {
      await updateDoc(doc(db, `users/${uid}/inventario`, editingInventoryId!), newInventoryItem);
      setInventoryItems(inventoryItems.map(item => 
        item.id === editingInventoryId ? { ...newInventoryItem, id: editingInventoryId } : item
      ));
      setEditingInventoryId(null);
      setNewInventoryItem({
        id: '',
        descripcion: '',
        categoria: '',
        cantidadDisponible: 0,
        stockMinimo: 0,
        precioCompra: 0,
        precioVenta: 0,
        fechaIngreso: new Date().toISOString().split('T')[0],
        proveedor: '',
      } as InventoryItem);
    } catch (error) {
      console.error("Error al guardar cambios en el inventario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los cambios en el inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  //Metodo Btn Borrar Item Registro De Inventario Firestore
  const handleDeleteInventoryItem = async (id: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }
  
    const uid = user.uid; // Obtener el UID del usuario
  
    try {
      await deleteDoc(doc(db, `users/${uid}/inventario`, id));
      setInventoryItems(inventoryItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error al eliminar ítem del inventario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el ítem del inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  //Metodo Btn Editar Item Registro De Inventario
  const handleEditInvoiceItem = (id: string) => {
    setEditingInvoiceId(id)
    const itemToEdit = invoiceItems.find(item => item.id === id)
    if (itemToEdit) {
      setNewInvoiceItem(itemToEdit)
      setSelectedInvoiceFields(Object.keys(itemToEdit))
    }
  }

  //MetodoGuardar Cambios Item Registro De Inventario Firestore
  const handleSaveInvoiceItem = async () => {
    // Verificar si el usuario está autenticado
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }
  
    const uid = user.uid; // Obtener el UID del usuario
  
    try {
      // Actualizar el documento en la colección específica del usuario
      await updateDoc(doc(db, `users/${uid}/facturacion`, editingInvoiceId!), newInvoiceItem);
      
      setInvoiceItems(invoiceItems.map(item => 
        item.id === editingInvoiceId ? newInvoiceItem : item
      ));
      
      setEditingInvoiceId(null);
      
      setNewInvoiceItem({
        id: '',
        fechaEmision: new Date().toISOString().split('T')[0],
        nombreCliente: '',
        detallesProducto: '',
        cantidad: 0,
        precioUnitario: 0,
        subtotal: 0,
        impuestos: 0,
        total: 0,
        metodoPago: '',
      } as InvoiceItem);
    } catch (error) {
      console.error("Error al guardar cambios en la factura:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los cambios en la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };
  

  //Metodo Eliminar Item Registro De Inventario Firestore
  const handleDeleteInvoiceItem = async (id: string) => {
    // Verificar si el usuario está autenticado
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }
  
    const uid = user.uid; // Obtener el UID del usuario
  
    try {
      // Eliminar el documento de la colección específica del usuario
      await deleteDoc(doc(db, `users/${uid}/facturacion`, id));
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar la factura. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };
  

  // Método para iniciar sesión con Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión con Google.",
      });
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al iniciar sesión con Google. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Método para iniciar sesión con correo electrónico
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión con tu correo electrónico.",
      });
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Error al iniciar sesión con correo electrónico:", error);
      toast({
        title: "Error",
        description: "Credenciales incorrectas. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Método para registrarse con correo electrónico
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Has iniciado sesión automáticamente.",
      });
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Error al registrarse:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear la cuenta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  //Metodo Cerrar Sesion 
  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  //Metodo Filtro Por Fecha Items Registro De Inventario
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

      {/* Contenido Principal */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === "libro-diario" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Libro Diario</h2>
            <div className="mb-4 flex items-center space-x-4">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-[180px]">
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

                    {/* Btn Seleccion De Fecha */}
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

              {/* Activacion de Filtro Mensual */}
              {timeFrame === "mensual" && (
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-[180px]"
                />
              )}
              {/* Activacion de Filtro Anual */}
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

            {/* Libro Diario Interfaz Estilo */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Debe</TableHead>
                  <TableHead>Haber</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {editingId === row.id ? (
                        <Input
                          type="date"
                          value={row.fecha}
                          onChange={(e) => handleInputChange(row.id, 'fecha', e.target.value)}
                        />
                      ) : (
                        row.fecha
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <Input
                          type="text"
                          value={row.cuenta}
                          onChange={(e) => handleInputChange(row.id, 'cuenta', e.target.value)}
                        />
                      ) : (
                        row.cuenta
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <Input
                          type="text"
                          value={row.descripcion}
                          onChange={(e) => handleInputChange(row.id, 'descripcion', e.target.value)}
                        />
                      ) : (
                        row.descripcion
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <Input
                          type="number"
                          value={row.debe}
                          onChange={(e) => handleInputChange(row.id, 'debe', e.target.value)}
                        />
                      ) : (
                        `$${row.debe.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <Input
                          type="number"
                          value={row.haber}
                          onChange={(e) => handleInputChange(row.id, 'haber', e.target.value)}
                        />
                      ) : (
                        `$${row.haber.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <Button onClick={() => handleSaveRow(row.id)} size="sm">
                          <Save className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button onClick={() => handleEditRow(row.id)} size="sm">
                          Editar
                        </Button>
                      )}
                      <Button onClick={() => handleDeleteRow(row.id)} size="sm" variant="destructive" className="ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Input
                      type="date"
                      value={newRow.fecha}
                      onChange={(e) => handleNewRowChange('fecha', e.target.value)}
                      placeholder="Fecha"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={newRow.cuenta}
                      onChange={(e) => handleNewRowChange('cuenta', e.target.value)}
                      placeholder="Cuenta"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={newRow.descripcion}
                      onChange={(e) => handleNewRowChange('descripcion', e.target.value)}
                      placeholder="Descripción"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newRow.debe}
                      onChange={(e) => handleNewRowChange('debe', e.target.value)}
                      placeholder="Debe"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newRow.haber}
                      onChange={(e) => handleNewRowChange('haber', e.target.value)}
                      placeholder="Haber"
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={handleAddRow} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dashboard Interfaz Estilo */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <div className="mb-4 flex items-center space-x-4">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-[180px]">
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
                      <p>Total de ítems: {inventoryItems.length}</p>
                      <p>Valor total del inventario: ${inventoryItems.reduce((sum, item) => sum + item.precioCompra * item.cantidadDisponible, 0).toFixed(2)}</p>
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

        {activeTab === "inventario" && (
          <div>
            <div className="flex justify-between items-center mb-4 mr-10">
              <h2 className="text-2xl font-bold">Registro de Inventario</h2>
              <div className="flex space-x-2">
                <Button onClick={() => setAdvancedViewInventory(!advancedViewInventory)} className="mr-2">
                  {advancedViewInventory ? "Vista Simple" : "Vista Avanzada"}
                </Button>
                <Button onClick={() => setIsCreatingInventoryItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ítem
                </Button>
              </div>
            </div>
            {isCreatingInventoryItem && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex justify-between">Agregar Nuevo Ítem de Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventoryFields.map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`select-${field.id}`}
                          checked={selectedInventoryFields.includes(field.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedInventoryFields([...selectedInventoryFields, field.id])
                            } else {
                              setSelectedInventoryFields(selectedInventoryFields.filter(id => id !== field.id))
                            }
                          }}
                        />
                        <Label htmlFor={`select-${field.id}`}>{field.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {selectedInventoryFields.map(fieldId => {
                      const field = inventoryFields.find(f => f.id === fieldId)
                      if (!field) return null
                      return (
                        <div key={field.id}>
                          <Label htmlFor={field.id}>{field.label}</Label>
                          {field.type === 'textarea' ? (
                            <textarea
                              id={field.id}
                              value={newInventoryItem[field.id as keyof InventoryItem] as string}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, [field.id]: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type}
                              value={newInventoryItem[field.id as keyof InventoryItem] as string}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, [field.id]: field.type === 'number' ? Number(e.target.value) : e.target.value})}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-start space-x-2 mt-4">
                    <Button onClick={() => setIsCreatingInventoryItem(false)} variant="outline">Cancelar</Button>
                    <Button onClick={handleAddInventoryItem}>Agregar Ítem</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  {advancedViewInventory ? (
                    inventoryFields.map(field => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))
                  ) : (
                    <>
                      <TableHead>ID</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio de Compra</TableHead>
                      <TableHead>Precio de Venta</TableHead>
                      <TableHead>Acciones</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    {advancedViewInventory ? (
                      inventoryFields.map(field => (
                        <TableCell key={field.id}>
                          {editingInventoryId === item.id ? (
                            field.type === 'textarea' ? (
                              <textarea
                                value={newInventoryItem[field.id as keyof InventoryItem] as string}
                                onChange={(e) => setNewInventoryItem({...newInventoryItem, [field.id]: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            ) : (
                              <Input
                                type={field.type}
                                value={newInventoryItem[field.id as keyof InventoryItem] as string}
                                onChange={(e) => setNewInventoryItem({...newInventoryItem, [field.id]: field.type === 'number' ? Number(e.target.value) : e.target.value})}
                              />
                            )
                          ) : (
                            item[field.id as keyof InventoryItem]
                          )}
                        </TableCell>
                      ))
                    ) : (
                      <>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.descripcion}</TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>{item.cantidadDisponible}</TableCell>
                        <TableCell>${item.precioCompra.toFixed(2)}</TableCell>
                        <TableCell>${item.precioVenta.toFixed(2)}</TableCell>
                      </>
                    )}
                    <TableCell>
                      {editingInventoryId === item.id ? (
                        <>
                          <Button onClick={handleSaveInventoryItem} size="sm" className="mr-2">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => setEditingInventoryId(null)} size="sm" variant="outline">
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => handleEditInventoryItem(item.id)} size="sm" className="mr-2">
                            Editar
                          </Button>
                          <Button onClick={() => handleDeleteInventoryItem(item.id)} size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {/*Facturacion*/}
        {activeTab === "facturacion" && (
          <div>
            <div className="flex justify-between items-center mb-4 mr-10">
              <h2 className="text-2xl font-bold">Registro de Facturación</h2>
              <div className="flex space-x-2">
                <Button onClick={() => setAdvancedViewInvoice(!advancedViewInvoice)} className="mr-2">
                  {advancedViewInvoice ? "Vista Simple" : "Vista Avanzada"}
                </Button>
                <Button onClick={() => setIsCreatingInvoiceItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Factura
                </Button>
              </div>
            </div>
            {isCreatingInvoiceItem && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex justify-between">Agregar Nueva Factura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {invoiceFields.map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`select-${field.id}`}
                          checked={selectedInvoiceFields.includes(field.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedInvoiceFields([...selectedInvoiceFields, field.id])
                            } else {
                              setSelectedInvoiceFields(selectedInvoiceFields.filter(id => id !== field.id))
                            }
                          }}
                        />
                        <Label htmlFor={`select-${field.id}`}>{field.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {selectedInvoiceFields.map(fieldId => {
                      const field = invoiceFields.find(f => f.id === fieldId)
                      if (!field) return null
                      return (
                        <div key={field.id}>
                          <Label htmlFor={field.id}>{field.label}</Label>
                          {field.type === 'textarea' ? (
                            <textarea
                              id={field.id}
                              value={newInvoiceItem[field.id as keyof InvoiceItem] as string}
                              onChange={(e) => setNewInvoiceItem({...newInvoiceItem, [field.id]: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type}
                              value={newInvoiceItem[field.id as keyof InvoiceItem] as string}
                              onChange={(e) => setNewInvoiceItem({...newInvoiceItem, [field.id]: field.type === 'number' ? Number(e.target.value) : e.target.value})}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-start space-x-2 mt-4">
                    <Button onClick={() => setIsCreatingInvoiceItem(false)} variant="outline">Cancelar</Button>
                    <Button onClick={handleAddInvoiceItem}>Agregar Factura</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="mb-4 flex items-center space-x-4">
              <Select value={invoiceFilterType} onValueChange={setInvoiceFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las facturas</SelectItem>
                  <SelectItem value="day">Por día</SelectItem>
                  <SelectItem value="month">Por mes</SelectItem>
                  <SelectItem value="year">Por año</SelectItem>
                </SelectContent>
              </Select>
              {invoiceFilterType === "day" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-[280px] justify-start text-left font-normal`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {invoiceFilterDate ? format(new Date(invoiceFilterDate), "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={new Date(invoiceFilterDate)}
                      onSelect={(date) => date && setInvoiceFilterDate(date.toISOString().split('T')[0])}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
              {invoiceFilterType === "month" && (
                <Input
                  type="month"
                  value={invoiceFilterMonth}
                  onChange={(e) => setInvoiceFilterMonth(e.target.value)}
                  className="w-[180px]"
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
                  className="w-[180px]"
                />
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {advancedViewInvoice ? (
                    invoiceFields.map(field => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))
                  ) : (
                    <>
                      <TableHead>Número de Factura</TableHead>
                      <TableHead>Fecha de Emisión</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoiceItems.map((item) => (
                  <TableRow key={item.id}>
                    {advancedViewInvoice ? (
                      invoiceFields.map(field => (
                        <TableCell key={field.id}>
                          {editingInvoiceId === item.id ? (
                            field.type === 'textarea' ? (
                              <textarea
                                value={newInvoiceItem[field.id as keyof InvoiceItem] as string}
                                onChange={(e) => setNewInvoiceItem({...newInvoiceItem, [field.id]: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            ) : (
                              <Input
                                type={field.type}
                                value={newInvoiceItem[field.id as keyof InvoiceItem] as string}
                                onChange={(e) => setNewInvoiceItem({...newInvoiceItem, [field.id]: field.type === 'number' ? Number(e.target.value) : e.target.value})}
                              />
                            )
                          ) : (
                            item[field.id as keyof InvoiceItem]
                          )}
                        </TableCell>
                      ))
                    ) : (
                      <>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.fechaEmision}</TableCell>
                        <TableCell>{item.nombreCliente}</TableCell>
                        <TableCell>${item.total.toFixed(2)}</TableCell>
                        <TableCell>{item.estado}</TableCell>
                      </>
                    )}
                    <TableCell>
                      {editingInvoiceId === item.id ? (
                        <>
                        {/* Btn Guardar Nuevo Item Registro De Factura */}
                          <Button onClick={handleSaveInvoiceItem} size="sm" className="mr-2">
                            <Save className="h-4 w-4" />
                          </Button>

                          {/* Btn Cancelar Nuevo Item Registro De Factura */}
                          <Button onClick={() => setEditingInvoiceId(null)} size="sm" variant="outline">
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Btn Editar Item Registro De Factura */}
                          <Button onClick={() => handleEditInvoiceItem(item.id)} size="sm" className="mr-2">
                            Editar
                          </Button>

                          {/* Btn Borrar Item Registro De Factura */}
                          <Button onClick={() => handleDeleteInvoiceItem(item.id)} size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      {/* Modal de inicio de sesión */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar sesión</DialogTitle>
            <DialogDescription>
              Elige cómo quieres iniciar sesión en tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <Button onClick={handleGoogleLogin}>
              Iniciar sesión con Google
            </Button>
            <Button onClick={() => {
              setIsLoginModalOpen(false);
              setIsEmailLoginModalOpen(true);
            }}>
              Iniciar sesión con correo electrónico
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