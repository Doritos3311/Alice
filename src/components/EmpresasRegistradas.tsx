import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Database, Trash2, User } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTheme } from "next-themes"

type EmpresaRegistrada = {
  id: string;
  nombre: string;
  tipo: string;
};

type UserInfo = {
  id: string;
  nombre: string;
  tipo: 'usuario';
};

type EmpresasRegistradasProps = {
  userId: string;
  onCargarEmpresa: (empresaId: string) => void;
};

export function EmpresasRegistradas({ userId, onCargarEmpresa }: EmpresasRegistradasProps) {
  const [empresasRegistradas, setEmpresasRegistradas] = useState<EmpresaRegistrada[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaRegistrada | UserInfo | null>(null);
  const db = getFirestore();

  const { theme } = useTheme()
  
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

  const handleEliminarEmpresa = async (empresaId: string) => {
    try {
      const empresaAEliminar = empresasRegistradas.find(empresa => empresa.id === empresaId);
      if (empresaAEliminar) {
        await updateDoc(doc(db, `users/${userId}/Usuario/EmpresasCargadas`), {
          empresas: arrayRemove(empresaAEliminar)
        });
        toast({
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

  const handleOpenModal = (empresa: EmpresaRegistrada | UserInfo) => {
    setSelectedEmpresa(empresa);
    setIsModalOpen(true);
  };
 
  const handleConfirmCargarEmpresa = () => {
    if (selectedEmpresa) {
      onCargarEmpresa(selectedEmpresa.id);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userInfo && (
          <Card key={userInfo.id} className="p-4">
            <CardContent className="flex justify-between items-center">
              <div className="flex items-center mt-4">
                <User className="h-5 w-5 mr-2" />
                <div>
                  <p className="font-medium">{userInfo.nombre} (Tu)</p>
                  <p className="text-sm text-gray-500">ID: {userInfo.id.substring(0, 8)}...</p>
                </div>
              </div>
              <div className='mt-5'>
                <Button variant="outline" size="sm" onClick={() => handleOpenModal(userInfo)} className="mr-2">
                  <Database className="h-4 w-4 mr-2" />
                  Cargar datos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {empresasRegistradas.map((empresa) => (
          <Card key={empresa.id} className="p-4">
            <CardContent className="flex justify-between items-center">
              <div className="flex items-center mt-4">
                <Building className="h-5 w-5 mr-2" />
                <div>
                  <p className="font-medium">{empresa.nombre}</p>
                  <p className="text-sm text-gray-500">ID: {empresa.id.substring(0, 8)}...</p>
                </div>
              </div>
              <div className='mt-5'>
                <Button variant="outline" size="sm" onClick={() => handleOpenModal(empresa)} className="mr-2">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Confirmar carga de datos</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Quieres continuar con la carga de datos de {selectedEmpresa?.tipo === 'usuario' ? 'tu usuario' : 'la empresa'}?</p>
            {selectedEmpresa && (
              <Card className="mt-4 p-3">
                <CardContent>
                  <div className="flex items-center">
                    {selectedEmpresa.tipo === 'usuario' ? (
                      <User className="h-5 w-5 mr-2" />
                    ) : (
                      <Building className="h-5 w-5 mr-2" />
                    )}
                    <div className='mt-5'>
                      <p className="font-medium">{selectedEmpresa.nombre}{selectedEmpresa.tipo === 'usuario' ? ' (Tu)' : ''}</p>
                      <div className={`p-2 rounded-md mb-4 w-full text-center ${theme === "dark" ? "bg-[rgb(30,30,30)] text-[rgb(200,200,200)]" : "bg-[rgb(240,240,240)] text-[rgb(20,20,20)]"}`}>
                        <p className="text-sm text-gray-500">ID: {selectedEmpresa.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmCargarEmpresa}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

