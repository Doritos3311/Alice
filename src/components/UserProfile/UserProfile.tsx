
{/* Ruta */}
//my-next-app\src\components\UserProfile.tsx

{/* Importacion de Librerias */}
import React, { useState, useEffect } from 'react';
import styles from "./UserProfile.module.css"; // Importa el CSS Module

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
import { toast } from "@/components/hooks/use-toast"
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
    <div className={styles.container}>
      {/* Sección izquierda: Perfil del usuario */}
      <Card className={`${styles.card} ${theme === "light" ? styles.cardLight : styles.cardDark}`}>

        <CardContent className={styles.cardContent}>

          {/* Perfil Usuario */}
          <h2 className={styles.nameTitle}>Foto de Perfil</h2>
          <Avatar className={styles.avatar}>
            <AvatarImage src={user?.photoURL || undefined} alt={userData.displayName || "Usuario"} />
            <AvatarFallback className={styles.avatar}>{userData.displayName ? userData.displayName[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>

          <div className={`${styles.separacion} ${theme === "light" ? styles.separacionLight : styles.separacionDark}`}></div>

          {/* Nombre en base a tipo de Usuario */}
          <div>
            <h2 className={styles.nameTitle}>Nombre</h2>
            {userData.type === 'empresa' ? (
              <h2 className={styles.subtitle}>{userData.companyName}</h2>
            ) : (
              <h2 className={styles.subtitle}>{userData.displayName}</h2>
            )}
          </div>

          <div className={`${styles.separacion} ${theme === "light" ? styles.separacionLight : styles.separacionDark}`}></div>

          {/* Visualizador de Correo */}
          <div>
            <h2 className={styles.nameTitle}>Correo</h2>
            <p className={styles.subtitle}>{user?.email}</p>
          </div>

          <div className={`${styles.separacion} ${theme === "light" ? styles.separacionLight : styles.separacionDark}`}></div>

          {/* Visualizador de Tipo de Usuario */}
          <div>
            <h2 className={styles.nameTitle}>Tipo de Usuario</h2>
            <p className={styles.subtitle}>
              {userData.type === 'personal' ? 'Personal' : 'Empresa'}
            </p>
          </div>

          <div className={`${styles.separacion} ${theme === "light" ? styles.separacionLight : styles.separacionDark}`}></div>

          <div>
            <h2 className={styles.nameTitle}>
              {userData.type === 'personal' ? 'ID de Usuario' : 'ID de Empresa'}
            </h2>
            <p className={styles.subtitle}>{user?.uid}</p>
          </div>

          <div className={`${styles.separacion} ${theme === "light" ? styles.separacionLight : styles.separacionDark}`}></div>

          <div className={styles.contenidoPrincipal}>
            <div>
              <h2 className={styles.nameTitle}>R.U.C/C.I</h2>
              <p className={styles.subtitle}>{userData.rucCI || ''}</p>
            </div>
          </div>

          {/* Botones */}
          <div className={styles.buttonGroup}>

            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              <Edit className={styles.icon} />
              Editar Perfil
            </Button>

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