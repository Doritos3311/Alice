import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, deleteField, setDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Check, X } from 'lucide-react'

interface SolicitudPendienteProps {
  userId: string;
}

interface SolicitudUsuario {
  nombre: string;
  estado: string;
}

const SolicitudPendiente: React.FC<SolicitudPendienteProps> = ({ userId }) => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<{[key: string]: SolicitudUsuario}>({});
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, `users/${userId}/Usuario`, 'solicitudes'), (doc) => {
      if (doc.exists()) {
        setSolicitudesPendientes(doc.data() as {[key: string]: SolicitudUsuario});
      }
    });

    return () => unsubscribe();
  }, [userId, db]);

  const handleSolicitud = async (usuarioId: string, aceptar: boolean) => {
    try {
      // Actualizar el permiso del usuario
      await updateDoc(doc(db, `users/${usuarioId}/Usuario`, 'permisos'), {
        [userId]: { permiso1: aceptar }
      });

      // Actualizar o eliminar la solicitud de la empresa
      if (aceptar) {
        await updateDoc(doc(db, `users/${userId}/Usuario`, 'solicitudes'), {
          [usuarioId]: { ...solicitudesPendientes[usuarioId], estado: 'aceptado' }
        });

        // Obtener el nombre de la empresa
        const empresaDocRef = doc(db, `users/${userId}/Usuario`, 'datos');
        const unsubscribeEmpresa = onSnapshot(empresaDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const empresaData = docSnapshot.data();
            const nombreEmpresa = empresaData?.companyName || 'Empresa sin nombre';

            // Agregar a EmpresasCargadas
            setDoc(doc(db, `users/${usuarioId}/Usuario/EmpresasCargadas`), {
              empresas: arrayUnion({
                id: userId,
                nombre: nombreEmpresa,
                tipo: 'empresa'
              })
            }, { merge: true });
          }
        });

        // Limpiar el listener después de un corto tiempo
        setTimeout(() => {
          unsubscribeEmpresa();
        }, 5000); // 5 segundos, ajusta según sea necesario

      } else {
        await updateDoc(doc(db, `users/${userId}/Usuario`, 'solicitudes'), {
          [usuarioId]: deleteField()
        });
      }

      toast({
        title: "Éxito",
        description: aceptar ? "Solicitud aceptada correctamente." : "Solicitud denegada correctamente.",
      });
    } catch (error) {
      console.error("Error al procesar solicitud:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar la solicitud. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mt-10">Solicitudes Pendientes de Ingreso</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(solicitudesPendientes).map(([usuarioId, solicitud]) => (
          solicitud.estado === 'pendiente' && (
            <Card key={usuarioId}>
              <CardContent className="flex justify-between items-center p-4">
                <span>{solicitud.nombre}</span>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleSolicitud(usuarioId, true)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSolicitud(usuarioId, false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>
    </div>
  );
};

export default SolicitudPendiente;

