import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PackageX } from 'lucide-react'

interface MensajeNoItemsProps {
  mensaje: string
  accion: () => void
  textoBoton: string
}

const MensajeNoItems: React.FC<MensajeNoItemsProps> = ({ mensaje, accion, textoBoton }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <PackageX className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-2xl font-bold mb-2">No hay elementos</h3>
        <p className="text-gray-600 mb-6">{mensaje}</p>
        <Button onClick={accion}>{textoBoton}</Button>
      </CardContent>
    </Card>
  )
}

export default MensajeNoItems
