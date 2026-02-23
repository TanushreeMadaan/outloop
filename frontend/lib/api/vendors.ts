import api from "../api"
import { Vendor } from "@/types"

export const getVendors = async (): Promise<Vendor[]> => {
  const res = await api.get("/vendors")
  return res.data
}

export const createVendor = async (
  data: Partial<Vendor>
): Promise<Vendor> => {
  const res = await api.post("/vendors", data)
  return res.data
}

export const updateVendor = async ({
  id,
  ...data
}: Partial<Vendor> & { id: string }): Promise<Vendor> => {
  const res = await api.patch(`/vendors/${id}`, data)
  return res.data
}

export const deleteVendor = async (id: string): Promise<void> => {
  await api.delete(`/vendors/${id}`)
}