"use client"

import { useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"

interface BarcodeScannerProps {
  onScanSuccess: (type: string, data: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerContainerId = "qr-code-scanner"

  useEffect(() => {
    // Initialize scanner
    scannerRef.current = new Html5QrcodeScanner(
      scannerContainerId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      /* verbose= */ false,
    )

    // Start scanning
    scannerRef.current.render(
      (decodedText, decodedResult) => {
        const format = decodedResult.result.format ? decodedResult.result.format.toString() : "Unknown"
        onScanSuccess(format, decodedText)
      },
      (errorMessage) => {
        console.error(errorMessage)
      },
    )

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (error) {
          console.error("Error when clearing scanner:", error)
        }
      }
    }
  }, [onScanSuccess])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full">
        <div id={scannerContainerId}></div>
      </div>
      <Button variant="secondary" onClick={onClose} className="mt-4">
        Close Scanner
      </Button>
    </div>
  )
}
