"use client"

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


type RowData = {
  id: number
  fecha: string
  cuenta: string
  descripcion: string
  debe: number
  haber: number
}

const INITIAL_DATA: RowData[] = [
  { id: 1, fecha: "2023-01-01", cuenta: "1000", descripcion: "Ventas", debe: 1000, haber: 0 },
  { id: 2, fecha: "2023-01-02", cuenta: "2000", descripcion: "Compras", debe: 0, haber: 500 },
  { id: 3, fecha: "2023-01-03", cuenta: "3000", descripcion: "Servicios", debe: 0, haber: 200 },
  { id: 4, fecha: "2023-01-04", cuenta: "1000", descripcion: "Ventas", debe: 1500, haber: 0 },
]

type Message = {
  role: 'user' | 'assistant'
  content: string
}

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

const openai = new OpenAI({
  apiKey: "",
  dangerouslyAllowBrowser: true
});

export default function ContabilidadApp() {
  const [activeTab, setActiveTab] = useState("libro-diario")
  const [data, setData] = useState<RowData[]>(INITIAL_DATA)
  const [editingId, setEditingId] = useState<number | null>(null)
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
    cantidadDisponible: 0,
    stockMinimo: 0,
    precioCompra: 0,
    precioVenta: 0,
    fechaIngreso: new Date().toISOString().split('T')[0],
    proveedor: '',
  } as InventoryItem)
  const [selectedInventoryFields, setSelectedInventoryFields] = useState<string[]>([
    'id', 'descripcion', 'cantidadDisponible', 'stockMinimo', 'precioCompra', 'precioVenta', 'fechaIngreso', 'proveedor'
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState({ name: "", email: "", photo: "" })
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [advancedViewInventory, setAdvancedViewInventory] = useState(false)
  const [advancedViewInvoice, setAdvancedViewInvoice] = useState(false)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const handleAddRow = () => {
    if (Object.values(newRow).some(value => value === "" || value === 0)) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos antes de agregar una nueva fila.",
        variant: "destructive",
      })
      return
    }
    const id = Math.max(...data.map(row => row.id), 0) + 1
    setData([...data, { id, ...newRow }])
    setNewRow({ fecha: new Date().toISOString().split('T')[0], cuenta: "", descripcion: "", debe: 0, haber: 0 })
  }

  const handleEditRow = (id: number) => {
    setEditingId(id)
  }

  const handleSaveRow = (id: number) => {
    const editedRow = data.find(row => row.id === id)
    if (editedRow && Object.values(editedRow).some(value => value === "" || value === 0)) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos antes de guardar la fila.",
        variant: "destructive",
      })
      return
    }
    setEditingId(null)
  }

  const handleDeleteRow = (id: number) => {
    setData(data.filter(row => row.id !== id))
  }

  const handleInputChange = (id: number, field: keyof RowData, value: string | number) => {
    setData(data.map(row => 
      row.id === id ? { ...row, [field]: field === 'debe' || field === 'haber' ? Number(value) : value } : row
    ))
  }

  const handleNewRowChange = (field: keyof Omit<RowData, 'id'>, value: string | number) => {
    setNewRow({ ...newRow, [field]: field === 'debe' || field === 'haber' ? Number(value) : value })
  }

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

  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      acc.debe += row.debe
      acc.haber += row.haber
      return acc
    }, { debe: 0, haber: 0 })
  }, [filteredData])

  const chartData = useMemo(() => {
    return [
      { name: 'Totales', Debe: totals.debe, Haber: totals.haber }
    ]
  }, [totals])

  const lineChartData = useMemo(() => {
    return filteredData.map(row => ({
      fecha: row.fecha,
      Debe: row.debe,
      Haber: row.haber
    }))
  }, [filteredData])

  const pieChartData = useMemo(() => {
    return [
      { name: 'Debe', value: totals.debe },
      { name: 'Haber', value: totals.haber }
    ]
  }, [totals])

  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim()) {
        const userMessage = { role: 'user' as const, content: inputMessage }
        setMessages(prev => [...prev, userMessage])
        setInputMessage("")

        try {
          const completion = await openai.chat.completions.create({
            messages: [
              {"role": "system", "content": "Eres un asistente en contabilidad y en manejo de empresas. Vas a utilizar términos simples y entendibles. Principalmente vas a funcionar para una aplicación de contabilidad la cual tiene los siguientes aspectos: 1. Libro Diario 2. Dashboards 3. Registro de Inventario 4. Registro de Facturación."},
              ...messages,
              userMessage
            ],
            model: "gpt-3.5-turbo",
          });

          const assistantMessage = { role: 'assistant' as const, content: completion.choices[0].message.content || "Lo siento, no pude generar una respuesta." }
          setMessages(prev => [...prev, assistantMessage])

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
          console.error("Error al comunicarse con la IA:", error)
          setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error al procesar tu solicitud." }])
        }
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setInputMessage(prev => prev + '\n');
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Aquí iría la lógica para manejar la subida de archivos
    console.log("Archivo seleccionado:", event.target.files?.[0])
  }

  const handleVoiceInput = () => {
    // Aquí iría la lógica para manejar la entrada de voz
    console.log("Iniciando entrada de voz...")
  }

  const handleAddInventoryItem = () => {
    if (selectedInventoryFields.some(field => !newInventoryItem[field as keyof InventoryItem])) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos seleccionados antes de agregar un nuevo ítem.",
        variant: "destructive",
      })
      return
    }
    setInventoryItems([...inventoryItems, newInventoryItem])
    setNewInventoryItem({
      id: '',
      descripcion: '',
      cantidadDisponible: 0,
      stockMinimo: 0,
      precioCompra: 0,
      precioVenta: 0,
      fechaIngreso: new Date().toISOString().split('T')[0],
      proveedor: '',
    } as InventoryItem)
    setIsCreatingInventoryItem(false)
  }

  const handleAddInvoiceItem = () => {
    if (selectedInvoiceFields.some(field => !newInvoiceItem[field as keyof InvoiceItem])) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos seleccionados antes de agregar una nueva factura.",
        variant: "destructive",
      })
      return
    }
    setInvoiceItems([...invoiceItems, newInvoiceItem])
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
    } as InvoiceItem)
    setIsCreatingInvoiceItem(false)
  }

  const handleEditInventoryItem = (id: string) => {
    setEditingInventoryId(id)
    const itemToEdit = inventoryItems.find(item => item.id === id)
    if (itemToEdit) {
      setNewInventoryItem(itemToEdit)
      setSelectedInventoryFields(Object.keys(itemToEdit))
    }
  }

  const handleSaveInventoryItem = () => {
    setInventoryItems(inventoryItems.map(item => 
      item.id === editingInventoryId ? newInventoryItem : item
    ))
    setEditingInventoryId(null)
    setNewInventoryItem({
      id: '',
      descripcion: '',
      cantidadDisponible: 0,
      stockMinimo: 0,
      precioCompra: 0,
      precioVenta: 0,
      fechaIngreso: new Date().toISOString().split('T')[0],
      proveedor: '',
    } as InventoryItem)
  }

  const handleDeleteInventoryItem = (id: string) => {
    setInventoryItems(inventoryItems.filter(item => item.id !== id))
  }

  const handleEditInvoiceItem = (id: string) => {
    setEditingInvoiceId(id)
    const itemToEdit = invoiceItems.find(item => item.id === id)
    if (itemToEdit) {
      setNewInvoiceItem(itemToEdit)
      setSelectedInvoiceFields(Object.keys(itemToEdit))
    }
  }

  const handleSaveInvoiceItem = () => {
    setInvoiceItems(invoiceItems.map(item => 
      item.id === editingInvoiceId ? newInvoiceItem : item
    ))
    setEditingInvoiceId(null)
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
    } as InvoiceItem)
  }

  const handleDeleteInvoiceItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id))
  }

  const handleLogin = (name: string, email: string, photo: string) => {
    setUser({ name, email, photo })
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser({ name: "", email: "", photo: "" })
    setIsLoggedIn(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menú lateral */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Alice</h1>
          {isLoggedIn ? (
            <div className="mb-4 flex items-center">
              <Avatar className="h-10 w-10 mr-2">
                <AvatarImage src={user.photo} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.name}</p>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Cerrar sesión</Button>
              </div>
            </div>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full mb-4">
                  <User className="mr-2 h-4 w-4" />
                  Iniciar sesión
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Iniciar sesión o registrarse</DialogTitle>
                  <DialogDescription>
                    Inicia sesión con Google o crea una cuenta con tu correo electrónico.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button onClick={() => handleLogin("Usuario de Google", "usuario@gmail.com", "/placeholder-user.jpg")}>
                    Iniciar sesión con Google
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        O
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" placeholder="nombre@ejemplo.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => handleLogin("Nuevo Usuario", "nuevo@ejemplo.com", "/placeholder-user.jpg")}>Registrarse</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <nav>
            <Button
              variant={activeTab === "libro-diario" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setActiveTab("libro-diario")}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Libro Diario
            </Button>
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "inventario" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setActiveTab("inventario")}
            >
              <Package className="mr-2 h-4 w-4" />
              Registro de Inventario
            </Button>
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
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === "libro-diario" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Libro Diario</h2>
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={`w-[180px] justify-start text-left font-normal`}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {row.fecha ? format(new Date(row.fecha), "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={new Date(row.fecha)}
                              onSelect={(date) => date && handleInputChange(row.id, 'fecha', date.toISOString().split('T')[0])}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        format(new Date(row.fecha), "PPP", { locale: es })
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
                    <TableCell className="text-green-600 font-bold">
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
                    <TableCell className="text-red-600 font-bold">
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-[180px] justify-start text-left font-normal`}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {newRow.fecha ? format(new Date(newRow.fecha), "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={new Date(newRow.fecha)}
                          onSelect={(date) => date && handleNewRowChange('fecha', date.toISOString().split('T')[0])}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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

        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <div className="mb-4 flex items-center space-x-4">
              <Select value={dashboardType} onValueChange={setDashboardType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar tipo de dashboard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financiero</SelectItem>
                  <SelectItem value="inventory">Inventario</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardType === "financial" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen Financiero</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-600 font-bold">Total Debe: ${totals.debe.toFixed(2)}</p>
                      <p className="text-red-600 font-bold">Total Haber: ${totals.haber.toFixed(2)}</p>
                      <p className="font-bold">Balance: ${(totals.debe - totals.haber).toFixed(2)}</p>
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
                </>
              )}
              {dashboardType === "inventory" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen de Inventario</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold">Total de Productos: {inventoryItems.length}</p>
                      <p className="font-bold">Valor Total del Inventario: ${inventoryItems.reduce((total, item) => total + item.cantidadDisponible * item.precioCompra, 0).toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Productos con Bajo Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul>
                        {inventoryItems.filter(item => item.cantidadDisponible < item.stockMinimo).map(item => (
                          <li key={item.id}>{item.descripcion} - Disponible: {item.cantidadDisponible}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
              {dashboardType === "sales" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen de Ventas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold">Total de Facturas: {invoiceItems.length}</p>
                      <p className="font-bold">Ventas Totales: ${invoiceItems.reduce((total, item) => total + item.total, 0).toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Productos Más Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Aquí podrías agregar un gráfico o una lista de los productos más vendidos */}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "inventario" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Registro de Inventario</h2>
            <div className="mb-4 flex justify-between items-center">
              <Button onClick={() => setIsCreatingInventoryItem(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Ítem
              </Button>
              <div className="flex items-center space-x-2">
                <Label htmlFor="advanced-view-inventory">Vista avanzada</Label>
                <Checkbox
                  id="advanced-view-inventory"
                  checked={advancedViewInventory}
                  onCheckedChange={(checked) => setAdvancedViewInventory(checked as boolean)}
                />
              </div>
            </div>
            {isCreatingInventoryItem && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Nuevo Ítem de Inventario</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCreatingInventoryItem(false)}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
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
                          defaultChecked={['id', 'descripcion', 'cantidadDisponible', 'stockMinimo', 'precioCompra', 'precioVenta', 'fechaIngreso', 'proveedor'].includes(field.id)}
                        />
                        <Label htmlFor={`select-${field.id}`}>{field.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {selectedInventoryFields.map(fieldId => {
                      const field = inventoryFields.find(f => f.id === fieldId)
                      if (!field) return null
                      return (
                        <div key={field.id}>
                          <Label htmlFor={field.id}>{field.label}</Label>
                          {field.type === 'date' ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={`w-full justify-start text-left font-normal ${
                                    !newInventoryItem[field.id as keyof InventoryItem] && "text-muted-foreground"
                                  }`}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {newInventoryItem[field.id as keyof InventoryItem] ? 
                                    format(new Date(newInventoryItem[field.id as keyof InventoryItem] as string), "PPP", { locale: es }) 
                                    : <span>Selecciona una fecha</span>
                                  }
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={newInventoryItem[field.id as keyof InventoryItem] ? new Date(newInventoryItem[field.id as keyof InventoryItem] as string) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      setNewInventoryItem({
                                        ...newInventoryItem,
                                        [field.id]: date.toISOString().split('T')[0]
                                      })
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type}
                              value={newInventoryItem[field.id as keyof InventoryItem] as string}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, [field.id]: e.target.value})}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <Button className="mt-4" onClick={handleAddInventoryItem}>Agregar Ítem</Button>
                </CardContent>
              </Card>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedInventoryFields.map(fieldId => {
                    const field = inventoryFields.find(f => f.id === fieldId)
                    return field ? <TableHead key={field.id}>{field.label}</TableHead> : null
                  })}
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    {selectedInventoryFields.map(fieldId => {
                      const field = inventoryFields.find(f => f.id === fieldId)
                      if (!field) return null
                      return (
                        <TableCell key={field.id}>
                          {editingInventoryId === item.id ? (
                            field.type === 'date' ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${
                                      !item[field.id as keyof InventoryItem] && "text-muted-foreground"
                                    }`}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {item[field.id as keyof InventoryItem] ? 
                                      format(new Date(item[field.id as keyof InventoryItem] as string), "PPP", { locale: es }) 
                                      : <span>Selecciona una fecha</span>
                                    }
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarComponent
                                    mode="single"
                                    selected={item[field.id as keyof InventoryItem] ? new Date(item[field.id as keyof InventoryItem] as string) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        setNewInventoryItem({
                                          ...newInventoryItem,
                                          [field.id]: date.toISOString().split('T')[0]
                                        })
                                      }
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Input
                                type={field.type}
                                value={newInventoryItem[field.id as keyof InventoryItem] as string}
                                onChange={(e) => setNewInventoryItem({...newInventoryItem, [field.id]: e.target.value})}
                              />
                            )
                          ) : (
                            field.type === 'date' ? 
                              format(new Date(item[field.id as keyof InventoryItem] as string), "PPP", { locale: es })
                              : item[field.id as keyof InventoryItem]
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      {editingInventoryId === item.id ? (
                        <Button onClick={handleSaveInventoryItem} size="sm">
                          <Save className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button onClick={() => handleEditInventoryItem(item.id)} size="sm">
                          Editar
                        </Button>
                      )}
                      <Button onClick={() => handleDeleteInventoryItem(item.id)} size="sm" variant="destructive" className="ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "facturacion" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Registro de Facturación</h2>
            <div className="mb-4 flex justify-between items-center">
              <Button onClick={() => setIsCreatingInvoiceItem(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Factura
              </Button>
              <div className="flex items-center space-x-2">
                <Label htmlFor="advanced-view-invoice">Vista avanzada</Label>
                <Checkbox
                  id="advanced-view-invoice"
                  checked={advancedViewInvoice}
                  onCheckedChange={(checked) => setAdvancedViewInvoice(checked as boolean)}
                />
              </div>
            </div>
            {isCreatingInvoiceItem && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Nueva Factura</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCreatingInvoiceItem(false)}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
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
                          defaultChecked={['id', 'fechaEmision', 'nombreCliente', 'detallesProducto', 'cantidad', 'precioUnitario', 'subtotal', 'impuestos', 'total', 'metodoPago'].includes(field.id)}
                        />
                        <Label htmlFor={`select-${field.id}`}>{field.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {selectedInvoiceFields.map(fieldId => {
                      const field = invoiceFields.find(f => f.id === fieldId)
                      if (!field) return null
                      return (
                        <div key={field.id}>
                          <Label htmlFor={field.id}>{field.label}</Label>
                          {field.type === 'date' ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={`w-full justify-start text-left font-normal ${
                                    !newInvoiceItem[field.id as keyof InvoiceItem] && "text-muted-foreground"
                                  }`}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {newInvoiceItem[field.id as keyof InvoiceItem] ? 
                                    format(new Date(newInvoiceItem[field.id as keyof InvoiceItem] as string), "PPP", { locale: es }) 
                                    : <span>Selecciona una fecha</span>
                                  }
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={newInvoiceItem[field.id as keyof InvoiceItem] ? new Date(newInvoiceItem[field.id as keyof InvoiceItem] as string) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      setNewInvoiceItem({
                                        ...newInvoiceItem,
                                        [field.id]: date.toISOString().split('T')[0]
                                      })
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type}
                              value={newInvoiceItem[field.id as keyof InvoiceItem] as string}
                              onChange={(e) => setNewInvoiceItem({...newInvoiceItem, [field.id]: e.target.value})}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <Button className="mt-4" onClick={handleAddInvoiceItem}>Agregar Factura</Button>
                </CardContent>
              </Card>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedInvoiceFields.map(fieldId => {
                    const field = invoiceFields.find(f => f.id === fieldId)
                    return field ? <TableHead key={field.id}>{field.label}</TableHead> : null
                  })}
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item) => (
                  <TableRow key={item.id}>
                    {selectedInvoiceFields.map(fieldId => {
                      const field = invoiceFields.find(f => f.id === fieldId)
                      if (!field) return null
                      return (
                        <TableCell key={field.id}>
                          {editingInvoiceId === item.id ? (
                            field.type === 'date' ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${
                                      !item[field.id as keyof InvoiceItem] && "text-muted-foreground"
                                    }`}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {item[field.id as keyof InvoiceItem] ? 
                                      format(new Date(item[field.id as keyof InvoiceItem] as string), "PPP", { locale: es }) 
                                      : <span>Selecciona una fecha</span>
                                    }
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarComponent
                                    mode="single"
                                    selected={item[field.id as keyof InvoiceItem] ? new Date(item[field.id as keyof InvoiceItem] as string) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        setNewInvoiceItem({
                                          ...newInvoiceItem,
                                          [field.id]: date.toISOString().split('T')[0]
                                        })
                                      }
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Input
                                type={field.type}
                                value={newInvoiceItem[field.id as keyof InvoiceItem] as string}
                                onChange={(e) => setNewInvoiceItem({...newInvoiceItem, [field.id]: e.target.value})}
                              />
                            )
                          ) : (
                            field.type === 'date' ? 
                              format(new Date(item[field.id as keyof InvoiceItem] as string), "PPP", { locale: es })
                              : item[field.id as keyof InvoiceItem]
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      {editingInvoiceId === item.id ? (
                        <Button onClick={handleSaveInvoiceItem} size="sm">
                          <Save className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button onClick={() => handleEditInvoiceItem(item.id)} size="sm">
                          Editar
                        </Button>
                      )}
                      <Button onClick={() => handleDeleteInvoiceItem(item.id)} size="sm" variant="destructive" className="ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => setIsIAOpen(!isIAOpen)}
          aria-label={isIAOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
        >
          {isIAOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </Button>
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
                <Input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleSendMessage}
                  className="flex-grow mr-2"
                />
                <Button onClick={() => handleSendMessage({ key: 'Enter', shiftKey: false } as React.KeyboardEvent<HTMLInputElement>)}>Enviar</Button>
              </div>
              <div className="flex justify-between">
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
                <Button variant="outline" size="icon" onClick={handleVoiceInput}>
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Entrada de voz</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}