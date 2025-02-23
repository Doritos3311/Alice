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

// Props del componente ChatPanel
interface ChatPanelProps {
    isIAOpen: boolean;
    setIsIAOpen: (isOpen: boolean) => void;
    setActiveTab: (tab: string) => void;
    setIsCreatingAccountingEntry: (isOpen: boolean) => void;
    setNewRow: (row: Record<string, string>) => void; // Acepta un objeto, no un string
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isIAOpen, setIsIAOpen, setActiveTab, setIsCreatingAccountingEntry, setNewRow }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el mensaje de carga

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
                console.log(text);
            } catch (error) {
                console.error("Error cargando el PROMT:", error);
            }
        };

        loadPrompt();
    }, []);

    const functions: Record<string, (params?: any) => void> = {
        crearAsientoContable: (fields) => {
            setActiveTab("libro-diario")
            setIsCreatingAccountingEntry(true);
            setNewRow(fields);
            console.log("Se ejecutó crearLibroDiario");
        },
        crearFactura: () => {
            console.log("Se ejecutó crearFactura");
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
                    model: "deepseek/deepseek-r1:free",
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
                    // Enviar mensaje a la IA
                    const aiResponse = await sendMessageToOpenRouter(inputMessage, messages);

                    // Intentar extraer JSON desde la respuesta de IA
                    let responseData: { function?: string; params?: any; message?: string } = {};
                    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/); // Extraer JSON entre ```json```

                    if (jsonMatch) {
                        responseData = JSON.parse(jsonMatch[1]); // Parsear el JSON extraído
                    } else {
                        responseData = { function: undefined, message: aiResponse }; // Si no es JSON, tratarlo como mensaje
                    }

                    // Mostrar la confirmación en lenguaje natural
                    if (responseData.message) {
                        const assistantMessage: Message = {
                            role: "assistant",
                            content: responseData.message || "Lo siento, no entendí la solicitud.", // Asegurar que `content` no sea `undefined`
                        };
                        setMessages((prev) => [...prev, assistantMessage]);
                    }

                    // Ejecutar la función si existe (después de mostrar la confirmación)
                    if (responseData.function) {
                        const functionName = responseData.function.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()); // Convertir snake_case a camelCase

                        if (functionName in functions) {
                            // Retrasar la ejecución de la función para que el usuario vea la confirmación
                            setTimeout(() => {
                                functions[functionName](responseData.params || {});
                            }, 1000); // Retraso de 1 segundo (ajusta según sea necesario)
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
                                    {message.content}
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