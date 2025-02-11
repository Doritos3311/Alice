
{/* Ruta */}
//my-next-app\src\components\SolicitudPendiente.tsx

{/* Importacion de Librerias */}
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, deleteField, setDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/hooks/use-toast"
import { Check, User, X } from 'lucide-react'
import { Dialog } from '@radix-ui/react-dialog';
import { useTheme } from 'next-themes';

import styleSoliPen from "@/components/SolicitudPendiente/SolicitudPendiente.module.css"

{/* Definicion de Tipos de Datos */}

// Definicion de Solicitud Recibida 
interface SolicitudPendienteProps {
  userId: string;
}

// Definicion de infomacion dentro de Solicitud Recibida
interface SolicitudUsuario {
  nombre: string;
  estado: string;
}

const SolicitudPendiente: React.FC<SolicitudPendienteProps> = ({ userId }) => {
  
  {/* Declaracion de Estados */}
  
  // Estado de Solicitudes Pendientes por aceptar
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<{[key: string]: SolicitudUsuario}>({});
  
  // Estado Informacion Base de Datos
  const db = getFirestore();

  {/* Funciones */}

  // Efecto para extraer en tiempo real las solicitudes
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, `users/${userId}/Usuario`, 'solicitudes'), (doc) => {
      if (doc.exists()) {
        setSolicitudesPendientes(doc.data() as {[key: string]: SolicitudUsuario});
      }
    });

    return () => unsubscribe();
  }, [userId, db]);

  // Funcion para Cargar Datos de Usuario
  const saveUserData = async (usuarioId: string, userData: SolicitudUsuario) => {
    await setDoc(doc(db, `users/${usuarioId}/Usuario/datos`), {
      nombre: userData.nombre,
      estado: 'activo',
      fechaIngreso: new Date().toISOString()
    }, { merge: true });
  };

  //Funcion para Analizar la solicitud
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

        //Guardar la data del usuario
        await saveUserData(usuarioId, solicitudesPendientes[usuarioId]);

        // Obtener el nombre de la empresa
        const empresaDocRef = doc(db, `users/${userId}/Usuario`, 'datos');
        const unsubscribeEmpresa = onSnapshot(empresaDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const empresaData = docSnapshot.data();
            const nombreEmpresa = empresaData?.companyName || 'Empresa sin nombre';

            // Agregar a EmpresasCargadas del usuario
            setDoc(doc(db, `users/${usuarioId}/Usuario/EmpresasCargadas`), {
              empresas: arrayUnion({
                id: userId,
                nombre: nombreEmpresa,
                tipo: 'empresa'
              })
            }, { merge: true });

            // Agregar a loggedUsers de la empresa
            updateDoc(doc(db, `users/${userId}/Usuario`, 'datos'), {
              loggedUsers: arrayUnion({
                name: solicitudesPendientes[usuarioId].nombre,
                type: 'personal',
                uid: usuarioId
              })
            });
          }
        });

        // Limpiar el listener después de un corto tiempo
        setTimeout(() => {
          unsubscribeEmpresa();
        }, 5000); // 5 segundos, ajusta según sea necesario

      } else {
        // Eliminar los permisos asociados a esta solicitud
        await updateDoc(doc(db, `users/${usuarioId}/Usuario`, 'permisos'), {
          [userId]: deleteField()
        });

        // Eliminar completamente la solicitud de la empresa
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

  // Estado para Modo Nocturno
  const { theme } = useTheme()

  return (
    // Visualizador
    <div className={styleSoliPen.container}>
    {/* Titulo */}
    <h3 className={styleSoliPen.title}>Solicitudes Pendientes de Ingreso</h3>
        
        {/* Contenido Principal */}
         <div className={styleSoliPen.grid}>

          {/* Mapeado de las Solicitudes de Usuarios */}
            {Object.entries(solicitudesPendientes).map(([usuarioId, solicitud]) => (
              solicitud.estado === 'pendiente' && (

               // Listado de Solicitudes de Usuario
                <Card key={usuarioId} className={`${styleSoliPen.card} ${theme === "dark" ? styleSoliPen.cardDark : styleSoliPen.cardLight}`}>
                <CardContent className={styleSoliPen.cardContent}>

                  {/* Nombre de Usuario */}
                  <div className={styleSoliPen.cardInfo}>
                    <User className={styleSoliPen.icon} />
                    <div>
                      <span>{solicitud.nombre}</span>
                        <p className={styleSoliPen.companyId}>ID: {usuarioId.substring(0, 8)}...</p>
                      </div>
                  </div>

                  {/* Botones */}
                  <div className={styleSoliPen.buttonsContainer}>
                  <Button className={styleSoliPen.acceptButton} size="sm" onClick={() => handleSolicitud(usuarioId, true)}>
                      <Check className={styleSoliPen.iconUse} />
                      </Button>
                      <Button variant="destructive" className={`${styleSoliPen.rejectButton} ${styleSoliPen.buttonDestructive}`} size="sm" onClick={() => handleSolicitud(usuarioId, false)}>
                      <X className={styleSoliPen.iconUse} />
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

