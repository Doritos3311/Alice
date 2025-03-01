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

    // Clientes
    setIsClienteModalOpen: (isOpen: boolean) => void;
    setNewCliente: (row: Cliente) => void;

    // Proveedores
    setIsProveedorModalOpen: (isOpen: boolean) => void;
    setNewProveedor: (row: Proveedor) => void;

    // Datos
    libroDiarioData: Record<string, any>[];
    inventarioData: Record<string, any>[];
    facturacionEmitidaData: Record<string, any>[];
    facturacionRecibidaData: Record<string, any>[];
    proveedoresData: Record<string, any>[];
    clientesData: Record<string, any>[];
    serviciosData: Record<string, any>[];

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
    libroDiarioData, // Acceder a los datos del libro diario
    inventarioData, // Acceder a los datos del inventario
    facturacionEmitidaData, // Acceder a los datos de facturación 
    facturacionRecibidaData,
    proveedoresData,
    clientesData,
    serviciosData,
}) => {

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el mensaje de carga
    const [typedMessage, setTypedMessage] = useState(""); // Estado para el mensaje que se está escribiendo
    const inputRef = useRef<HTMLInputElement>(null); // Definir tipo explícito de la referencia
    const typingSpeed = 10;
    const auth = getAuth();
    const user = auth.currentUser;

    const chatRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();
    const [PROMT, setPROMT] = useState("");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [panelWidth, setPanelWidth] = useState(64); // Ancho inicial cuando está cerrado
    const [memoryPanelWidth, setMemoryPanelWidth] = useState(420); // Ancho inicial cuando está cerrado
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
        document.body.style.cursor = "ew-resize";
    };

    const resizePanel = (e: MouseEvent) => {
        if (!isResizing) return;

        const deltaX = startXRef.current - e.clientX; // Mantiene la dirección correcta
        const newWidth = Math.max(550, Math.min(950, startWidthRef.current + deltaX)); // Asegura que no supere 900px

        setPanelWidth(newWidth); // Se actualiza instantáneamente
    };

    // Manejador para detener el redimensionamiento
    const stopResizing = () => {
        setIsResizing(false);
        document.body.style.cursor = "default";
    };

    // Agregar listeners para el redimensionamiento
    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resizePanel);
            window.addEventListener("mouseup", stopResizing);
        }

        return () => {
            window.removeEventListener("mousemove", resizePanel);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing]);

    useEffect(() => {

        const handleKeyPress = (e: { ctrlKey: any; key: string; }) => {
            // Verifica si se presionan las teclas 'Ctrl' y 'I' al mismo tiempo
            if (e.ctrlKey && e.key === 'i') {
                if (isIAOpen == false) {
                    setIsIAOpen(true);
                } else {
                    setIsIAOpen(false);
                }
            }
        };

        // Añade el event listener
        window.addEventListener('keydown', handleKeyPress);

        if (isIAOpen) {
            if (memoryPanelWidth >= 550) {
                setPanelWidth(memoryPanelWidth);
            } else {
                setPanelWidth(550); // Ancho cuando está abierto
            }
        } else {
            setPanelWidth(64); // Ancho cuando está cerrado
        }

        if (isIAOpen && inputRef.current) {
            inputRef.current.focus();
        }

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
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
            return "El servidor de alice esta en mantenimiento😊 intentelo nuevamente mas tarde.";
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

                    // Enviar el mensaje a la IA
                    const aiResponse = await sendMessageToOpenRouter(
                        selectedFile
                            ? `Mensaje: ${inputMessage}\nContenido del archivo: ${fileContent}`
                            : inputMessage,
                        messages
                    );

                    // Procesar la respuesta de la IA
                    let responseData: { function?: string; params?: any; message?: string } = {};
                    console.log(responseData);
                    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);

                    if (jsonMatch) {
                        responseData = JSON.parse(jsonMatch[1]);
                        await procesarRespuestaIA(responseData); // Procesar la respuesta de la IA
                    } else {
                        // Si no hay un JSON válido, mostrar la respuesta directa
                        setMessages((prev) => [
                            ...prev,
                            { role: "assistant", content: aiResponse || "Lo siento, no entendí la solicitud." },
                        ]);
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

    // Funciones par manejar JSON de solicitud de datos
    const obtenerDatos = async (tipoDatos: string) => {
        switch (tipoDatos) {
            case "libroDiario":
                setActiveTab("libro-diario"); // Cambiar a la pestaña del libro diario
                return libroDiarioData; // Devolver los datos del libro diario

            case "inventario":
                setActiveTab("inventario"); // Cambiar a la pestaña de inventario
                return inventarioData; // Devolver los datos del inventario

            case "facturacionEmitida":
                setActiveTab("facturacion-emitida"); // Cambiar a la pestaña de facturación emitida
                return facturacionEmitidaData; // Devolver los datos de facturación emitida

            case "facturacionRecibida":
                setActiveTab("facturacion-recibida"); // Cambiar a la pestaña de facturación recibida
                return facturacionRecibidaData; // Devolver los datos de facturación recibida

            case "proveedores":
                setActiveTab("proveedores"); // Cambiar a la pestaña de proveedores
                return proveedoresData; // Devolver los datos de proveedores

            case "clientes":
                setActiveTab("clientes"); // Cambiar a la pestaña de clientes
                return clientesData; // Devolver los datos de clientes

            case "servicios":
                setActiveTab("servicios"); // Cambiar a la pestaña de servicios
                return serviciosData; // Devolver los datos de servicios

            default:
                console.log("Tipo de datos no válido:", tipoDatos); // Depuración
                return null; // Devolver null si el tipo de datos no es válido
        }
    };

    // Funciones para enviar los datos del software
    const procesarRespuestaIA = async (responseData: any) => {
        console.log("Respuesta de la IA recibida:", responseData); // Depuración

        if (responseData.function === "solicitarDatos") {
            // Paso 1: La IA solicita datos
            const { tipoDatos, accion } = responseData.params;
            console.log("Tipo de datos solicitado:", tipoDatos); // Depuración
            console.log("Acción solicitada:", accion); // Depuración

            // Obtener los datos solicitados
            const datos = await obtenerDatos(tipoDatos);
            console.log("Datos obtenidos:", datos); // Depuración

            if (datos) {
                // Enviar los datos a la IA
                console.log("Enviando datos a la IA:", datos); // Depuración
                const aiResponse = await sendMessageToOpenRouter(
                    JSON.stringify({ tipoDatos, datos, accion }),
                    messages
                );
                console.log("Respuesta de la IA con datos:", aiResponse); // Depuración

                // Extraer el JSON del bloque de Markdown (```json ... ```)
                const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    try {
                        const parsedResponse = JSON.parse(jsonMatch[1]);
                        if (parsedResponse.message) {
                            // Mostrar el mensaje de la IA en el chat
                            setTypedMessage("");
                            typeMessage(parsedResponse.message, () => {
                                const assistantMessage: Message = {
                                    role: "assistant",
                                    content: parsedResponse.message,
                                };
                                setMessages((prev) => [...prev, assistantMessage]); // Actualizar el estado
                                setTypedMessage("");
                            });
                        } else {
                            // Si no hay un campo "message", mostrar la respuesta completa
                            setTypedMessage("");
                            typeMessage(aiResponse, () => {
                                const assistantMessage: Message = {
                                    role: "assistant",
                                    content: aiResponse,
                                };
                                setMessages((prev) => [...prev, assistantMessage]); // Actualizar el estado
                                setTypedMessage("");
                            });
                        }
                    } catch (error) {
                        // Si no es un JSON válido, mostrar la respuesta como texto plano
                        console.log("Error al parsear el JSON:", error); // Depuración
                        setTypedMessage("");
                        typeMessage(aiResponse, () => {
                            const assistantMessage: Message = {
                                role: "assistant",
                                content: aiResponse,
                            };
                            setMessages((prev) => [...prev, assistantMessage]); // Actualizar el estado
                            setTypedMessage("");
                        });
                    }
                } else {
                    // Si no hay un bloque de Markdown, mostrar la respuesta como texto plano
                    console.log("No se encontró un bloque de Markdown en la respuesta."); // Depuración
                    setTypedMessage("");
                    typeMessage(aiResponse, () => {
                        const assistantMessage: Message = {
                            role: "assistant",
                            content: aiResponse,
                        };
                        setMessages((prev) => [...prev, assistantMessage]); // Actualizar el estado
                        setTypedMessage("");
                    });
                }
            } else {
                console.log("No se pudieron obtener los datos solicitados."); // Depuración
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "No se pudieron obtener los datos solicitados." },
                ]);
            }
        } else if (responseData.message) {
            // Paso 2: La IA devuelve un mensaje con el análisis o cálculo
            setTypedMessage("");
            typeMessage(responseData.message, () => {
                const assistantMessage: Message = {
                    role: "assistant",
                    content: responseData.message,
                };
                setMessages((prev) => [...prev, assistantMessage]); // Actualizar el estado
                setTypedMessage("");
            });
        } else {
            // Si la respuesta no es un JSON válido, mostrarla como texto plano
            setTypedMessage("");
            typeMessage(responseData, () => {
                const assistantMessage: Message = {
                    role: "assistant",
                    content: responseData,
                };
                setMessages((prev) => [...prev, assistantMessage]); // Actualizar el estado
                setTypedMessage("");
            });
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
        <div
            ref={panelRef}
            style={{ width: `${panelWidth}px` }}
            className={`${styles.container} ${isIAOpen ? styles.widthOpen : styles.widthClosed} ${theme === "dark" ? styles.darkTheme : styles.lightTheme}`}
        >
            {/* Borde para ajustar tamaño */}
            <div
                onMouseDown={startResizing}
                className={isIAOpen ? styles.resizeHandle : ""}
            >
            </div>

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
                onClick={() => { { isIAOpen ? setMemoryPanelWidth(panelWidth) : "" } setIsIAOpen(!isIAOpen); }}
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
                        <div className={styles.flexGrowConent}>
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
                    </div>
                    <div className={styles.inputContainer}>
                        <div className={theme === "dark" ? styles.inputContenido : styles.lightinputContenido}>
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
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Escribe tu mensaje..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleSendMessage}
                                    className={styles.inputMessage}
                                />
                            </div>
                            <div className={styles.buttonContainer}>
                                {/* Btn Subir Archivo */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleFileUploadClick}
                                    className={`${theme === 'dark' ? styles.btnSub : styles.btnSubLigth}`}
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
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleVoiceInput}
                                    className={`${theme === 'dark' ? styles.btnSub : styles.btnSubLigth}`}
                                >
                                    <Mic className="h-4 w-4" />
                                    <span className="sr-only">Entrada de voz</span>
                                </Button>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default ChatPanel;