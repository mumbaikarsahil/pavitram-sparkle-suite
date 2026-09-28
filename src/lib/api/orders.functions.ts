import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const fetchCustomerOrdersFn = createServerFn({ method: 'GET' })
  .validator(z.object({ phone: z.string() }))
  .handler(async ({ data }) => {
    const { phone } = data;

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;

    // Fetch orders and try to grab the linked inventory/custom order details if they exist
    const { data: orders, error } = await supabaseAdmin
      .from('ecommerce_orders')
      .select(`
        id,
        order_number,
        status,
        final_total,
        expected_delivery_date,
        created_at,
        shipping_address,
        inventory_items ( item_category ),
        custom_orders ( estimated_value )
      `)
      .eq('customer_phone', formattedPhone)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error("Failed to fetch orders: " + error.message);
    }

    return { success: true, orders: orders || [] };
  });