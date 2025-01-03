export interface InventoryItem {
  id: string;
  descripcion: string;
  cantidadDisponible: number;
  precioVenta: number;
  // Agrega aquí cualquier otra propiedad necesaria
}

export interface InvoiceItem {
  id: string;
  numeroFactura: string;
  fechaEmision: string;
  nombreCliente: string;
  total: number;
  // Agrega aquí cualquier otra propiedad necesaria
}

