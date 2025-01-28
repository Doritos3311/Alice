import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Iconos
import { FilePlus2 } from 'lucide-react'

interface MensajeNoItemsProps {
  mensaje: string
  accion: () => void
  textoBoton: string
}

const MensajeNoItems: React.FC<MensajeNoItemsProps> = ({ mensaje, accion, textoBoton }) => {
  return (
    <Card className="w-full max-w-4xl mx-auto h-full flex items-center justify-center bg-transparent shadow-none border-none">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <FilePlus2 className="w-48 h-48 text-gray-400 mb-8" />
        <h3 className="text-4xl font-bold mb-4">Agrega un nuevo elemento</h3>
        <p className="text-gray-500 text-xl mb-8">{mensaje}</p>
        <Button className="px-6 py-3 text-lg" onClick={accion}>{textoBoton}</Button>
      </CardContent>
    </Card>
  )
}

export default MensajeNoItems
