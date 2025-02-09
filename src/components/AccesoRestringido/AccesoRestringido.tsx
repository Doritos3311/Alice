import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"

import stylesAccesoRes from "@/components/AccesoRestringido/AccesoR.module.css"

interface AccesoRestringidoProps {
  tienePermiso: boolean;
  children: React.ReactNode;
}

const AccesoRestringido: React.FC<AccesoRestringidoProps> = ({ tienePermiso, children }) => {
  if (tienePermiso) {
    return <>{children}</>;
  }

  return (
    <div className={stylesAccesoRes.flexCenter}>
    <Card className={stylesAccesoRes.cardWidth}>
      <CardContent className={stylesAccesoRes.cardContent}>
        <AlertCircle className={stylesAccesoRes.alertIcon} />
        <h2 className={stylesAccesoRes.title}>Acceso Restringido</h2>
        <p className={stylesAccesoRes.text}>
          Lo sentimos, no tienes permiso para acceder a esta sección.
          Por favor, contacta al administrador si crees que esto es un error.
        </p>
      </CardContent>
    </Card>
  </div>
  );
};

export default AccesoRestringido;

