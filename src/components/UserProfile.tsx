
{/* Ruta */}
//my-next-app\src\components\UserProfile.tsx

{/* Importacion de Librerias */}
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart2, Check, Copy, Edit, FileDown, FileSpreadsheet, FileUp, Handshake, Package, Users } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"


{/* Definicion de Tipos de Datos */}

// Definicion de Perfil Usuario
interface UserProfileProps {
  user: User;
  onUpdateUserType: (newType: 'personal' | 'empresa') => void;
  setActiveTab: (tab: string) => void;
  setShowLandingPage: (show: boolean) => void;
}

// Definicion de la iformacion del usuario
interface UserData {
  displayName: string;
  type: 'personal' | 'empresa';
  companyName?: string;
  rucCI?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, setActiveTab, setShowLandingPage }) => {

  {/* Declaracion de Estados */}

  // Estado de boton copiar
  const [copied, setCopied] = useState(false);

  // Estado de boton edicion
  const [isEditing, setIsEditing] = useState(false);

  // Estado de Informacion de Usuario
  const [userData, setUserData] = useState<UserData>({
    displayName: user?.displayName || '', // Usamos el operador optional chaining
    type: 'personal',
    companyName: '',
  });

  // Estado Informacion Base de Datos
  const db = getFirestore();

  // Estado Modo Nocturno
  const { theme } = useTheme()

  // Efecto para extraer los datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, `users/${user?.uid}/Usuario`, 'datos'));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
      }
    };
    fetchUserData();
  }, [user?.uid]);

  // Funcion para copiar id
  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  // Funcion para guardar informacion
  const handleSave = async () => {
    try {

      // Analiza que tipo de usuario se selecciono
      const dataToSave = {
        ...userData,
        companyName: userData.type === 'empresa' ? userData.companyName : null
      };

      // Modifica el tipo de usuario segun el cual se registra
      await setDoc(doc(db, `users/${user?.uid}/Usuario`, 'datos'), dataToSave);
      setIsEditing(false);
      toast({
        title: "Éxito",
        description: "Datos de usuario actualizados correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los datos. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen p-6 space-x-6">
      {/* Sección izquierda: Perfil del usuario */}
      <Card className="w-full max-w-sm h-auto">

        {/* Recuadro de Usuario */}
        <CardContent className="flex flex-col items-center p-6">

          {/* Perfil Usuario */}
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={user?.photoURL || undefined} alt={userData.displayName || "Usuario"} />
            <AvatarFallback>{userData.displayName ? userData.displayName[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>

          {/* TNombre en base a tipo de Usuario */}
          {userData.type === 'empresa' ? (
            <h2 className="text-2xl font-bold mb-2">{userData.companyName}</h2>
          ) : (
            <h2 className="text-2xl font-bold mb-2">{userData.displayName}</h2>
          )}

          {/* Visualizador de Informacion */}
          <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
          <p className="text-sm text-gray-500 mb-4">
            Tipo: {userData.type === 'personal' ? 'Personal' : 'Empresa'}
          </p>
          <div className={`p-2 rounded-md mb-4 w-full text-center ${theme === "dark" ? "bg-[rgb(30,30,30)] text-[rgb(200,200,200)]" : "bg-[rgb(240,240,240)] text-[rgb(20,20,20)]"}`}>
            <p className="text-xs text-gray-500 mb-1">
              {userData.type === 'personal' ? 'ID de Usuario' : 'ID de Empresa'}
            </p>
            <p className="text-sm font-mono break-all">{user?.uid}</p>
          </div>

          {/* Botones */}
          <div className="flex space-x-2">

            {/* Boton Copiar Id */}
            <Button
              onClick={copyToClipboard}
              size="sm"
              className={`transition-colors duration-200 ${copied ? 'bg-green-500 text-white' : ''}`}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar ID
                </>
              )}
            </Button>

            {/* Boton Editar Perfil */}
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>

          </div>
        </CardContent>

        {/* Modal Editar Perfil */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent aria-describedby={undefined}>

            {/* Cabecera */}
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>

            {/* Contenido Principal */}
            <div className="space-y-4">
              <RadioGroup
                value={userData.type}
                onValueChange={(value: 'personal' | 'empresa') => 
                  setUserData({ ...userData, type: value, companyName: value === 'personal' ? undefined : userData.companyName })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal">Personal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="empresa" id="empresa" />
                  <Label htmlFor="empresa">Empresa</Label>
                </div>
              </RadioGroup>
              {userData.type === 'personal' ? (
                <div>
                  <Label htmlFor="displayName">Nombre</Label>
                  <Input
                    id="displayName"
                    value={userData.displayName}
                    onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    value={userData.companyName || ''}
                    onChange={(e) => setUserData({ ...userData, companyName: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Contenido Inferior */}
            <DialogFooter>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
            
          </DialogContent>
        </Dialog>
      </Card>

      {/* Sección derecha: Información adicional y funciones */}
      <Card className="w-2/3">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="rucCI">R.U.C/C.I:</Label>
              <Input
                id="rucCI"
                value={userData.rucCI || ''}
                onChange={(e) => setUserData({ ...userData, rucCI: e.target.value })}
              />
            </div>

            {/* Botones con icono en la parte superior y texto debajo */}
            <div className="grid grid-cols-2 gap-4">
              {/* Botón Servicios */}
              <Button
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setShowLandingPage(true);
                  setActiveTab("servicios");
                }}
              >
                <Handshake className="h-16 w-16" /> {/* Icono más grande */}
                <span>Servicios</span>
              </Button>

              {/* Botón Registro de Inventario */}
              <Button
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setShowLandingPage(true);
                  setActiveTab("inventario");
                }}
              >
                <Package className="h-16 w-16" /> {/* Icono más grande */}
                <span>Registro de Inventario</span>
              </Button>

              {/* Botón Facturas Emitidas */}
              <Button
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setShowLandingPage(true);
                  setActiveTab("facturacion-emitidas");
                }}
              >
                <FileUp className="h-16 w-16" /> {/* Icono más grande */}
                <span>Facturas Emitidas</span>
              </Button>

              {/* Botón Facturas Recibidas */}
              <Button
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setShowLandingPage(true);
                  setActiveTab("facturacion-recibidas");
                }}
              >
                <FileDown className="h-16 w-16" /> {/* Icono más grande */}
                <span>Facturas Recibidas</span>
              </Button>

              {/* Botón Libro Diario */}
              <Button
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setShowLandingPage(true);
                  setActiveTab("libro-diario");
                }}
              >
                <FileSpreadsheet className="h-16 w-16" /> {/* Icono más grande */}
                <span>Libro Diario</span>
              </Button>

              {/* Botón Dashboard */}
              <Button
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setShowLandingPage(true);
                  setActiveTab("dashboard");
                }}
              >
                <BarChart2 className="h-16 w-16" /> {/* Icono más grande */}
                <span>Dashboard</span>
              </Button>

              {/* Botón Grupos de Trabajo */}
              <Button
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setShowLandingPage(true);
                  setActiveTab("grupos-trabajo");
                }}
              >
                <Users className="h-16 w-16" /> {/* Icono más grande */}
                <span>Grupos de Trabajo</span>
              </Button>

              {/* Botón Generar Registros */}
              <Button
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  setShowLandingPage(true);
                  setActiveTab("generar-registros");
                }}
              >
                <FileDown className="h-16 w-16" /> {/* Icono más grande */}
                <span>Generar Registros</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de edición de perfil */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup
              value={userData.type}
              onValueChange={(value: 'personal' | 'empresa') => 
                setUserData({ ...userData, type: value, companyName: value === 'personal' ? undefined : userData.companyName })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal">Personal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="empresa" id="empresa" />
                <Label htmlFor="empresa">Empresa</Label>
              </div>
            </RadioGroup>
            {userData.type === 'personal' ? (
              <div>
                <Label htmlFor="displayName">Nombre</Label>
                <Input
                  id="displayName"
                  value={userData.displayName}
                  onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  value={userData.companyName || ''}
                  onChange={(e) => setUserData({ ...userData, companyName: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label htmlFor="rucCI">R.U.C/C.I:</Label>
              <Input
                id="rucCI"
                value={userData.rucCI || ''}
                onChange={(e) => setUserData({ ...userData, rucCI: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;