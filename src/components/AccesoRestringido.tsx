import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"

interface AccesoRestringidoProps {
  tienePermiso: boolean;
  children: React.ReactNode;
}

const AccesoRestringido: React.FC<AccesoRestringidoProps> = ({ tienePermiso, children }) => {
  if (tienePermiso) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-6">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
          <p className="text-center text-gray-600">
            Lo sentimos, no tienes permiso para acceder a esta sección.
            Por favor, contacta al administrador si crees que esto es un error.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccesoRestringido;

