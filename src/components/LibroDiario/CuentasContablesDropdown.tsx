import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/react-scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select';

// Definimos el tipo para las cuentas contables
type CuentaContable = {
  categoria: string;
  cuentas: string[];
};

// Definimos el tipo para la función onSelect
type OnSelectCallback = (value: string) => void;

// Datos de ejemplo para las cuentas contables
const cuentasContables: CuentaContable[] = [
  { categoria: 'Activo', cuentas: ['Caja', 'Bancos', 'Inventario'] },
  { categoria: 'Pasivo', cuentas: ['Proveedores', 'Impuestos por pagar'] },
  { categoria: 'Patrimonio', cuentas: ['Capital social', 'Utilidades retenidas'] },
];

// Componente para el dropdown de cuentas contables
const CuentasContablesDropdown: React.FC<{ onSelect: OnSelectCallback }> = ({ onSelect }) => {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccione una cuenta" />
      </SelectTrigger>
      <SelectContent>
        {cuentasContables.map((categoria) => (
          <SelectGroup key={categoria.categoria}>
            <SelectLabel>{categoria.categoria}</SelectLabel>
            {categoria.cuentas.map((cuenta) => (
              <SelectItem key={cuenta} value={cuenta}>
                {cuenta}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

// Componente principal del modal
const CrearAsientoContableModal: React.FC<{
  isCreatingAccountingEntry: boolean;
  setIsCreatingAccountingEntry: (value: boolean) => void;
  appConfig: { libroDiario: Record<string, { name: string; type: string }> };
}> = ({ isCreatingAccountingEntry, setIsCreatingAccountingEntry, appConfig }) => {
  const [rows, setRows] = useState<Record<string, string>[]>([{}]);

  // Función para manejar cambios en una fila
  const handleRowChange = (index: number, key: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [key]: value };
    setRows(updatedRows);
  };

  // Función para agregar una nueva fila
  const handleAddRow = () => {
    setRows([...rows, {}]);
  };

  // Función para cancelar la creación
  const handleCancelCreationLibroDiario = () => {
    setRows([{}]);
    setIsCreatingAccountingEntry(false);
  };

  // Función para guardar el asiento contable
  const handleSave = () => {
    console.log('Asiento contable guardado:', rows);
    setIsCreatingAccountingEntry(false);
  };

  return (
    <Dialog open={isCreatingAccountingEntry} onOpenChange={setIsCreatingAccountingEntry}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Crear Asiento Contable</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <Button onClick={handleAddRow} style={{ marginBottom: '16px' }}>
            Agregar Fila
          </Button>
          {rows.map((row, index) => (
            <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              {/* Campo de cuenta contable */}
              <div style={{ flex: 1 }}>
                <Label>Cuenta Contable</Label>
                <CuentasContablesDropdown
                  onSelect={(value) => handleRowChange(index, 'cuentaContable', value)}
                />
              </div>

              {/* Otros campos */}
              {Object.entries(appConfig.libroDiario).map(([key, field]) => (
                <div key={key} style={{ flex: 1 }}>
                  <Label htmlFor={key}>{field.name}</Label>
                  <Input
                    id={key}
                    type={field.type}
                    value={row[key] || ''}
                    onChange={(e: { target: { value: string; }; }) => handleRowChange(index, key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ))}
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleCancelCreationLibroDiario}>Cancelar</Button>
          <Button onClick={handleSave}>Crear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrearAsientoContableModal;