import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ConfiguracionPage: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme == "dark" || theme == "light") {
      console.log(theme)
    } else {
      setTheme("dark"); // Define el tema por defecto si no hay uno establecido
    }    
  }, [theme, setTheme]);

  if (!mounted) return null; // Evita renderizar antes de que cargue el tema

  return (
    <div className="p-8">
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
