"use client"

import { Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Barcode } from "@/app/page"

interface BarcodeListProps {
  barcodes: Barcode[]
  onCopy: (text: string) => void
  onDelete: (id: string) => void
}

export default function BarcodeList({ barcodes, onCopy, onDelete }: BarcodeListProps) {
  return (
    <div className="space-y-4">
      {barcodes.map((barcode) => (
        <div key={barcode.id} className="bg-card p-4 rounded-lg border shadow-sm flex justify-between items-start">
          <div className="flex-1">
            <p className="font-medium break-all">{barcode.data}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Type: {barcode.type}</p>
              <p>Scanned: {barcode.timestamp}</p>
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <Button variant="ghost" size="icon" onClick={() => onCopy(barcode.data)} title="Copy barcode">
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(barcode.id)} title="Delete barcode">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
