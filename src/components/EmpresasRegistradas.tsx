import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  const db = getFirestore();

  useEffect(() => {
    const cargarEmpresasRegistradas = async () => {
      try {
        const userDoc = await getDoc(doc(db, `users/${userId}`));
        const userData = userDoc.data();

        if (userData && userData.registros) {
          const empresasPromises = userData.registros.map(async (id: string) => {
            const empresaDoc = await getDoc(doc(db, `users/${id}/Usuario`, 'datos'));
            const empresaData = empresaDoc.data();
            return { id, nombre: empresaData?.companyName || 'Empresa sin nombre' };
          });

          const empresas = await Promise.all(empresasPromises);
          setEmpresasRegistradas(empresas);
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

    cargarEmpresasRegistradas();
  }, [userId, db]);

  return (
    <div className="mt-8 w-full">
      <h3 className="text-lg font-semibold mb-4">Empresas Registradas</h3>
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

