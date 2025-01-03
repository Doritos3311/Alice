import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AutoCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AutoCompleteModal({ isOpen, onClose, onConfirm }: AutoCompleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Autocompletar Libro Diario</DialogTitle>
        </DialogHeader>
        <p>¿Desea autocompletar este ítem en el libro diario?</p>
        <DialogFooter>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
