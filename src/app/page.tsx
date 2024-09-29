"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { FileSpreadsheet, BarChart2, HelpCircle, X, Plus, Trash2, Save, Calendar, Upload, Mic } from "lucide-react"

type RowData = {
  id: number
  fecha: string
  concepto: string
  ingreso: number
  egreso: number
}

const INITIAL_DATA: RowData[] = [
  { id: 1, fecha: "2023-01-01", concepto: "Ventas", ingreso: 1000, egreso: 0 },
  { id: 2, fecha: "2023-01-02", concepto: "Compras", ingreso: 0, egreso: 500 },
  { id: 3, fecha: "2023-01-03", concepto: "Servicios", ingreso: 0, egreso: 200 },
  { id: 4, fecha: "2023-01-04", concepto: "Ventas", ingreso: 1500, egreso: 0 },
  { id: 5, fecha: "2023-02-01", concepto: "Ventas", ingreso: 2000, egreso: 0 },
  { id: 6, fecha: "2023-02-15", concepto: "Salarios", ingreso: 0, egreso: 1000 },
  { id: 7, fecha: "2023-03-01", concepto: "Inversiones", ingreso: 5000, egreso: 0 },
  { id: 8, fecha: "2023-03-30", concepto: "Impuestos", ingreso: 0, egreso: 1500 },
]

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ContabilidadApp() {
  const [activeTab, setActiveTab] = useState("tabla")
  const [data, setData] = useState<RowData[]>(INITIAL_DATA)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newRow, setNewRow] = useState<Omit<RowData, 'id'>>({
    fecha: "",
    concepto: "",
    ingreso: 0,
    egreso: 0
  })
  const [timeFrame, setTimeFrame] = useState("diario")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [isIAOpen, setIsIAOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const handleAddRow = () => {
    const id = Math.max(...data.map(row => row.id), 0) + 1
    setData([...data, { id, ...newRow }])
    setNewRow({ fecha: "", concepto: "", ingreso: 0, egreso: 0 })
  }

  const handleEditRow = (id: number) => {
    setEditingId(id)
  }

  const handleSaveRow = (id: number) => {
    setEditingId(null)
  }

  const handleDeleteRow = (id: number) => {
    setData(data.filter(row => row.id !== id))
  }

  const handleInputChange = (id: number, field: keyof RowData, value: string | number) => {
    setData(data.map(row => 
      row.id === id ? { ...row, [field]: field === 'ingreso' || field === 'egreso' ? Number(value) : value } : row
    ))
  }

  const handleNewRowChange = (field: keyof Omit<RowData, 'id'>, value: string | number) => {
    setNewRow({ ...newRow, [field]: field === 'ingreso' || field === 'egreso' ? Number(value) : value })
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
      acc.ingresos += row.ingreso
      acc.egresos += row.egreso
      return acc
    }, { ingresos: 0, egresos: 0 })
  }, [filteredData])

  const chartData = useMemo(() => {
    return [
      { name: 'Totales', Ingresos: totals.ingresos, Egresos: totals.egresos }
    ]
  }, [totals])

  const lineChartData = useMemo(() => {
    return filteredData.map(row => ({
      fecha: row.fecha,
      Ingresos: row.ingreso,
      Egresos: row.egreso
    }))
  }, [filteredData])

  const pieChartData = useMemo(() => {
    return [
      { name: 'Ingresos', value: totals.ingresos },
      { name: 'Egresos', value: totals.egresos }
    ]
  }, [totals])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { role: 'user', content: inputMessage }])
      // Aquí iría la lógica para enviar el mensaje a la IA y recibir una respuesta
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Respuesta simulada a: ${inputMessage}` }])
      }, 1000)
      setInputMessage("")
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menú lateral */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Contabilidad IA</h1>
          <nav>
            <Button
              variant={activeTab === "tabla" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setActiveTab("tabla")}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Tabla de Excel
            </Button>
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === "tabla" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Tabla de Excel</h2>
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
                  <TableHead>Concepto</TableHead>
                  <TableHead>Ingreso</TableHead>
                  <TableHead>Egreso</TableHead>
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
                          value={row.ingreso}
                          onChange={(e) => handleInputChange(row.id, 'ingreso', e.target.value)}
                        />
                      ) : (
                        `$${row.ingreso.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell className="text-red-600 font-bold">
                      {editingId === row.id ? (
                        <Input
                          type="number"
                          value={row.egreso}
                          onChange={(e) => handleInputChange(row.id, 'egreso', e.target.value)}
                        />
                      ) : (
                        `$${row.egreso.toFixed(2)}`
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
                      value={newRow.concepto}
                      onChange={(e) => handleNewRowChange('concepto', e.target.value)}
                      placeholder="Concepto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newRow.ingreso}
                      onChange={(e) => handleNewRowChange('ingreso', e.target.value)}
                      placeholder="Ingreso"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newRow.egreso}
                      onChange={(e) => handleNewRowChange('egreso', e.target.value)}
                      placeholder="Egreso"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600 font-bold">Total Ingresos: ${totals.ingresos.toFixed(2)}</p>
                  <p className="text-red-600 font-bold">Total Egresos: ${totals.egresos.toFixed(2)}</p>
                  <p className="font-bold">Balance: ${(totals.ingresos - totals.egresos).toFixed(3)}</p>
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
                      <Bar dataKey="Ingresos" fill="#4ade80" />
                      <Bar dataKey="Egresos" fill="#f87171" />
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
                      <Line type="monotone" dataKey="Ingresos" stroke="#4ade80" />
                      <Line type="monotone" dataKey="Egresos" stroke="#f87171" />
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
          {isIAOpen ? <X className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
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