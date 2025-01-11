import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2 } from 'lucide-react';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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

interface Permisos {
  permisoLibroDiario: boolean;
  permisoInventario: boolean;
  permisoFacturacion: boolean;
}

const db = getFirestore();

const UsuariosRegistrados: React.FC<UserProfileProps> = ({ user }) => {
  const [userData, setUserData] = useState<UserData>({
    displayName: user.displayName || '',
    type: 'personal',
  });
  const [loggedUsers, setLoggedUsers] = useState<LoggedUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LoggedUser | null>(null);
  const [permisos, setPermisos] = useState<Permisos>({
    permisoLibroDiario: false,
    permisoInventario: false,
    permisoFacturacion: false,
  });

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
      await updateDoc(doc(db, `users/${userToDelete.uid}/Usuario`, 'permisos'), {
        [user.uid]: { permiso1: false }
      });

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

  const handleOpenModal = async (userToEdit: LoggedUser) => {
    setSelectedUser(userToEdit);
    setIsModalOpen(true);

    // Cargar permisos actuales
    const permisosDoc = await getDoc(doc(db, `users/${userToEdit.uid}/Usuario`, 'permisos'));
    if (permisosDoc.exists()) {
      const permisosData = permisosDoc.data()[user.uid] as Permisos;
      setPermisos(permisosData || {
        permisoLibroDiario: false,
        permisoInventario: false,
        permisoFacturacion: false,
      });
    }
  };

  const handlePermissionChange = (permission: keyof Permisos) => {
    setPermisos(prev => ({ ...prev, [permission]: !prev[permission] }));
  };

  const handleSavePermissions = async () => {
    if (selectedUser) {
      try {
        await setDoc(doc(db, `users/${selectedUser.uid}/Usuario`, 'permisos'), {
          [user.uid]: permisos
        }, { merge: true });

        toast({
          title: "Éxito",
          description: "Permisos actualizados correctamente.",
        });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error al actualizar permisos:", error);
        toast({
          title: "Error",
          description: "Hubo un problema al actualizar los permisos. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
      }
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
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleOpenModal(loggedUser)}>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Permisos de Usuario</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">Otorgar permisos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="libro-diario">Libro Diario</Label>
                <Switch
                  id="libro-diario"
                  checked={permisos.permisoLibroDiario}
                  onCheckedChange={() => handlePermissionChange('permisoLibroDiario')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inventario">Inventario</Label>
                <Switch
                  id="inventario"
                  checked={permisos.permisoInventario}
                  onCheckedChange={() => handlePermissionChange('permisoInventario')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="facturacion">Facturación</Label>
                <Switch
                  id="facturacion"
                  checked={permisos.permisoFacturacion}
                  onCheckedChange={() => handlePermissionChange('permisoFacturacion')}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePermissions}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsuariosRegistrados;

