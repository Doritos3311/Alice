import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import styleMenNoItem from "@/components/MensajeNoItems/MensajeNoItems.module.css"

// Iconos
import { FilePlus2 } from 'lucide-react'

interface MensajeNoItemsProps {
  mensaje: string
  accion: () => void
  textoBoton: string
}

const MensajeNoItems: React.FC<MensajeNoItemsProps> = ({ mensaje, accion, textoBoton }) => {
  return (
    <Card className={styleMenNoItem.card}>
      <CardContent className={styleMenNoItem.cardContent}>
        <FilePlus2 className={styleMenNoItem.icon} />
        <h3 className={styleMenNoItem.title}>Agrega un nuevo elemento</h3>
        <p className={styleMenNoItem.text}>{mensaje}</p>
        <Button className={styleMenNoItem.button} onClick={accion}>{textoBoton}</Button>
      </CardContent>
    </Card>
  )
}

export default MensajeNoItems
