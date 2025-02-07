import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, deleteField, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/hooks/use-toast"
import { X, Building } from 'lucide-react'
import { useTheme } from 'next-themes';

interface SolicitudIngresoProps {
  userId: string;
}

interface SolicitudPendiente {
  nombreEmpresa: string;
  permiso1: boolean;
}

const SolicitudIngreso: React.FC<SolicitudIngresoProps> = ({ userId }) => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<{[key: string]: SolicitudPendiente}>({});
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, `users/${userId}/Usuario`, 'permisos'), (doc) => {
      if (doc.exists()) {
        setSolicitudesPendientes(doc.data() as {[key: string]: SolicitudPendiente});
      }
    });

    return () => unsubscribe();
  }, [userId, db]);

  const cancelarSolicitud = async (id: string) => {
    try {
      // Eliminar solicitud de los permisos del usuario
      await updateDoc(doc(db, `users/${userId}/Usuario`, 'permisos'), {
        [id]: deleteField()
      });

      // Eliminar solicitud de la empresa
      await updateDoc(doc(db, `users/${id}/Usuario`, 'solicitudes'), {
        [userId]: deleteField()
      });

      toast({
        title: "Éxito",
        description: "Solicitud cancelada correctamente.",
      });
    } catch (error) {
      console.error("Error al cancelar solicitud:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cancelar la solicitud. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Estado para Modo Nocturno
  const { theme } = useTheme()

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-2 mt-10">Solicitudes de Ingreso Pendientes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(solicitudesPendientes).map(([id, solicitud]) => (
          solicitud.permiso1 === false && (
            <Card key={id} className={`p-2 ${theme === "dark" ? "bg-[rgb(30,30,30)] text-gray-300" : "bg-white text-gray-900"}`}>
              <CardContent className="flex justify-between items-center p-4">
                <div className="flex items-center">
                  <Building className="h-7 w-7 mr-2 mr-5" />
                  <div>
                    <p className="font-medium">{solicitud.nombreEmpresa}</p>
                    <p className="text-sm text-gray-500">ID: {id.substring(0, 8)}...</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => cancelarSolicitud(id)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          )
        ))}
      </div>
    </div>
  );
};

export default SolicitudIngreso;

