import { supabase } from "../lib/supabaseClient";

export async function updateInventoryStock(variantId: string, newStock: number): Promise<void> {
  const { error } = await supabase
    .from("inventory")
    .update({ stock: newStock })
    .eq("variant_id", variantId);

  if (error) {
    throw new Error(`Failed to update inventory: ${error.message}`);
  }
}

export const adminInventoryService = {
  updateInventoryStock,
};
