export type InventoryItem = {
  id: string;
  descripcion: string;
  cantidadDisponible: number;
  precioVenta: number;
  // Añade aquí otros campos que pueda tener un ítem de inventario
};

export type InvoiceItem = {
  id: string;
  detallesProducto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  // Añade aquí otros campos que pueda tener un ítem de factura
};

