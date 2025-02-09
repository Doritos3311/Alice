import React from 'react';
import stylesGenerarRe from "@/components/GenerarRegistros/GenerarRegistros.module.css"

import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDown, FileSpreadsheet, Package, FileText } from 'lucide-react'

interface GenerarRegistrosProps {
  data: any[]; // Tipo para los datos del libro diario
  inventoryItems: any[]; // Tipo para los items de inventario
  invoiceItems: any[]; // Tipo para las facturas
  appConfig: {
    libroDiario: { [key: string]: { name: string } },
    inventario: { [key: string]: { name: string } },
    facturacion: { [key: string]: { name: string } }
  };
}

const GenerarRegistros: React.FC<GenerarRegistrosProps> = ({ data, inventoryItems, invoiceItems, appConfig }) => {
  
  const mapFieldNames = (items: any[], config: { [key: string]: { name: string } }) => {
    return items.map((item) => {
      const mappedItem: { [key: string]: any } = {}
      Object.keys(item).forEach((key) => {
        if (key !== "id") {
          if (config[key]) {
            mappedItem[config[key].name] = item[key]
          } else if (key === "detalles" && Array.isArray(item[key])) {
            // Manejar los detalles de la factura
            item[key].forEach((detalle: any, index: number) => {
              Object.keys(detalle).forEach((detalleKey) => {
                mappedItem[`Detalle ${index + 1} - ${detalleKey}`] = detalle[detalleKey]
              })
            })
          } else {
            // Incluir campos que no están en la configuración pero existen en el objeto
            mappedItem[key] = item[key]
          }
        }
      })
      return mappedItem
    })
  }

  const generateExcel = (items: any[], config: { [key: string]: { name: string } }, sheetName: string) => {
    const workbook = XLSX.utils.book_new();
    const mappedData = mapFieldNames(items, config);
    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${sheetName}.xlsx`);
  };

  const generateAllExcel = () => {
    const workbook = XLSX.utils.book_new();

    const libroDiarioData = mapFieldNames(data, appConfig.libroDiario);
    const libroDiarioWS = XLSX.utils.json_to_sheet(libroDiarioData);
    XLSX.utils.book_append_sheet(workbook, libroDiarioWS, "Libro Diario");

    const inventarioData = mapFieldNames(inventoryItems, appConfig.inventario);
    const inventarioWS = XLSX.utils.json_to_sheet(inventarioData);
    XLSX.utils.book_append_sheet(workbook, inventarioWS, "Inventario");

    const facturacionData = mapFieldNames(invoiceItems, appConfig.facturacion);
    const facturacionWS = XLSX.utils.json_to_sheet(facturacionData);
    XLSX.utils.book_append_sheet(workbook, facturacionWS, "Facturación");

    XLSX.writeFile(workbook, "registros_contables.xlsx");
  };

  return (

    <div className={stylesGenerarRe.spaceY6}>
    <h2 className={stylesGenerarRe.heading}>Generar Registros</h2>
      
      <div className={stylesGenerarRe.gridContainer}>

        <Card>
          <CardHeader>
          <CardTitle className={stylesGenerarRe.flexItemsCenter}>
          <FileSpreadsheet className={stylesGenerarRe.icon} />
              Libro Diario
            </CardTitle>
            <CardDescription>Generar registro del libro diario</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Total de registros: {data.length}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => generateExcel(data, appConfig.libroDiario, "Libro Diario")}>
              <FileDown className={stylesGenerarRe.iconSmall} />
              Descargar
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
          <CardTitle className={stylesGenerarRe.flexItemsCenter}>
          <Package className={stylesGenerarRe.iconMedium} />
              Inventario
            </CardTitle>
            <CardDescription>Generar registro de inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Total de ítems: {inventoryItems.length}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => generateExcel(inventoryItems, appConfig.inventario, "Inventario")}>
            <FileDown className={stylesGenerarRe.iconSmall} />
              Descargar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
          <CardTitle className={stylesGenerarRe.flexItemsCenter}>
          <FileText className={stylesGenerarRe.iconMedium} />
              Facturación
            </CardTitle>
            <CardDescription>Generar registro de facturación</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Total de facturas: {invoiceItems.length}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => generateExcel(invoiceItems, appConfig.facturacion, "Facturación")}>
            <FileDown className={stylesGenerarRe.iconSmall} />
              Descargar
            </Button>
          </CardFooter>
        </Card>

      </div>

      <Card className={stylesGenerarRe.marginTop6}>
        <CardHeader>
          <CardTitle>Generar Todos los Registros</CardTitle>
          <CardDescription>Descargar un archivo Excel con todos los registros combinados</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Este archivo incluirá hojas separadas para Libro Diario, Inventario y Facturación.</p>
        </CardContent>
        <CardFooter>
        <Button onClick={generateAllExcel} className={stylesGenerarRe.buttonFullWidth}>
        <FileDown className={stylesGenerarRe.iconSmall} />
            Descargar Todos los Registros
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GenerarRegistros;


