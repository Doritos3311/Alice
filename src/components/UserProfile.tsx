
//my-next-app\src\components\UserProfile.tsx

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Copy, Edit } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"


interface UserProfileProps {
  user: User;
  onUpdateUserType: (newType: 'personal' | 'empresa') => void;
}

interface UserData {
  displayName: string;
  type: 'personal' | 'empresa';
  companyName?: string;
}

const db = getFirestore();

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUserType  }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    displayName: user.displayName || '',
    type: 'personal',
    companyName: '',
  });

  const { theme } = useTheme()

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, `users/${user.uid}/Usuario`, 'datos'));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
      }
    };
    fetchUserData();
  }, [user.uid]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...userData,
        companyName: userData.type === 'empresa' ? userData.companyName : null
      };
      await setDoc(doc(db, `users/${user.uid}/Usuario`, 'datos'), dataToSave);
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
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="flex flex-col items-center p-6">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user.photoURL || undefined} alt={userData.displayName || "Usuario"} />
          <AvatarFallback>{userData.displayName ? userData.displayName[0].toUpperCase() : "U"}</AvatarFallback>
        </Avatar>
        {userData.type === 'empresa' ? (
          <h2 className="text-2xl font-bold mb-2">{userData.companyName}</h2>
        ) : (
          <h2 className="text-2xl font-bold mb-2">{userData.displayName}</h2>
        )}
        <p className="text-sm text-gray-500 mb-4">{user.email}</p>
        <p className="text-sm text-gray-500 mb-4">
          Tipo: {userData.type === 'personal' ? 'Personal' : 'Empresa'}
        </p>
        <div className={`p-2 rounded-md mb-4 w-full text-center ${theme === "dark" ? "bg-[rgb(30,30,30)] text-[rgb(200,200,200)]" : "bg-[rgb(240,240,240)] text-[rgb(20,20,20)]"}`}>
          <p className="text-xs text-gray-500 mb-1">
            {userData.type === 'personal' ? 'ID de Usuario' : 'ID de Empresa'}
          </p>
          <p className="text-sm font-mono break-all">{user.uid}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
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
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
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
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserProfile;

