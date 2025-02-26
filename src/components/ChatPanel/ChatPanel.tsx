import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Asegúrate de importar los componentes correctos
import { Input } from "@/components/ui/input"
import { Settings, X, Bot, Upload, Mic } from 'lucide-react'; // Asegúrate de importar los íconos correctos
import styles from '@/components/ChatPanel/ChatPanel.module.css'; // Asegúrate de importar los estilos correctos
import { useTheme } from "next-themes"

// Definir el tipo Message
type Message = {
    role: "user" | "assistant";
    content: string;
};

// Definicion de Inventario
type InventoryItem = {
    id: string;
    [key: string]: any; // Permite campos dinámicos
};

// Definicion Factura
type InvoiceItem = {
    id: string
    tipoFactura: 'emitida' | 'recibida';
    fechaEmision?: any;
    [key: string]: any
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

// Props del componente ChatPanel
interface ChatPanelProps {
    isIAOpen: boolean;
    setIsIAOpen: (isOpen: boolean) => void;
    setActiveTab: (tab: string) => void;
    setIsCreatingAccountingEntry: (isOpen: boolean) => void;
    setIsInventoryModalOpen: (isOpen: boolean) => void;
    setIsInvoiceModalOpen: (isOpen: boolean) => void;
    setIsInvoiceReceivedModalOpen: (isOpen: boolean) => void;

    // Libro Diario
    setNewRow: (row: Record<string, string>) => void; // Acepta un objeto, no un string

    // Inventario
    setNewInventoryItem: (row: InventoryItem) => void; // Cambiado a InventoryItem

    // Facturación
    setNewInvoiceItem: (row: InvoiceItem) => void;
    setSearchTermCliente: (term: string) => void; // Cambiado a string en lugar de Record<string, string>
    setSearchTermProveedor: (term: string) => void;

    //Clientes
    setIsClienteModalOpen: (isOpen: boolean) => void;
    setNewCliente: (row: Cliente) => void;

    //Proveedores
    setIsProveedorModalOpen: (isOpen: boolean) => void;
    setNewProveedor: (row: Proveedor) => void;

}

const ChatPanel: React.FC<ChatPanelProps> = ({
    isIAOpen,
    setIsIAOpen,
    setActiveTab,
    setIsCreatingAccountingEntry,
    setIsInventoryModalOpen,
    setIsInvoiceModalOpen,
    setIsInvoiceReceivedModalOpen,
    setNewRow,
    setNewInventoryItem,
    setNewInvoiceItem,
    setSearchTermCliente,
    setSearchTermProveedor,
    setIsClienteModalOpen,
    setIsProveedorModalOpen,
    setNewProveedor,
    setNewCliente,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el mensaje de carga
    const [typedMessage, setTypedMessage] = useState(""); // Estado para el mensaje que se está escribiendo
    const typingSpeed = 10;

    const chatRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();
    const [PROMT, setPROMT] = useState("");

    // Configuración de la API
    const OPENROUTER_API_KEY = "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";
    const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    const SITE_URL = "https://aliceapp.vercel.app"; // Cambia esto por la URL de tu sitio
    const SITE_NAME = "AliceApp"; // Cambia esto por el nombre de tu sitio

    useEffect(() => {
        const loadPrompt = async () => {
            try {
                const response = await fetch("/prompt.txt");
                const text = await response.text();
                setPROMT(text);
                console.log(text)
            } catch (error) {
                console.error("Error cargando el PROMT:", error);
            }
        };

        loadPrompt();
    }, []);

    const functions: Record<string, (params?: any) => void> = {
        agregarInventario: (fields) => {
            setActiveTab("inventario")
            setIsInventoryModalOpen(true);
            setNewInventoryItem(fields);
            console.log("Se ejecutó crearItemInventario");
            console.log(fields);
        },
        agregarProveedor: (fields) => {
            setActiveTab("proveedores")
            setIsProveedorModalOpen(true);
            setNewProveedor(fields);
            console.log("Se ejecutó crear Proveedor");
            console.log(fields);
        },
        agregarCliente: (fields) => {
            setActiveTab("clientes")
            setIsClienteModalOpen(true);
            setNewCliente(fields);
            console.log("Se ejecutó crear Cliente");
            console.log(fields);
        },
        crearFactura: (fields) => {
            setActiveTab("facturacion-emitidas");
            setIsInvoiceModalOpen(true);

            // Actualiza el campo de búsqueda de cliente
            setSearchTermCliente(fields.identificacionAdquiriente);

            // Actualiza los campos de guiaRemision y metodoPago
            setNewInvoiceItem(fields);

            console.log("Se ejecutó crearFactura");
            console.log(fields);
        },
        crearFacturaRecibida: (fields) => {
            setActiveTab("facturacion-recibidas")

            setIsInvoiceReceivedModalOpen(true);

            // Actualiza el campo de búsqueda del proveedor
            setSearchTermProveedor(fields.identificacionAdquiriente);

            // Actualiza los campos de guiaRemision y metodoPago
            setNewInvoiceItem(fields);

            console.log("Se ejecutó crearItemInventario");
            console.log(fields);
        },
        crearAsientoContable: (fields) => {
            setActiveTab("libro-diario")
            setIsCreatingAccountingEntry(true);
            setNewRow(fields);
            console.log("Se ejecutó crearLibroDiario");
        },
    };

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
                    model: "google/gemini-2.0-flash-lite-preview-02-05:free",
                    messages: [
                        { role: "system", content: PROMT },
                        ...context,
                        { role: "user", content: message },
                    ],
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}. Detalles: ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("Error al comunicarse con OpenRouter:", error);
            return "Lo siento, hubo un error al procesar tu solicitud.";
        }
    };

    // Función para manejar el envío de mensajes
    const handleSendMessage = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            if (inputMessage.trim()) {
                const userMessage: Message = { role: "user", content: inputMessage };
                setMessages((prev) => [...prev, userMessage]);
                setInputMessage("");
                setIsProcessing(true);

                try {
                    const aiResponse = await sendMessageToOpenRouter(inputMessage, messages);

                    let responseData: { function?: string; params?: any; message?: string } = {};
                    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);

                    if (jsonMatch) {
                        responseData = JSON.parse(jsonMatch[1]);
                        console.log("Parsed JSON:", responseData); // Verifica que los valores 0 estén presentes
                    } else {
                        responseData = { function: undefined, message: aiResponse };
                    }

                    // Simular escritura letra por letra
                    if (responseData.message) {
                        setTypedMessage(""); // Reinicia el mensaje antes de empezar
                        typeMessage(responseData.message, () => {
                            const assistantMessage: Message = {
                                role: "assistant",
                                content: responseData.message || "Lo siento, no entendí la solicitud.",
                            };
                            setMessages((prev) => [...prev, assistantMessage]);
                            setTypedMessage(""); // Limpia el mensaje escrito después de completar
                        });
                    }

                    if (responseData.function) {
                        const functionName = responseData.function.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

                        if (functionName in functions) {
                            setTimeout(() => {
                                console.log("Params:", responseData.params); // Verifica que los valores 0 estén presentes
                                functions[functionName](responseData.params || {});
                            }, 1000);
                        }
                    }
                } catch (error) {
                    console.error("Error:", error);
                    setMessages((prev) => [...prev, { role: "assistant", content: "Lo siento, hubo un error." }]);
                } finally {
                    setIsProcessing(false);
                }
            }
        } else if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setInputMessage((prev) => prev + '\n');
        }
    };

    // Función para manejar la subida de archivos
    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    // Función para manejar la entrada de voz
    const handleVoiceInput = () => {
        console.log("Iniciando entrada de voz...");
    };

    // Función para simular la escritura letra por letra
    const typeMessage = (message: string, onComplete?: () => void) => {
        let index = 0;
        setTypedMessage(""); // Reinicia el mensaje antes de empezar a escribir

        const interval = setInterval(() => {
            const currentText = message.substring(0, index + 1); // Obtiene el texto hasta el índice actual
            const formattedText = formatMessage(currentText); // Formatea el texto en tiempo real
            setTypedMessage(formattedText); // Actualiza el estado con el texto formateado
            index++;

            if (index >= message.length) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, typingSpeed); // Velocidad de escritura (en milisegundos)
    };

    const formatMessage = (message: string) => {
        // Convertir **TEXTO** a <strong>TEXTO</strong>
        message = message.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Convertir saltos de línea a <br />
        message = message.replace(/\n/g, "<br />");

        return message;
    };

    return (
        <div className={`fixed right-0 top-0 h-full shadow-lg transition-all duration-300 ease-in-out ${isIAOpen ? 'w-96' : 'w-16'} flex flex-col ${theme === "dark" ? 'bg-[rgb(28,28,28)]' : 'bg-[rgb(248,248,248)]'}`}>
            {/* Btn Configuracion */}
            {isIAOpen ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className={`${styles.configbutton}`}
                >
                    <Settings className={styles.iconconfig} />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    className={`${styles.configbutton} ${styles.hidden}`}
                    onClick={() => setActiveTab("configuracion")}
                >
                    <Settings className={styles.iconconfig} />
                </Button>
            )}

            {/* Btn Desplegar Panel */}
            <Button
                variant="ghost"
                size="icon"
                className={styles.iaButton}
                onClick={() => setIsIAOpen(!isIAOpen)}
                aria-label={isIAOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
            >
                {isIAOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            </Button>

            {/* Interfaz Panel IA */}
            {isIAOpen && (
                <>
                    <div className="flex-grow overflow-auto p-4 pt-16" ref={chatRef}>
                        {/* Mensaje */}
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? (theme === 'dark' ? 'bg-[rgb(15,15,15)] text-gray-300' : 'bg-gray-200 text-gray-900') : (theme === 'dark' ? 'bg-[rgb(25,25,25)] text-gray-300' : 'bg-gray-200 text-gray-900')}`}>
                                    <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                                </div>
                            </div>
                        ))}
                        {/* Mensaje de carga */}
                        {isProcessing && (
                            <div className="text-left mb-4">
                                <div className="inline-block p-2 rounded-lg">
                                    Procesando...
                                </div>
                            </div>
                        )}
                        {/* Mensaje que se está escribiendo */}
                        {typedMessage && (
                            <div className="text-left mb-4">
                                <div className={`inline-block p-2 rounded-lg ${theme === 'dark' ? 'bg-[rgb(25,25,25)] text-gray-300' : 'bg-gray-200 text-gray-900'}`}>
                                    <div dangerouslySetInnerHTML={{ __html: typedMessage }} />
                                </div>
                            </div>
                        )}
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
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleFileUpload}
                            >
                                <Upload className="h-4 w-4" />
                                <span className="sr-only">Subir archivo</span>
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                id="file-upload"
                                className="hidden"
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
    );
};

export default ChatPanel;