'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'

import AIBOMParser from '@/components/AIBOMParser'
import AIChatWidget from '@/components/AIChatWidget'

type ComponentRecord = {
  id: number
  name: string
  quantity: number
  unit: string
  parent_id?: number | null
  materials: MaterialRecord[]
  processes: ProcessRecord[]
  transports: TransportRecord[]
}

type MaterialRecord = {
  id: number
  dataset_ref: string
  mass_kg: number
  recycled_content_pct: number
}

type ProcessRecord = {
  id: number
  dataset_ref: string
  energy_kwh: number
}

type TransportRecord = {
  id: number
  mode: string
  distance_km: number
  origin_iso: string
  dest_iso: string
  dataset_ref: string
}

type ProductDetails = {
  id: number
  name: string
  description?: string | null
  unit: string
  iso_standard?: string | null
  created_at?: string
}

type TreeNode = {
  id: string
  label: string
  type: 'component' | 'material' | 'process' | 'transport'
  refId: number
  parentComponentId?: number
  children?: TreeNode[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

const buildTree = (components: ComponentRecord[]): TreeNode[] => {
  const nodes = new Map<number, TreeNode>()

  components.forEach((component) => {
    nodes.set(component.id, {
      id: `component-${component.id}`,
      refId: component.id,
      label: `${component.name} (${component.quantity} ${component.unit})`,
      type: 'component',
      parentComponentId: component.parent_id ?? undefined,
      children: []
    })
  })

  const roots: TreeNode[] = []

  components.forEach((component) => {
    const node = nodes.get(component.id)
    if (!node) return

    if (component.parent_id && nodes.has(component.parent_id)) {
      nodes.get(component.parent_id)!.children?.push(node)
    } else {
      roots.push(node)
    }
  })

  components.forEach((component) => {
    const parentNode = nodes.get(component.id)
    if (!parentNode) return
    const detailChildren: TreeNode[] = []

    component.materials.forEach((material) => {
      detailChildren.push({
        id: `material-${material.id}`,
        refId: material.id,
        parentComponentId: component.id,
        type: 'material',
        label: `Material: ${material.dataset_ref} – ${material.mass_kg} kg (${material.recycled_content_pct}% ÅV)`
      })
    })

    component.processes.forEach((process) => {
      detailChildren.push({
        id: `process-${process.id}`,
        refId: process.id,
        parentComponentId: component.id,
        type: 'process',
        label: `Process: ${process.dataset_ref} – ${process.energy_kwh} kWh`
      })
    })

    component.transports.forEach((transport) => {
      detailChildren.push({
        id: `transport-${transport.id}`,
        refId: transport.id,
        parentComponentId: component.id,
        type: 'transport',
        label: `Transport: ${transport.mode.toUpperCase()} ${transport.origin_iso}→${transport.dest_iso} – ${transport.distance_km} km`
      })
    })

    parentNode.children = [...(parentNode.children || []), ...detailChildren]
  })

  return roots
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const productId = Number(params.id)

  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [records, setRecords] = useState<ComponentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAIParser, setShowAIParser] = useState(false)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)

  const [componentForm, setComponentForm] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    parentId: ''
  })

  const [materialForm, setMaterialForm] = useState({
    datasetRef: '',
    massKg: '',
    recycledPct: '0'
  })

  const [processForm, setProcessForm] = useState({
    datasetRef: '',
    energyKwh: ''
  })

  const [transportForm, setTransportForm] = useState({
    mode: 'sea',
    distanceKm: '',
    originIso: 'SE',
    destIso: 'SE',
    datasetRef: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshProduct = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/products/${productId}`)
      if (!response.ok) {
        throw new Error('Kunde inte hämta produktdata')
      }
      const data = await response.json()
      setProduct(data.product)
      setRecords(data.components || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod')
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    refreshProduct()
  }, [refreshProduct])

  const tree = useMemo(() => buildTree(records), [records])

  const handleAIParse = (components: any[]) => {
    console.log('Parsed components:', components)
    setShowAIParser(false)
  }

  const handleCreateComponent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!componentForm.name.trim()) {
      setError('Ange komponentnamn')
      return
    }
    const quantity = Number(componentForm.quantity)
    if (Number.isNaN(quantity) || quantity <= 0) {
      setError('Ange en giltig kvantitet (> 0)')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/products/${productId}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: componentForm.name,
          quantity,
          unit: componentForm.unit,
          parent_id: componentForm.parentId ? Number(componentForm.parentId) : null
        })
      })
      if (!response.ok) {
        throw new Error('Misslyckades att skapa komponent')
      }
      setComponentForm({ name: '', quantity: '', unit: 'kg', parentId: '' })
      await refreshProduct()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Misslyckades att skapa komponent')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateMaterial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedNode || selectedNode.type !== 'component') {
      setError('Välj en komponent för att lägga till material')
      return
    }
    if (!materialForm.datasetRef.trim()) {
      setError('Dataset-ref krävs för material')
      return
    }
    const massKg = Number(materialForm.massKg)
    const recycledPct = Number(materialForm.recycledPct)
    if (Number.isNaN(massKg) || massKg <= 0) {
      setError('Ange giltig massa i kg')
      return
    }
    if (Number.isNaN(recycledPct) || recycledPct < 0 || recycledPct > 100) {
      setError('Återvunnet innehåll måste vara mellan 0 och 100 %')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/components/${selectedNode.refId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_ref: materialForm.datasetRef,
          mass_kg: massKg,
          recycled_content_pct: recycledPct
        })
      })
      if (!response.ok) {
        throw new Error('Misslyckades att lägga till material')
      }
      setMaterialForm({ datasetRef: '', massKg: '', recycledPct: '0' })
      await refreshProduct()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Misslyckades att lägga till material')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateProcess = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedNode || selectedNode.type !== 'component') {
      setError('Välj en komponent för att lägga till process')
      return
    }
    if (!processForm.datasetRef.trim()) {
      setError('Dataset-ref krävs för process')
      return
    }
    const energy = Number(processForm.energyKwh)
    if (Number.isNaN(energy) || energy <= 0) {
      setError('Ange giltig energianvändning (kWh)')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/components/${selectedNode.refId}/processes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_ref: processForm.datasetRef,
          energy_kwh: energy
        })
      })
      if (!response.ok) {
        throw new Error('Misslyckades att lägga till process')
      }
      setProcessForm({ datasetRef: '', energyKwh: '' })
      await refreshProduct()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Misslyckades att lägga till process')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateTransport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedNode || selectedNode.type !== 'component') {
      setError('Välj en komponent för att lägga till transport')
      return
    }
    const distance = Number(transportForm.distanceKm)
    if (Number.isNaN(distance) || distance <= 0) {
      setError('Ange giltigt avstånd i km')
      return
    }
    if (!transportForm.originIso.trim() || !transportForm.destIso.trim()) {
      setError('Ange ursprungs- och destinationsland (ISO-kod)')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/components/${selectedNode.refId}/transports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: transportForm.mode,
          distance_km: distance,
          origin_iso: transportForm.originIso,
          dest_iso: transportForm.destIso,
          dataset_ref: transportForm.datasetRef || null
        })
      })
      if (!response.ok) {
        throw new Error('Misslyckades att lägga till transport')
      }
      setTransportForm({ mode: 'sea', distanceKm: '', originIso: 'SE', destIso: 'SE', datasetRef: '' })
      await refreshProduct()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Misslyckades att lägga till transport')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedComponent = useMemo(() => {
    if (!selectedNode) return null
    if (selectedNode.type === 'component') {
      return records.find(component => component.id === selectedNode.refId) || null
    }
    if (selectedNode.parentComponentId) {
      return records.find(component => component.id === selectedNode.parentComponentId) || null
    }
    return null
  }, [records, selectedNode])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sis-gray-900">BOM-byggare</h1>
            <p className="text-sm text-sis-gray-600">
              {product ? `${product.name} • ${product.iso_standard ?? 'ISO 14040-serien'}` : `Produkt #${productId}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-sis-gray-200 hover:bg-sis-gray-50"
              onClick={() => router.push('/dashboard')}
            >
              Till dashboard
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-sis-pomegranate text-white hover:bg-red-700"
              onClick={() => router.push(`/products/${productId}/results`)}
            >
              Kör beräkning enligt ISO 14040-serien
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        <div className="col-span-4 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sis-gray-900">Komponentträd</h2>
              <p className="text-xs text-sis-gray-500">Välj en komponent för att lägga till material och processer.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAIParser(value => !value)}
                className="text-xs px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700"
              >
                AI-import
              </button>
            </div>
          </div>
          {showAIParser && (
            <div className="p-4 border-b">
              <AIBOMParser onParse={handleAIParse} />
            </div>
          )}
          <div className="flex-1 overflow-auto p-3">
            {isLoading ? (
              <div className="flex items-center justify-center text-sis-gray-500 py-8">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Läser in komponenter...
              </div>
            ) : tree.length === 0 ? (
              <div className="text-sm text-sis-gray-500 py-4">
                Ingen struktur ännu. Lägg till din första komponent nedan.
              </div>
            ) : (
              <ul className="space-y-1">
                {tree.map(node => (
                  <TreeItem
                    key={node.id}
                    node={node}
                    selectedNode={selectedNode}
                    onSelect={setSelectedNode}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="col-span-8 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-sis-gray-900">Ny komponent</h3>
              {isSubmitting && (
                <span className="text-xs text-sis-gray-500 inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sparar...
                </span>
              )}
            </div>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateComponent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <label className="text-sm text-sis-gray-700 flex flex-col gap-1 md:col-span-2">
                Namn
                <input
                  value={componentForm.name}
                  onChange={(event) => setComponentForm(prev => ({ ...prev, name: event.target.value }))}
                  className="rounded-lg border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                  placeholder="Ex. Aluminiumhölje"
                  required
                />
              </label>
              <label className="text-sm text-sis-gray-700 flex flex-col gap-1">
                Kvantitet
                <input
                  value={componentForm.quantity}
                  onChange={(event) => setComponentForm(prev => ({ ...prev, quantity: event.target.value }))}
                  className="rounded-lg border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                  placeholder="12"
                  required
                />
              </label>
              <label className="text-sm text-sis-gray-700 flex flex-col gap-1">
                Enhet
                <input
                  value={componentForm.unit}
                  onChange={(event) => setComponentForm(prev => ({ ...prev, unit: event.target.value }))}
                  className="rounded-lg border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                  placeholder="kg"
                  required
                />
              </label>
              <label className="text-sm text-sis-gray-700 flex flex-col gap-1 md:col-span-2">
                Förälder (valfritt)
                <select
                  value={componentForm.parentId}
                  onChange={(event) => setComponentForm(prev => ({ ...prev, parentId: event.target.value }))}
                  className="rounded-lg border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                >
                  <option value="">Toppnivå</option>
                  {records.map(component => (
                    <option key={component.id} value={component.id}>
                      {component.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till komponent
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-sis-gray-900">Detaljer för vald komponent</h3>
                <p className="text-sm text-sis-gray-500">
                  Välj en komponent i trädet för att lägga till material, processer och transporter.
                </p>
              </div>
              <span className="text-sm font-medium text-sis-pomegranate">
                {selectedComponent ? selectedComponent.name : 'Ingen komponent vald'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleCreateMaterial} className="border border-sis-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sis-gray-900">Material</h4>
                <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                  Dataset-ref
                  <input
                    value={materialForm.datasetRef}
                    onChange={(event) => setMaterialForm(prev => ({ ...prev, datasetRef: event.target.value }))}
                    className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="mat_al_primary"
                  />
                </label>
                <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                  Massa (kg)
                  <input
                    value={materialForm.massKg}
                    onChange={(event) => setMaterialForm(prev => ({ ...prev, massKg: event.target.value }))}
                    className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="12"
                  />
                </label>
                <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                  Återvunnet innehåll (%)
                  <input
                    value={materialForm.recycledPct}
                    onChange={(event) => setMaterialForm(prev => ({ ...prev, recycledPct: event.target.value }))}
                    className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="30"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full py-2 bg-sis-pomegranate text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Lägg till material
                </button>
              </form>

              <form onSubmit={handleCreateProcess} className="border border-sis-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sis-gray-900">Process</h4>
                <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                  Dataset-ref
                  <input
                    value={processForm.datasetRef}
                    onChange={(event) => setProcessForm(prev => ({ ...prev, datasetRef: event.target.value }))}
                    className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="process_casting_al"
                  />
                </label>
                <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                  Energi (kWh)
                  <input
                    value={processForm.energyKwh}
                    onChange={(event) => setProcessForm(prev => ({ ...prev, energyKwh: event.target.value }))}
                    className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="5"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full py-2 bg-sis-pomegranate text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Lägg till process
                </button>
              </form>

              <form onSubmit={handleCreateTransport} className="border border-sis-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sis-gray-900">Transport</h4>
                <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                  Typ
                  <select
                    value={transportForm.mode}
                    onChange={(event) => setTransportForm(prev => ({ ...prev, mode: event.target.value }))}
                    className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                  >
                    <option value="sea">Sjö</option>
                    <option value="road">Väg</option>
                    <option value="air">Flyg</option>
                    <option value="rail">Tåg</option>
                  </select>
                </label>
                <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                  Avstånd (km)
                  <input
                    value={transportForm.distanceKm}
                    onChange={(event) => setTransportForm(prev => ({ ...prev, distanceKm: event.target.value }))}
                    className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="18000"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                    Ursprung (ISO)
                    <input
                      value={transportForm.originIso}
                      onChange={(event) => setTransportForm(prev => ({ ...prev, originIso: event.target.value.toUpperCase() }))}
                      className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                      placeholder="SE"
                    />
                  </label>
                  <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                    Destination (ISO)
                    <input
                      value={transportForm.destIso}
                      onChange={(event) => setTransportForm(prev => ({ ...prev, destIso: event.target.value.toUpperCase() }))}
                      className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                      placeholder="SE"
                    />
                  </label>
                </div>
                <label className="text-xs text-sis-gray-600 flex flex-col gap-1">
                  Dataset-ref (valfri)
                  <input
                    value={transportForm.datasetRef}
                    onChange={(event) => setTransportForm(prev => ({ ...prev, datasetRef: event.target.value }))}
                    className="rounded-md border border-sis-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40"
                    placeholder="sea_freight"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full py-2 bg-sis-pomegranate text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Lägg till transport
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
      <AIChatWidget />
    </div>
  )
}

function TreeItem({
  node,
  selectedNode,
  onSelect
}: {
  node: TreeNode
  selectedNode: TreeNode | null
  onSelect: (node: TreeNode) => void
}) {
  const [open, setOpen] = useState(true)
  const isSelected = selectedNode?.id === node.id
  const hasChildren = !!node.children && node.children.length > 0

  return (
    <div>
      <div
        className={`flex items-center justify-between rounded-md px-2 py-2 cursor-pointer ${
          isSelected ? 'bg-sis-pomegranate/10 ring-1 ring-sis-pomegranate/40' : 'hover:bg-sis-gray-50'
        }`}
        onClick={() => onSelect(node)}
      >
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              className="text-sis-gray-500"
              onClick={(event) => {
                event.stopPropagation()
                setOpen(value => !value)
              }}
            >
              {open ? '▾' : '▸'}
            </button>
          )}
          <span className="text-sm text-sis-gray-800">{node.label}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-sis-gray-500">{node.type}</span>
      </div>
      {open && hasChildren && (
        <div className="ml-5 mt-1 space-y-1">
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} selectedNode={selectedNode} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}
