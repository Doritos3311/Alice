import React, { useEffect, useState } from "react";
import styles from "@/components/Configuracion/ConfiguracionPage.module.css"

import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import UserProfile from "../UserProfile/UserProfile"; // Asegúrate de importar UserProfile

interface ConfiguracionPageProps {
  user: any;
  setShowLandingPage: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
}

const ConfiguracionPage: React.FC<ConfiguracionPageProps> = ({ user, setShowLandingPage, setActiveTab }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (theme == "dark" || theme == "light") {
      setTheme(theme)
    } else {
      setTheme("dark"); // Define el tema por defecto si no hay uno establecido
    }
  }, [theme, setTheme]);

  return (
    <div className={styles.contenedorPrincipal}>

      <h1 className="text-3xl font-bold mb-4">Mi Perfil</h1>
      {/* Aquí agregamos el componente UserProfile */}
      <div className="mt-5 mb-1">
        <UserProfile
          user={user}
          onUpdateUserType={(newType) => console.log(newType)}
          setShowLandingPage={setShowLandingPage}
          setActiveTab={setActiveTab}
        />
      </div>

      <h1 className="text-3xl font-bold mb-4">Configuración</h1>
      <div className="flex items-center space-x-2">
        <Switch
          id="dark-mode"
          checked={resolvedTheme === "light"}
          onCheckedChange={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        />
        <Label htmlFor="dark-mode">Modo Claro</Label>
      </div>

    </div>
  );
};

export default ConfiguracionPage;