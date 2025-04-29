"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar } from "react-native"
import { BarCodeScanner } from "expo-barcode-scanner"
import * as Clipboard from "expo-clipboard"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"

export default function App() {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [barcodes, setBarcodes] = useState([])

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === "granted")

      // Load saved barcodes
      loadBarcodes()
    })()
  }, [])

  const loadBarcodes = async () => {
    try {
      const savedBarcodes = await AsyncStorage.getItem("barcodes")
      if (savedBarcodes !== null) {
        setBarcodes(JSON.parse(savedBarcodes))
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load saved barcodes")
    }
  }

  const saveBarcodes = async (updatedBarcodes) => {
    try {
      await AsyncStorage.setItem("barcodes", JSON.stringify(updatedBarcodes))
    } catch (error) {
      Alert.alert("Error", "Failed to save barcodes")
    }
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)

    // Check if barcode already exists
    if (!barcodes.some((item) => item.data === data)) {
      const newBarcode = {
        id: Date.now().toString(),
        type,
        data,
        timestamp: new Date().toLocaleString(),
      }

      const updatedBarcodes = [...barcodes, newBarcode]
      setBarcodes(updatedBarcodes)
      saveBarcodes(updatedBarcodes)

      Alert.alert("Barcode Detected", `Type: ${type}\nData: ${data}`, [
        { text: "Scan Again", onPress: () => setScanned(false) },
        { text: "Back to List", onPress: () => setIsScanning(false) },
      ])
    } else {
      Alert.alert("Duplicate Barcode", "This barcode has already been scanned", [
        { text: "Scan Again", onPress: () => setScanned(false) },
        { text: "Back to List", onPress: () => setIsScanning(false) },
      ])
    }
  }

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text)
    Alert.alert("Copied", "Barcode copied to clipboard")
  }

  const deleteBarcode = (id) => {
    Alert.alert("Delete Barcode", "Are you sure you want to delete this barcode?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedBarcodes = barcodes.filter((item) => item.id !== id)
          setBarcodes(updatedBarcodes)
          saveBarcodes(updatedBarcodes)
        },
      },
    ])
  }

  const deleteAllBarcodes = () => {
    Alert.alert("Delete All Barcodes", "Are you sure you want to delete all barcodes?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: () => {
          setBarcodes([])
          saveBarcodes([])
        },
      },
    ])
  }

  const copyAllBarcodes = () => {
    if (barcodes.length === 0) {
      Alert.alert("No Barcodes", "There are no barcodes to copy")
      return
    }

    const allBarcodeText = barcodes.map((item) => item.data).join("\n")
    Clipboard.setStringAsync(allBarcodeText)
    Alert.alert("Copied", "All barcodes copied to clipboard")
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    )
  }

  if (isScanning) {
    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.scannerOverlay}>
          <View style={styles.scannerTarget} />
        </View>

        <View style={styles.scannerControls}>
          {scanned && (
            <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
              <Text style={styles.scanAgainButtonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => setIsScanning(false)}>
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backButtonText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <Text style={styles.title}>Multi Barcode Scanner</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={copyAllBarcodes}>
            <Ionicons name="copy-outline" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={deleteAllBarcodes}>
            <Ionicons name="trash-outline" size={24} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>

      {barcodes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="barcode-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No barcodes scanned yet</Text>
          <Text style={styles.emptySubText}>Tap the scan button to start</Text>
        </View>
      ) : (
        <FlatList
          data={barcodes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.barcodeItem}>
              <View style={styles.barcodeContent}>
                <Text style={styles.barcodeData}>{item.data}</Text>
                <Text style={styles.barcodeType}>{item.type}</Text>
                <Text style={styles.barcodeTime}>{item.timestamp}</Text>
              </View>
              <View style={styles.barcodeActions}>
                <TouchableOpacity onPress={() => copyToClipboard(item.data)} style={styles.actionButton}>
                  <Ionicons name="copy-outline" size={22} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteBarcode(item.id)} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={22} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          setIsScanning(true)
          setScanned(false)
        }}
      >
        <Ionicons name="scan-outline" size={24} color="white" />
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  barcodeItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  barcodeContent: {
    flex: 1,
  },
  barcodeData: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  barcodeType: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  barcodeTime: {
    fontSize: 12,
    color: "#adb5bd",
  },
  barcodeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  scanButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007bff",
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scanButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  scannerContainer: {
    flex: 1,
    flexDirection: "column",
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTarget: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  scannerControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanAgainButton: {
    backgroundColor: "rgba(0, 123, 255, 0.8)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
  },
  scanAgainButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  backButtonText: {
    color: "white",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#6c757d",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#adb5bd",
    marginTop: 8,
  },
})
