"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getVendors, createVendor } from "@/lib/api/vendors"
import { useState } from "react"

export interface Vendor {
  id: string
  name: string
  address?: string
  email?: string
  phoneNo?: string
  gstNumber?: string
  createdAt: string
}

export default function VendorsPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: getVendors,
  })

  const mutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] })
      setName("")
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vendors</h1>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vendor name"
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={() => mutation.mutate({ name })}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {data?.map((vendor: Vendor) => (
          <li key={vendor.id} className="border p-3 rounded">
            {vendor.name}
          </li>
        ))}
      </ul>
    </div>
  )
}