import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building, Database } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

type EmpresaRegistrada = {
  id: string;
  nombre: string;
};

type EmpresasRegistradasProps = {
  userId: string;
  onCargarEmpresa: (empresaId: string) => void;
};

export function EmpresasRegistradas({ userId, onCargarEmpresa }: EmpresasRegistradasProps) {
  const [empresasRegistradas, setEmpresasRegistradas] = useState<EmpresaRegistrada[]>([]);
  const [nuevoEmpresaId, setNuevoEmpresaId] = useState('');
  const db = getFirestore();

  useEffect(() => {
    cargarEmpresasRegistradas();
  }, [userId]);

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

  const registrarNuevaEmpresa = async () => {
    if (!nuevoEmpresaId) {
      toast({
        title: "Error",
        description: "Por favor, ingrese un ID de empresa válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const empresaDoc = await getDoc(doc(db, `users/${nuevoEmpresaId}/Usuario/datos`));
      if (!empresaDoc.exists()) {
        toast({
          title: "Error",
          description: "La empresa no existe o no tiene permisos para acceder.",
          variant: "destructive",
        });
        return;
      }

      const empresaData = empresaDoc.data();
      const nuevaEmpresa = {
        id: nuevoEmpresaId,
        nombre: empresaData.companyName || 'Empresa sin nombre'
      };

      await updateDoc(doc(db, `users/${userId}/Usuario/EmpresasCargadas`), {
        empresas: arrayUnion(nuevaEmpresa)
      });

      setEmpresasRegistradas([...empresasRegistradas, nuevaEmpresa]);
      setNuevoEmpresaId('');

      toast({
        title: "Éxito",
        description: "Empresa registrada correctamente.",
      });
    } catch (error) {
      console.error("Error al registrar nueva empresa:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al registrar la empresa. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 w-full">
      <div className="mb-4 flex items-center space-x-2">
        <Input
          placeholder="ID de la empresa"
          value={nuevoEmpresaId}
          onChange={(e) => setNuevoEmpresaId(e.target.value)}
        />
        <Button onClick={registrarNuevaEmpresa}>Registrar Empresa</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empresasRegistradas.map((empresa) => (
          <Card key={empresa.id} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                <p className="font-medium">{empresa.nombre}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onCargarEmpresa(empresa.id)}>
                <Database className="h-4 w-4 mr-2" />
                Cargar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
