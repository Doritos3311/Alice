
{/* Ruta */}
//my-next-app\src\components\UsuariosRegistrados.tsx

{/* Importacion de Librerias */}
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, CircleUserRound, Edit, Trash2 } from 'lucide-react';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot, setDoc, getDoc, deleteField } from "firebase/firestore";
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/react-scroll-area"
import { useTheme } from "next-themes"

{/* Definicion de Tipos de Datos */}

// Definicion de Usuario
interface UserProfileProps {
  user: User;
}

// Definicion de Informacion de Usuario
interface UserInfo {
  id: string;
  nombre: string;
  tipo: 'usuario';
}

// Definicion de Usuario Registrado
interface LoggedUser {
  name: string;
  type: 'personal' | 'empresa';
  uid: string;
  id: string;
}

// Definicion de Permisos
interface Permisos {
  permisoLibroDiario: boolean;
  permisoServicios: boolean;
  permisoInventario: boolean;
  permisoFacturacion: boolean;
  permisoDashboard: boolean;
  permisoGenerarRegistros: boolean;
}

const permisosOrder = [
  "permisoAcceso",
  "permisoServicios",
  "permisoInventario",
  "permisoFacturacion",
  "permisoLibroDiario",
  "permisoDashboard",
  "permisoGenerarRegistros",
]

const permisosLabels: Record<string, string> = {
  permisoAcceso: "Acceso",
  permisoServicios: "Servicio",
  permisoInventario: "Inventario",
  permisoFacturacion: "Facturación",
  permisoLibroDiario: "Libro Diario",
  permisoDashboard: "Dashboard",
  permisoGenerarRegistros: "Generar Registros",
}

const UsuariosRegistrados: React.FC<UserProfileProps> = ({ user }) => {

  {/* Declaracion de Estados */}

  // Estado de Usuarios Registrados
  const [loggedUsers, setLoggedUsers] = useState<LoggedUser[]>([]);

  // Estado de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado de UsuarioSeleccionado
  const [selectedUser, setSelectedUser] = useState<LoggedUser | UserInfo | null>(null);
  
  // Estado de declaracion de Permisos
  const [permisos, setPermisos] = useState<Permisos>({
    permisoLibroDiario: false,
    permisoServicios: false,
    permisoInventario: false,
    permisoFacturacion: false,
    permisoDashboard: false,
    permisoGenerarRegistros: false,
  });

  // Estado de informacion de Usuario
  const [userData, setUserData] = useState<UserInfo>({
    id: user.uid,
    nombre: user.displayName || 'Usuario',
    tipo: 'usuario'
  });

  // Estado Informacion Base de Datos
  const db = getFirestore();

  // Estado para Modo Nocturno
  const { theme } = useTheme()

  {/* Funciones */}

  // Efecto para extraer en tiempo real los datos del usuario
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, `users/${user.uid}/Usuario`, 'datos'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData({
          id: user.uid,
          nombre: data.displayName || 'Usuario',
          tipo: 'usuario'
        });
        setLoggedUsers(data.loggedUsers || []);
      }
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Funcion para borrar el usuario
  const handleDeleteUser = async (userToDelete: LoggedUser) => {
    try {
      
      // 1. Eliminar al usuario de la lista de usuarios registrados de la empresa
      await updateDoc(doc(db, `users/${user.uid}/Usuario`, 'datos'), {
        loggedUsers: arrayRemove(userToDelete)
      });

      // 2. Eliminar los permisos del usuario en la empresa
      await updateDoc(doc(db, `users/${user.uid}/Usuario`, 'permisos'), {
        [user.uid]: deleteField()
      });

      // 3. Eliminar la empresa de la lista de EmpresasCargadas del usuario personal
      const empresasCargadasRef = doc(db, `users/${userToDelete.uid}/Usuario/EmpresasCargadas`);
      const empresasCargadasDoc = await getDoc(empresasCargadasRef);
      if (empresasCargadasDoc.exists()) {
        const empresasCargadas = empresasCargadasDoc.data().empresas || [];
        const updatedEmpresas = empresasCargadas.filter((empresa: any) => empresa.id !== user.uid);
        await setDoc(empresasCargadasRef, { empresas: updatedEmpresas }, { merge: true });
      }

      // 4. Eliminar cualquier solicitud pendiente relacionada con este usuario
      await updateDoc(doc(db, `users/${user.uid}/Usuario`, 'solicitudes'), {
        [userToDelete.uid]: deleteField()
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

  // Funcion para abrir el modal
  const handleOpenModal = async (userToEdit: LoggedUser | UserInfo) => {
    setSelectedUser(userToEdit);
    setIsModalOpen(true);

    try {
      const userIdToEdit = "uid" in userToEdit ? userToEdit.uid : userToEdit.id
      const permisosDoc = await getDoc(doc(db, `users/${userIdToEdit}/Usuario`, "permisos"))
  
      if (permisosDoc.exists()) {
        const permisosData = permisosDoc.data()[user.uid] as Permisos
        if (userIdToEdit === user.uid) {
          // For the company owner, set all permissions to true
          setPermisos({
            permisoLibroDiario: true,
            permisoInventario: true,
            permisoFacturacion: true,
            permisoDashboard: true,
            permisoGenerarRegistros: true,
            permisoServicios: true,
          })
        } else {
          // For other users, use the stored permissions
          setPermisos(
            permisosData || {
              permisoLibroDiario: false,
              permisoInventario: false,
              permisoFacturacion: false,
              permisoDashboard: false,
              permisoGenerarRegistros: false,
              permisoServicios: false,
            },
          )
        }
      } else {
        // If no permissions document exists, set default permissions
        setPermisos({
          permisoLibroDiario: false,
          permisoInventario: false,
          permisoFacturacion: false,
          permisoDashboard: false,
          permisoGenerarRegistros: false,
          permisoServicios: false,
        })
      }
    } 
    catch (error) {
      console.error("Error al cargar permisos:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar los permisos. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Funcion para cambiar permisos
  const handlePermissionChange = (permission: keyof Permisos) => {
    setPermisos(prev => ({ ...prev, [permission]: !prev[permission] }));
  };

  // Funcion para guardar los permisos
  const handleSavePermissions = async () => {
    if (selectedUser) {
      try {
        const userIdToSave = 'uid' in selectedUser ? selectedUser.uid : selectedUser.id;
        await setDoc(doc(db, `users/${userIdToSave}/Usuario`, 'permisos'), {
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
    //Visualizador
    <div className="mt-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recuadro del usuario personal */}
        <Card key={userData.id} className={`p-4 ${theme === "dark" ? "bg-[rgb(30,30,30)] text-gray-300" : "bg-white text-gray-900"}`}>
          <CardContent className="flex justify-between items-center">
            <div className="flex items-center mt-4">
                <Building className="h-7 w-7 mr-7" />
              <div>
                <p className="font-medium">{userData.nombre} (Tu)</p>
                <p className="text-sm text-gray-500">ID: {userData.id.substring(0, 8)}...</p>
              </div>
            </div>
            <div className='mt-5'>
            </div>
          </CardContent>
        </Card>
        
        {/* Lista de los Usuarios Registrados */}
        {loggedUsers.map((loggedUser, index) => (
          <Card key={index} className={`p-4 ${theme === "dark" ? "bg-[rgb(30,30,30)] text-gray-300" : "bg-white text-gray-900"}`}>
            <CardContent className="flex justify-between items-center">
              <div className="flex items-center mt-4">
                <CircleUserRound className="h-7 w-7 mr-7" />
                <div>
                  <p className="font-medium">{loggedUser.name}</p>
                  <p className="text-sm text-gray-500">ID: {loggedUser.uid.substring(0, 8)}...</p>
                </div>
              </div>
              <div className='mt-5'>
                <Button size="sm" className="mr-2" onClick={() => handleOpenModal(loggedUser)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(loggedUser)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">

          {/* Cabecera */}
          <DialogHeader>
            <DialogTitle>Editar Permisos de Usuario</DialogTitle>
          </DialogHeader>

          {/* Contenido */}
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">Otorgar permisos</h3>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {permisosOrder.map((key) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key}>{permisosLabels[key]}</Label>
                    <Switch
                      id={key}
                      checked={permisos[key as keyof Permisos]}
                      onCheckedChange={() => handlePermissionChange(key as keyof Permisos)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Contenido Inferior */}
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

