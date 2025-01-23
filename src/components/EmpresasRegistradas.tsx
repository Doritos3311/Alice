
{/* Ruta */}
//my-next-app\src\components\EmpresasRegistradas.tsx

{/* Importacion de Librerias */}
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot, deleteField, getDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Database, Trash2, User } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTheme } from "next-themes"


{/* Definicion de Tipos de Datos */}

// Definicion Empresas por Cargar
type EmpresaRegistrada = {
  id: string;
  nombre: string;
  tipo: string;
};

// Definicion de informacion Usuario
type UserInfo = {
  id: string;
  nombre: string;
  tipo: 'usuario';
};

// Definicion de Empresas Registradas
type EmpresasRegistradasProps = {
  userId: string;
  onCargarEmpresa: (empresaId: string) => void;
};

export function EmpresasRegistradas({ userId, onCargarEmpresa }: EmpresasRegistradasProps) {
  
  {/* Declaracion de Estados */}
  
  // Estado de Data Empresas por Cargar
  const [empresasRegistradas, setEmpresasRegistradas] = useState<EmpresaRegistrada[]>([]);
  
  // Estado de Informacion del Usuario 
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Estado de modales
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado de empresa seleccionada
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaRegistrada | UserInfo | null>(null);
  
  // Estado Informacion Base de Datos
  const db = getFirestore();

  // Estado para Modo Nocturno
  const { theme } = useTheme()

  {/* Funciones */}
  
  // Efecto para cargar en tiempo real las empresas registradas
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, `users/${userId}/Usuario/EmpresasCargadas`), (doc) => {
      if (doc.exists()) {
        setEmpresasRegistradas(doc.data().empresas || []);
      }
    });

    // Obtener información del usuario
    const userUnsubscribe = onSnapshot(doc(db, `users/${userId}/Usuario/datos`), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUserInfo({
          id: userId,
          nombre: userData.displayName || 'Usuario',
          tipo: 'usuario'
        });
      }
    });

    return () => {
      unsubscribe();
      userUnsubscribe();
    };
  }, [userId, db]);

  
  {/* Botones */}

  // Funcion para Eliminar Empresa
  const handleEliminarEmpresa = async (empresaId: string) => {
    try {
      const empresaAEliminar = empresasRegistradas.find(empresa => empresa.id === empresaId);
      if (empresaAEliminar) {
        // Eliminar la empresa de la lista de empresas registradas
        await updateDoc(doc(db, `users/${userId}/Usuario/EmpresasCargadas`), {
          empresas: arrayRemove(empresaAEliminar)//Busca el id en base a la empresa y ejecuta empresaAEliminar
        });

        // Eliminar los permisos asociados a esta empresa
        await updateDoc(doc(db, `users/${userId}/Usuario`, 'permisos'), {
          [empresaId]: deleteField()//Busca el id en base a la empresa y borra todo el documento
        });

        // Eliminar solicitud de los permisos del usuario
        await updateDoc(doc(db, `users/${userId}/Usuario`, 'permisos'), {
          [userId]: deleteField()
        });
  
        // Eliminar solicitud de la empresa
        await updateDoc(doc(db, `users/${userId}/Usuario`, 'solicitudes'), {
          [userId]: deleteField()
        });

        toast({// Mensaje de error detallado para consola 
          title: "Éxito",
          description: "Empresa eliminada correctamente.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar la empresa. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Funcion para Abrir el Modal
  const handleOpenModal = (empresa: EmpresaRegistrada | UserInfo) => {
    setSelectedEmpresa(empresa);
    setIsModalOpen(true);
  };
 
  //Funcion para Cargar Empresa
  const handleConfirmCargarEmpresa = () => {
    if (selectedEmpresa) {//Busca el nombre de la empresa
      onCargarEmpresa(selectedEmpresa.id);// Busca el Id con el nombre de la empresa
      setIsModalOpen(false);//Cierra el modal
    }
  };

  return (
    <>
      {/* Visualizador */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recuadro de Visualizacion de Usuario */}
        {userInfo && (
          <Card key={userInfo.id} className={`p-4 ${theme === "dark" ? "bg-[rgb(30,30,30)] text-gray-300" : "bg-white text-gray-900"}`}>

            {/* Listado de Empresas */}
            <CardContent className="flex justify-between items-center">

              {/* Informacion de Empresas */}
              <div className="flex items-center mt-4">
                <User className="h-7 w-7 mr-2 mr-5" />
                <div>
                  <p className="font-medium">{userInfo.nombre} (Tu)</p>
                  <p className="text-sm text-gray-500">ID: {userInfo.id.substring(0, 8)}...</p>
                </div>
              </div>

              {/* Botones */}
              <div className='mt-5'>
                <Button size="sm" onClick={() => handleOpenModal(userInfo)} className="mr-2">
                  <Database className="h-4 w-4 mr-2" />
                  Cargar datos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recuadro de las empresas registradas */}
        {empresasRegistradas.map((empresa) => (
          <Card key={empresa.id} className={`p-4 ${theme === "dark" ? "bg-[rgb(30,30,30)] text-gray-300" : "bg-white text-gray-900"}`}>

            {/* Listado de Empresas */}
            <CardContent className="flex justify-between items-center">

              {/* Informacion de Empresas */}
              <div className="flex items-center mt-4">
                <Building className="h-5 w-5 mr-2" />

                
                <div>
                  <p className="font-medium">{empresa.nombre}</p>
                  <p className="text-xs text-gray-500 mb-1">ID: {empresa.id.substring(0, 8)}...</p>
                </div>
              </div>

              {/* Botones */}
              <div className='mt-5'>
                <Button size="sm" onClick={() => handleOpenModal(empresa)} className="mr-2">
                  <Database className="h-4 w-4 mr-2" />
                  Cargar datos
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleEliminarEmpresa(empresa.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent aria-describedby={undefined}>

          {/* Cabecera */}
          <DialogHeader>
            <DialogTitle>Confirmar carga de datos</DialogTitle>
          </DialogHeader>

          {/* Contenido */}
          <div className="py-4">
            <p>¿Quieres continuar con la carga de datos de {selectedEmpresa?.tipo === 'usuario' ? 'tu usuario' : 'la empresa'}?</p>
            {selectedEmpresa && (
              <Card className={`mt-5 ${theme === "dark" ? "bg-[rgb(30,30,30)] text-gray-300" : "bg-white text-gray-900"}`}>
                <CardContent>
                  <div className="flex items-center mt-4">
                    {selectedEmpresa.tipo === 'usuario' ? (
                      <User className="h-7 w-7 mr-2 mr-5" />
                    ) : (
                      <Building className="h-7 w-7 mr-2 mr-5" />
                    )}
                    <div>
                      <p className="font-medium">{selectedEmpresa.nombre}{selectedEmpresa.tipo === 'usuario' ? ' (Tu)' : ''}</p>
                      <div>
                        <p className="text-sm text-gray-500">ID: {selectedEmpresa.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contenido Inferior */}
          <DialogFooter>
            <Button variant="destructive" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmCargarEmpresa}>Aceptar</Button>
          </DialogFooter>
          
        </DialogContent>
      </Dialog>
    </>
  );
}

