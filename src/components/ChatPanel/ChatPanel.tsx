import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Asegúrate de importar los componentes correctos
import { Input } from "@/components/ui/input"
import { Settings, X, Bot, Upload, Mic } from 'lucide-react'; // Asegúrate de importar los íconos correctos
import styles from '@/components/ChatPanel/ChatPanel.module.css'; // Asegúrate de importar los estilos correctos
import { useTheme } from "next-themes"
import { getAuth } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

// OCR
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Definir el tipo Message
type Message = {
    role: "user" | "assistant";
    content: string;
    file?: { name: string; type: string; url: string };
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
    setNewCliente, }) => {

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el mensaje de carga
    const [typedMessage, setTypedMessage] = useState(""); // Estado para el mensaje que se está escribiendo
    const typingSpeed = 10;
    const auth = getAuth();
    const user = auth.currentUser;

    const chatRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();
    const [PROMT, setPROMT] = useState("");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [panelWidth, setPanelWidth] = useState(64); // Ancho inicial cuando está cerrado
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef<number>(0); // Posición inicial del mouse
    const startWidthRef = useRef<number>(0); // Ancho inicial del panel


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

    // Manejador para iniciar el redimensionamiento
    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        startXRef.current = e.clientX;
        startWidthRef.current = panelWidth;
        setIsResizing(true);
    };

    // Manejador para redimensionar el panel
    const resizePanel = (e: MouseEvent) => {
        if (!isResizing || !panelRef.current) return;
        const newWidth = Math.min(Math.max(startWidthRef.current - (startXRef.current - e.clientX), 300), 900);
        setPanelWidth(newWidth);
    };

    // Manejador para detener el redimensionamiento
    const stopResizing = () => {
        setIsResizing(false);
    };

    // Agregar listeners para el redimensionamiento
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resizePanel);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resizePanel);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing]);

    useEffect(() => {
        if (isIAOpen) {
            setPanelWidth(384); // Ancho cuando está abierto
        } else {
            setPanelWidth(64); // Ancho cuando está cerrado
        }
    }, [isIAOpen]);

    // Funciones JSON
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

    {/* Analicis de archivos */ }

    // Imagenes
    const extractTextFromImage = async (imageFile: File) => {
        const result = await Tesseract.recognize(imageFile, 'spa'); // 'spa' para español
        return result.data.text;
    };

    // PDF
    const extractTextFromPDF = async (pdfFile: File) => {
        const pdf = await pdfjsLib.getDocument({ data: await pdfFile.arrayBuffer() }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(" ");
        }
        return text;
    };

    // Word
    const extractTextFromWord = async (wordFile: File) => {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer: await wordFile.arrayBuffer() });
        return result.value; // Texto extraído del archivo Word
    };

    // Exel
    const extractTextFromExcel = async (excelFile: File) => {
        const XLSX = await import('xlsx');
        const arrayBuffer = await excelFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let text = "";

        workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            text += XLSX.utils.sheet_to_csv(sheet); // Convierte la hoja a texto
        });

        return text;
    };

    {/* Envio y Manejo de Mensajes */ }

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

            if (inputMessage.trim() || selectedFile) {
                // Crear un mensaje con el archivo adjunto (si existe)
                const userMessage: Message = {
                    role: "user",
                    content: inputMessage,
                    file: selectedFile
                        ? {
                            name: selectedFile.name,
                            type: selectedFile.type,
                            url: URL.createObjectURL(selectedFile), // Crear URL temporal
                        }
                        : undefined,
                };

                setMessages((prev) => [...prev, userMessage]); // Agregar el mensaje al chat
                setInputMessage(""); // Limpiar el input
                setIsProcessing(true); // Mostrar "Procesando..."

                try {
                    let fileContent = "";
                    if (selectedFile) {
                        // Extraer el contenido del archivo (si es necesario)
                        if (selectedFile.type.startsWith('image/')) {
                            fileContent = await extractTextFromImage(selectedFile);
                        } else if (selectedFile.type === 'application/pdf') {
                            fileContent = await extractTextFromPDF(selectedFile);
                        } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                            fileContent = await extractTextFromWord(selectedFile);
                        } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                            fileContent = await extractTextFromExcel(selectedFile);
                        } else {
                            fileContent = "Tipo de archivo no soportado.";
                        }
                    }

                    // Enviar el mensaje y el contenido del archivo a la IA
                    const aiResponse = await sendMessageToOpenRouter(
                        selectedFile
                            ? `Mensaje: ${inputMessage}\nContenido del archivo: ${fileContent}`
                            : inputMessage,
                        messages
                    );

                    // Procesar la respuesta de la IA (igual que antes)
                    let responseData: { function?: string; params?: any; message?: string } = {};
                    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);

                    if (jsonMatch) {
                        responseData = JSON.parse(jsonMatch[1]);
                    } else {
                        responseData = { function: undefined, message: aiResponse };
                    }

                    // Simular escritura letra por letra
                    if (responseData.message) {
                        setTypedMessage("");
                        typeMessage(responseData.message, () => {
                            const assistantMessage: Message = {
                                role: "assistant",
                                content: responseData.message || "Lo siento, no entendí la solicitud.",
                            };
                            setMessages((prev) => [...prev, assistantMessage]);
                            setTypedMessage("");
                        });
                    }

                    if (responseData.function) {
                        const functionName = responseData.function.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                        if (functionName in functions) {
                            setTimeout(() => {
                                functions[functionName](responseData.params || {});
                            }, 1000);
                        }
                    }
                } catch (error) {
                    console.error("Error:", error);
                    setMessages((prev) => [...prev, { role: "assistant", content: "Lo siento, hubo un error." }]);
                } finally {
                    setIsProcessing(false);
                    setSelectedFile(null); // Limpiar el archivo seleccionado después de enviarlo
                }
            }
        } else if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setInputMessage((prev) => prev + '\n');
        }
    };

    // Función para manejar la subida de archivos
    const handleFileUploadClick = () => {
        fileInputRef.current?.click(); // Simula el clic en el input de archivo
    };

    // Funcion para manejar archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file); // Solo guarda el archivo, no lo envía al chat
    };

    // Función para manejar la entrada de voz
    const handleVoiceInput = () => {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputMessage(transcript);
        };
        recognition.start();
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

    // Funcion para extraer los JSON
    const formatMessage = (message: string) => {
        // Convertir **TEXTO** a <strong>TEXTO</strong>
        message = message.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Convertir saltos de línea a <br />
        message = message.replace(/\n/g, "<br />");

        return message;
    };

    return (
        <div ref={panelRef} style={{ width: `${panelWidth}px` }} className={`${styles.container} ${isIAOpen ? styles.widthOpen : styles.widthClosed} ${theme === "dark" ? styles.darkTheme : styles.lightTheme}`}>

            {/* Btn Configuracion */}
            {isIAOpen ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className={styles.configbutton}
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
                onClick={() => { setIsIAOpen(!isIAOpen); setPanelWidth(2) }}
                aria-label={isIAOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
            >
                {isIAOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            </Button>

            {/* Interfaz Panel IA */}
            {isIAOpen && (
                <>
                    <div className={styles.nav}>
                        <h1 className={styles.title}>Alice</h1>
                    </div>
                    <div className={`${styles.flexGrow} overflow-auto p-4`} ref={chatRef}>
                        {/* Mensaje */}
                        {messages.map((message, index) => (
                            <div key={index} className={`${styles.messageContainer} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                                <div className={`${message.role === 'user' ? styles.messageConenedor : styles.assistantMessageContenedor}`}>
                                    {/* Avatar del usuario o IA */}
                                    {message.role === 'user' ? (
                                        <Avatar className={styles.userAvatar}>
                                            <AvatarImage className={styles.userImg} src={user?.photoURL || undefined} alt={user?.displayName || "Usuario"} />
                                            <AvatarFallback className={styles.avatarFallback}>
                                                {user?.displayName ? user.displayName[0] : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <Avatar className={styles.iaAvatar}>
                                            <AvatarFallback className={styles.avatarFallback}>A</AvatarFallback>
                                        </Avatar>
                                    )}

                                    {/* Contenido del mensaje */}
                                    <div className={`${styles.messageBubble} ${message.role === 'user' ? (theme === 'dark' ? styles.darkMessageBubble : styles.lightMessageBubble) : (theme === 'dark' ? styles.darkMessageBubble : styles.lightMessageBubble)}`}>
                                        <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                                    </div>
                                </div>


                                {/* Mostrar el archivo adjunto */}
                                {message.file && (
                                    <div className={` ${styles.filePreview} ${theme === 'dark' ? styles.darkfilePreview : styles.lightfilePreview}`}>
                                        {message.file.type.startsWith("image/") ? (
                                            <img src={message.file.url} alt={message.file.name} className={` ${styles.previewImage} ${theme === 'dark' ? styles.darkPreviewImage : styles.lightPreviewImage}`} />
                                        ) : (
                                            <a href={message.file.url} target="_blank" rel="noopener noreferrer" className={` ${styles.previewFile} ${theme === 'dark' ? styles.darkpreviewFile : styles.lightpreviewFile}`}>
                                                {message.file.name}
                                            </a>
                                        )}
                                    </div>
                                )}

                            </div>
                        ))}
                        {/* Mensaje de carga */}
                        {isProcessing && (
                            <div className={styles.assistantMessage}>
                                <div className={styles.messageBubble}>
                                    <span className={styles.processingText}>Procesando...</span>
                                </div>
                            </div>
                        )}
                        {/* Mensaje que se está escribiendo */}
                        {typedMessage && (
                            <div className={styles.assistantMessage}>
                                <div className={`${styles.messageBubble} ${theme === 'dark' ? styles.darkMessageBubble : styles.lightMessageBubble}`}>
                                    <div dangerouslySetInnerHTML={{ __html: typedMessage }} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.inputContainer}>
                        {selectedFile && (
                            <div className={styles.fileIndicator}>
                                <span>{selectedFile.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedFile(null)} // Elimina el archivo seleccionado
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <div className={styles.flexContainer}>
                            {/* Barra de Texto */}
                            <Input
                                type="text"
                                placeholder="Escribe tu mensaje..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={handleSendMessage}
                                className={styles.flexGrow}
                            />
                        </div>
                        <div className={styles.buttonContainer}>
                            {/* Btn Subir Archivo */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleFileUploadClick}
                            >
                                <Upload className="h-4 w-4" />
                                <span className="sr-only">Subir archivo</span>
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange} // Aquí manejamos el cambio de archivo
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