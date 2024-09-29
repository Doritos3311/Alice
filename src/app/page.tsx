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
import { FileSpreadsheet, BarChart2, Package, FileText, Bot, X, Plus, Trash2, Save, Calendar, Upload, Mic } from "lucide-react"
import { OpenAI } from "openai"
import { toast } from "@/hooks/use-toast"

type RowData = {
  id: number
  fecha: string
  codCuenta: string
  concepto: string
  debe: number
  haber: number
}

const INITIAL_DATA: RowData[] = [
  { id: 1, fecha: "2023-01-01", codCuenta: "1000", concepto: "Ventas", debe: 1000, haber: 0 },
  { id: 2, fecha: "2023-01-02", codCuenta: "2000", concepto: "Compras", debe: 0, haber: 500 },
  { id: 3, fecha: "2023-01-03", codCuenta: "3000", concepto: "Servicios", debe: 0, haber: 200 },
  { id: 4, fecha: "2023-01-04", codCuenta: "1000", concepto: "Ventas", debe: 1500, haber: 0 },
]

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type InventoryItem = {
  id: string
  description: string
  category: string
  barcode: string
  initialQuantity: number
  availableQuantity: number
  unitOfMeasure: string
  minStock: number
  maxStock: number
  purchasePrice: number
  salePrice: number
  entryDate: string
  supplier: string
  location: string
  expirationDate: string
  status: string
  totalValue: number
  responsiblePerson: string
  notes: string
}

type InvoiceItem = {
  id: string
  issueDate: string
  customerName: string
  customerAddress: string
  taxId: string
  productDetails: string
  quantity: number
  unitPrice: number
  subtotal: number
  taxes: number
  total: number
  paymentMethod: string
  dueDate: string
  status: string
  purchaseOrderNumber: string
  discounts: number
  notes: string
  issuerDetails: string
  signature: string
}

const inventoryFields = [
  { id: 'id', label: 'Número de Ítem (ID)', type: 'text' },
  { id: 'description', label: 'Descripción del Producto', type: 'text' },
  { id: 'category', label: 'Categoría', type: 'text' },
  { id: 'barcode', label: 'Código de Barras/SKU', type: 'text' },
  { id: 'initialQuantity', label: 'Cantidad Inicial', type: 'number' },
  { id: 'availableQuantity', label: 'Cantidad Disponible', type: 'number' },
  { id: 'unitOfMeasure', label: 'Unidades de Medida', type: 'text' },
  { id: 'minStock', label: 'Stock Mínimo', type: 'number' },
  { id: 'maxStock', label: 'Stock Máximo', type: 'number' },
  { id: 'purchasePrice', label: 'Precio de Compra Unitario', type: 'number' },
  { id: 'salePrice', label: 'Precio de Venta Unitario', type: 'number' },
  { id: 'entryDate', label: 'Fecha de Ingreso', type: 'date' },
  { id: 'supplier', label: 'Proveedor', type: 'text' },
  { id: 'location', label: 'Ubicación en el Almacén', type: 'text' },
  { id: 'expirationDate', label: 'Fecha de Vencimiento', type: 'date' },
  { id: 'status', label: 'Estado del Producto', type: 'text' },
  { id: 'totalValue', label: 'Valor Total', type: 'number' },
  { id: 'responsiblePerson', label: 'Responsable del Registro', type: 'text' },
  { id: 'notes', label: 'Notas o Comentarios', type: 'textarea' },
]

const invoiceFields = [
  { id: 'id', label: 'Número de Factura', type: 'text' },
  { id: 'issueDate', label: 'Fecha de Emisión', type: 'date' },
  { id: 'customerName', label: 'Nombre del Cliente', type: 'text' },
  { id: 'customerAddress', label: 'Dirección del Cliente', type: 'text' },
  { id: 'taxId', label: 'RFC/NIF', type: 'text' },
  { id: 'productDetails', label: 'Detalles del Producto/Servicio', type: 'text' },
  { id: 'quantity', label: 'Cantidad de Productos/Servicios', type: 'number' },
  { id: 'unitPrice', label: 'Precio Unitario', type: 'number' },
  { id: 'subtotal', label: 'Subtotal', type: 'number' },
  { id: 'taxes', label: 'Impuestos Aplicables', type: 'number' },
  { id: 'total', label: 'Total a Pagar', type: 'number' },
  { id: 'paymentMethod', label: 'Método de Pago', type: 'text' },
  { id: 'dueDate', label: 'Fecha de Vencimiento del Pago', type: 'date' },
  { id: 'status', label: 'Estado de la Factura', type: 'text' },
  { id: 'purchaseOrderNumber', label: 'Número de Orden de Compra', type: 'text' },
  { id: 'discounts', label: 'Descuentos Aplicados', type: 'number' },
  { id: 'notes', label: 'Observaciones o Notas', type: 'textarea' },
  { id: 'issuerDetails', label: 'Datos del Emisor', type: 'text' },
  { id: 'signature', label: 'Firma', type: 'text' },
]

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
})

export default function ContabilidadApp() {
  const [activeTab, setActiveTab] = useState("libro-diario")
  const [data, setData] = useState<RowData[]>(INITIAL_DATA)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newRow, setNewRow] = useState<Omit<RowData, 'id'>>({
    fecha: "",
    codCuenta: "",
    concepto: "",
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
  const [newInventoryItem, setNewInventoryItem] = useState<InventoryItem>({} as InventoryItem)
  const [selectedInventoryFields, setSelectedInventoryFields] = useState<string[]>([])
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [newInvoiceItem, setNewInvoiceItem] = useState<InvoiceItem>({} as InvoiceItem)
  const [selectedInvoiceFields, setSelectedInvoiceFields] = useState<string[]>([])
  const [dashboardType, setDashboardType] = useState("financial")
  const [isCreatingInventoryItem, setIsCreatingInventoryItem] = useState(false)
  const [isCreatingInvoiceItem, setIsCreatingInvoiceItem] = useState(false)

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
    setNewRow({ fecha: "", codCuenta: "", concepto: "", debe: 0, haber: 0 })
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

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = { role: 'user' as const, content: inputMessage }
      setMessages(prev => [...prev, userMessage])
      setInputMessage("")

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are Alice IA, a helpful assistant for accounting and finance." },
            ...messages,
            userMessage
          ],
        })

        const assistantMessage = { role: 'assistant' as const, content: response.choices[0].message.content || "Lo siento, no pude generar una respuesta." }
        setMessages(prev => [...prev, assistantMessage])
      } catch (error) {
        console.error("Error al comunicarse con la IA:", error)
        setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error al procesar tu solicitud." }])
      }
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
    if (selectedInventoryFields.some((field: string) => !newInventoryItem[field as keyof InventoryItem])) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos seleccionados antes de agregar un nuevo ítem.",
        variant: "destructive",
      })
      return
    }
    setInventoryItems([...inventoryItems, newInventoryItem])
    setNewInventoryItem({} as InventoryItem)
    setSelectedInventoryFields([])
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
    setNewInvoiceItem({} as InvoiceItem)
    setSelectedInvoiceFields([])
    setIsCreatingInvoiceItem(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menú lateral */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Contabilidad IA</h1>
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
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[180px]"
                />
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
                  <TableHead>Cod. Cuenta</TableHead>
                  <TableHead>Concepto</TableHead>
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
                          value={row.codCuenta}
                          onChange={(e) => handleInputChange(row.id, 'codCuenta', e.target.value)}
                        />
                      ) : (
                        row.codCuenta
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <Input
                          type="text"
                          value={row.concepto}
                          onChange={(e) => handleInputChange(row.id, 'concepto', e.target.value)}
                        />
                      ) : (
                        row.concepto
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
                      value={newRow.codCuenta}
                      onChange={(e) => handleNewRowChange('codCuenta', e.target.value)}
                      placeholder="Cod. Cuenta"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={newRow.concepto}
                      onChange={(e) => handleNewRowChange('concepto', e.target.value)}
                      placeholder="Concepto"
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
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[180px]"
                />
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
            {dashboardType === "financial" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            )}
            {dashboardType === "inventory" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Inventario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Total de ítems: {inventoryItems.length}</p>
                    <p>Valor total del inventario: ${inventoryItems.reduce((sum, item) => sum + item.totalValue, 0).toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(inventoryItems.reduce((acc, item) => {
                            acc[item.category] = (acc[item.category] || 0) + 1
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
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === "inventario" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Registro de Inventario</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {inventoryFields.map(field => (
                    <TableHead key={field.id}>{field.label}</TableHead>
                  ))}
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item, index) => (
                  <TableRow key={index}>
                    {inventoryFields.map(field => (
                      <TableCell key={field.id}>{item[field.id as keyof InventoryItem] || '-'}</TableCell>
                    ))}
                    <TableCell>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isCreatingInventoryItem ? (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Nuevo Ítem de Inventario</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {inventoryFields.map(field => (
                    <div key={field.id} className="flex items-center">
                      <Checkbox
                        id={`checkbox-${field.id}`}
                        checked={selectedInventoryFields.includes(field.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedInventoryFields([...selectedInventoryFields, field.id])
                          } else {
                            setSelectedInventoryFields(selectedInventoryFields.filter(id => id !== field.id))
                          }
                        }}
                      />
                      <label htmlFor={`checkbox-${field.id}`} className="ml-2">
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedInventoryFields.map(fieldId => {
                  const field = inventoryFields.find(f => f.id === fieldId)
                  if (!field) return null
                  return (
                    <div key={field.id} className="mb-4">
                      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <Input
                        id={field.id}
                        type={field.type}
                        value={newInventoryItem[field.id as keyof InventoryItem] || ''}
                        onChange={(e) => setNewInventoryItem({...newInventoryItem, [field.id]: e.target.value})}
                      />
                    </div>
                  )
                })}
                <div className="flex justify-end space-x-2">
                  <Button onClick={() => setIsCreatingInventoryItem(false)}>Cancelar</Button>
                  <Button onClick={handleAddInventoryItem}>Agregar Ítem</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsCreatingInventoryItem(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ítem de Inventario
              </Button>
            )}
          </div>
        )}

        {activeTab === "facturacion" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Registro de Facturación</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {invoiceFields.map(field => (
                    <TableHead key={field.id}>{field.label}</TableHead>
                  ))}
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item, index) => (
                  <TableRow key={index}>
                    {invoiceFields.map(field => (
                      <TableCell key={field.id}>{item[field.id as keyof InvoiceItem] || '-'}</TableCell>
                    ))}
                    <TableCell>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isCreatingInvoiceItem ? (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Nueva Factura</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {invoiceFields.map(field => (
                    <div key={field.id} className="flex items-center">
                      <Checkbox
                        id={`checkbox-${field.id}`}
                        checked={selectedInvoiceFields.includes(field.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedInvoiceFields([...selectedInvoiceFields, field.id])
                          } else {
                            setSelectedInvoiceFields(selectedInvoiceFields.filter(id => id !== field.id))
                          }
                        }}
                      />
                      <label htmlFor={`checkbox-${field.id}`} className="ml-2">
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedInvoiceFields.map(fieldId => {
                  const field = invoiceFields.find(f => f.id === fieldId)
                  if (!field) return null
                  return (
                    <div key={field.id} className="mb-4">
                      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <Input
                        id={field.id}
                        type={field.type}
                        value={newInvoiceItem[field.id as keyof InvoiceItem] || ''}
                        onChange={(e) => setNewInvoiceItem({...newInvoiceItem, [field.id]: e.target.value})}
                      />
                    </div>
                  )
                })}
                <div className="flex justify-end space-x-2">
                  <Button onClick={() => setIsCreatingInvoiceItem(false)}>Cancelar</Button>
                  <Button onClick={handleAddInvoiceItem}>Agregar Factura</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsCreatingInvoiceItem(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Factura
              </Button>
            )}
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
                  className="flex-grow mr-2"
                />
                <Button onClick={handleSendMessage}>Enviar</Button>
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