"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import BarcodeScanner from "@/components/barcode-scanner"
import BarcodeList from "@/components/barcode-list"
import { Copy, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface Barcode {
  id: string
  type: string
  data: string
  timestamp: string
}

export default function Home() {
  const [barcodes, setBarcodes] = useState<Barcode[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved barcodes from localStorage
    const savedBarcodes = localStorage.getItem("barcodes")
    if (savedBarcodes) {
      setBarcodes(JSON.parse(savedBarcodes))
    }
  }, [])

  const saveBarcodes = (updatedBarcodes: Barcode[]) => {
    localStorage.setItem("barcodes", JSON.stringify(updatedBarcodes))
    setBarcodes(updatedBarcodes)
  }

  const handleBarCodeScanned = (type: string, data: string) => {
    // Check if barcode already exists
    if (!barcodes.some((item) => item.data === data)) {
      const newBarcode: Barcode = {
        id: Date.now().toString(),
        type,
        data,
        timestamp: new Date().toLocaleString(),
      }

      const updatedBarcodes = [...barcodes, newBarcode]
      saveBarcodes(updatedBarcodes)

      toast({
        title: "Barcode Detected",
        description: `Type: ${type}\nData: ${data}`,
      })
    } else {
      toast({
        title: "Duplicate Barcode",
        description: "This barcode has already been scanned",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Barcode copied to clipboard",
    })
  }

  const deleteBarcode = (id: string) => {
    const updatedBarcodes = barcodes.filter((item) => item.id !== id)
    saveBarcodes(updatedBarcodes)

    toast({
      title: "Deleted",
      description: "Barcode deleted successfully",
    })
  }

  const deleteAllBarcodes = () => {
    saveBarcodes([])
    toast({
      title: "Deleted All",
      description: "All barcodes deleted successfully",
    })
  }

  const copyAllBarcodes = () => {
    if (barcodes.length === 0) {
      toast({
        title: "No Barcodes",
        description: "There are no barcodes to copy",
        variant: "destructive",
      })
      return
    }

    const allBarcodeText = barcodes.map((item) => item.data).join("\n")
    navigator.clipboard.writeText(allBarcodeText)

    toast({
      title: "Copied All",
      description: "All barcodes copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Web Barcode Scanner</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={copyAllBarcodes} disabled={barcodes.length === 0}>
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button variant="outline" onClick={deleteAllBarcodes} disabled={barcodes.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </header>

      {isScanning ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <BarcodeScanner onScanSuccess={handleBarCodeScanned} onClose={() => setIsScanning(false)} />
          </CardContent>
        </Card>
      ) : (
        <div className="text-center mb-6">
          <Button onClick={() => setIsScanning(true)}>Start Scanning</Button>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Scanned Barcodes</h2>
        {barcodes.length === 0 ? (
          <div className="text-center py-10 bg-muted rounded-lg">
            <p className="text-muted-foreground">No barcodes scanned yet</p>
            <p className="text-sm text-muted-foreground mt-2">Click "Start Scanning" to begin</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <BarcodeList barcodes={barcodes} onCopy={copyToClipboard} onDelete={deleteBarcode} />
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
