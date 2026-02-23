import api from "../api"
import { Item } from "@/types"

export const getItems = async (): Promise<Item[]> => {
    const res = await api.get("/items")
    return res.data
}

export const createItem = async (
    data: Partial<Item>
): Promise<Item> => {
    const res = await api.post("/items", data)
    return res.data
}

export const updateItem = async ({
    id,
    ...data
}: Partial<Item> & { id: string }): Promise<Item> => {
    const res = await api.patch(`/items/${id}`, data)
    return res.data
}

export const deleteItem = async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`)
}
