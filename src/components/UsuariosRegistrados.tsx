import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2 } from 'lucide-react';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";
import { toast } from "@/hooks/use-toast"

interface UserProfileProps {
  user: User;
}

interface UserData {
  displayName: string;
  type: 'personal' | 'empresa';
  companyName?: string;
  loggedUsers?: LoggedUser[];
}

interface LoggedUser {
  name: string;
  type: 'personal' | 'empresa';
  uid: string;
}

const db = getFirestore();

const UsuariosRegistrados: React.FC<UserProfileProps> = ({ user }) => {
  const [userData, setUserData] = useState<UserData>({
    displayName: user.displayName || '',
    type: 'personal',
  });
  const [loggedUsers, setLoggedUsers] = useState<LoggedUser[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, `users/${user.uid}/Usuario`, 'datos'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserData;
        setUserData(data);
        setLoggedUsers(data.loggedUsers || []);
      }
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleDeleteUser = async (userToDelete: LoggedUser) => {
    try {
      // Actualizar el permiso del usuario a false
      await updateDoc(doc(db, `users/${userToDelete.uid}/Usuario`, 'permisos'), {
        [user.uid]: { permiso1: false }
      });

      // Eliminar el usuario de la lista de usuarios registrados
      await updateDoc(doc(db, `users/${user.uid}/Usuario`, 'datos'), {
        loggedUsers: arrayRemove(userToDelete)
      });

      toast({
        title: "Éxito",
        description: "Usuario eliminado del grupo correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el usuario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loggedUsers.map((loggedUser, index) => (
            <Card key={index} className="p-4">
                <div className="flex justify-between items-center">
                <div>
                    <p className="font-medium">{loggedUser.name}</p>
                    <p className="text-sm text-gray-500">{loggedUser.type === 'personal' ? 'Personal' : 'Empresa'}</p>
                </div>
                <div>
                    <Button variant="outline" size="sm" className="mr-2">
                    <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(loggedUser)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                </div>
            </Card>
            ))}
        </div>
    </div>
  );
};

export default UsuariosRegistrados;

