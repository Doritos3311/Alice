import React, { useEffect } from 'react';
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const ConfiguracionPage: React.FC = () => {
  const { theme, setTheme } = useTheme() 

  return (
    <div className="p-8">
      <h1 className="text-3 xl font-bold mb-4">Configuración</h1>
      <div className="flex items-center space-x-2">
        <Switch
          id="dark-mode"
          checked={theme === "light"}
          onCheckedChange={() => setTheme(theme === "light" ? "dark" : "light")}
        />
        <Label htmlFor="dark-mode">Modo Claro</Label>
      </div>
      {/* Aquí puedes agregar más opciones de configuración en el futuro */}
    </div>
  );
};

export default ConfiguracionPage;

