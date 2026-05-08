import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Item = Database["public"]["Tables"]["items"]["Row"];
export type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];
export type ItemCategory = Database["public"]["Enums"]["item_category"];
export type ItemStatus = Database["public"]["Enums"]["item_status"];

export const CATEGORIES: ItemCategory[] = [
  "Komputer & Laptop",
  "Jaringan",
  "Audio/Video",
  "Peripheral",
];

export const STATUSES: ItemStatus[] = ["Bagus", "Rusak", "Dalam Perbaikan"];

export const STATUS_STYLES: Record<ItemStatus, string> = {
  "Bagus": "bg-status-good/15 text-status-good border-status-good/30",
  "Rusak": "bg-status-broken/15 text-status-broken border-status-broken/30",
  "Dalam Perbaikan": "bg-status-repair/15 text-status-repair border-status-repair/30",
};

export const CATEGORY_EMOJI: Record<ItemCategory, string> = {
  "Komputer & Laptop": "💻",
  "Jaringan": "🛰️",
  "Audio/Video": "🎛️",
  "Peripheral": "🖨️",
};

export async function listItems() {
  const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getItem(id: string) {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createItem(item: ItemInsert) {
  const { data, error } = await supabase.from("items").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: string, patch: Partial<ItemInsert>) {
  const { data, error } = await supabase.from("items").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}
