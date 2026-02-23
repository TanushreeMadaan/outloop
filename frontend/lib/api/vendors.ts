import api from "../api"
import { Vendor } from "@/app/(dashboard)/vendors/page"

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

export const deleteVendor = async (id: string) => {
  const res = await api.delete(`/vendors/${id}`)
  return res.data
}