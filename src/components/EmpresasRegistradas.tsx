
{/* Importacion de Librerias */}

import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Database, Trash2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

{/* Declaracion de Tipados */}

// Tipos Propiedades Empresas Registradas
type EmpresaRegistrada = {
  id: string;
  nombre: string;
  tipo: string;
};

// Tipos Propiedades Empresas
type EmpresasRegistradasProps = {
  userId: string;
  onCargarEmpresa: (empresaId: string) => void;
};

export function EmpresasRegistradas({ userId, onCargarEmpresa }: EmpresasRegistradasProps) {
  {/* Declaracion de Funciones */}
  const [empresasRegistradas, setEmpresasRegistradas] = useState<EmpresaRegistrada[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaRegistrada | null>(null);
  const db = getFirestore();

  useEffect(() => {
    cargarEmpresasRegistradas();
  }, [userId]);

  {/* Metodos Botones */}

  // Funcion Cargar Empresa
  const cargarEmpresasRegistradas = async () => {
    try {
      const userDoc = await getDoc(doc(db, `users/${userId}/Usuario/EmpresasCargadas`));
      if (userDoc.exists()) {
        setEmpresasRegistradas(userDoc.data().empresas || []);
      }
    } catch (error) {
      console.error("Error al cargar empresas registradas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las empresas registradas.",
        variant: "destructive",
      });
    }
  };

  // Funcion Elminar Empresa
  const handleEliminarEmpresa = async (empresaId: string) => {
    try {
      const empresaAEliminar = empresasRegistradas.find(empresa => empresa.id === empresaId);
      if (empresaAEliminar) {
        await updateDoc(doc(db, `users/${userId}/Usuario/EmpresasCargadas`), {
          empresas: arrayRemove(empresaAEliminar)
        });
        setEmpresasRegistradas(empresasRegistradas.filter(empresa => empresa.id !== empresaId));
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

  // Funcion abrir modal confirmacion
  const handleOpenModal = (empresa: EmpresaRegistrada) => {
    setSelectedEmpresa(empresa);
    setIsModalOpen(true);
  };
 
  {/* Metodo Funcionalidad */}

  // Funcion Confirmar Cargar Empresa
  const handleConfirmCargarEmpresa = () => {
    if (selectedEmpresa) {
      onCargarEmpresa(selectedEmpresa.id);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {/* Contenido Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Modal de Confirmacion de Carga */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar carga de datos</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Quieres continuar con la carga de datos de la empresa?</p>
            {selectedEmpresa && (
              <Card className="mt-4 p-4">
                <CardContent>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">{selectedEmpresa.nombre}</p>
                      <p className="text-sm text-gray-500">ID: {selectedEmpresa.id.substring(0, 8)}...</p>
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

