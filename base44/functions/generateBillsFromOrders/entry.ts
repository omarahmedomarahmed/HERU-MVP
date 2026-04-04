import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const tournamentOrders = await base44.asServiceRole.entities.TournamentOrder.list();
    const existingBills = await base44.asServiceRole.entities.Bill.list();
    
    const bills = [];
    let createdCount = 0;

    for (const order of tournamentOrders) {
      // Check if bill already exists for this order
      const existingBill = existingBills.find(b => b.tournament_order_id === order.id);
      if (existingBill) continue;

      // Main organizer bill (solo tournaments)
      if (order.tournament_type === 'solo') {
        const billNumber = `BILL-${order.tournament_id?.slice(0, 8)}-MAIN-${Date.now()}`;
        const billData = {
          bill_number: billNumber,
          bill_type: 'organizer',
          tournament_id: order.tournament_id,
          tournament_name: order.tournament_name,
          tournament_order_id: order.id,
          payer_id: order.main_organizer_id,
          payer_type: 'organizer',
          payer_name: order.main_organizer_brand || 'Main Organizer',
          payer_email: '', // Will be set when paid
          items: order.items?.map(item => ({
            item_id: item.item_id,
            title: item.title,
            category: item.category,
            price: item.price,
            quantity: item.quantity || 1,
            subtotal: (item.price || 0) * (item.quantity || 1)
          })) || [],
          subtotal: order.subtotal_items || 0,
          tax: 0,
          grand_total: order.grand_total || 0,
          paid_amount: 0,
          payment_status: 'unpaid',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          issued_at: new Date().toISOString(),
        };
        
        const created = await base44.asServiceRole.entities.Bill.create(billData);
        if (created?.id) {
          createdCount++;
          bills.push(created);
        }
      }
      
      // Shared tournament - main organizer bill
      if (order.tournament_type === 'shared') {
        const billNumber = `BILL-${order.tournament_id?.slice(0, 8)}-MAIN-${Date.now()}`;
        const billData = {
          bill_number: billNumber,
          bill_type: 'organizer',
          tournament_id: order.tournament_id,
          tournament_name: order.tournament_name,
          tournament_order_id: order.id,
          payer_id: order.main_organizer_id,
          payer_type: 'organizer',
          payer_name: order.main_organizer_brand || 'Main Organizer',
          payer_email: '',
          items: order.items?.map(item => ({
            item_id: item.item_id,
            title: item.title,
            category: item.category,
            price: item.price,
            quantity: item.quantity || 1,
            subtotal: (item.price || 0) * (item.quantity || 1)
          })) || [],
          subtotal: order.subtotal_items || 0,
          tax: 0,
          grand_total: order.main_organizer_owes || 0,
          paid_amount: 0,
          payment_status: 'unpaid',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          issued_at: new Date().toISOString(),
        };
        
        const mainBill = await base44.asServiceRole.entities.Bill.create(billData);
        if (mainBill?.id) {
          createdCount++;
          bills.push(mainBill);
        }
      }
      
      // Co-organizer bills (shared tournaments only)
      if (order.tournament_type === 'shared' && order.co_organizers?.length > 0) {
        for (const coOrg of order.co_organizers) {
          const billNumber = `BILL-${order.tournament_id?.slice(0, 8)}-CO-${coOrg.organizer_id?.slice(0, 6)}-${Date.now()}`;
          const billData = {
            bill_number: billNumber,
            bill_type: 'co_organizer',
            tournament_id: order.tournament_id,
            tournament_name: order.tournament_name,
            tournament_order_id: order.id,
            payer_id: coOrg.organizer_id,
            payer_type: 'co_organizer',
            payer_name: coOrg.brand_name || 'Co-Organizer',
            payer_email: '',
            items: order.items?.map(item => ({
              item_id: item.item_id,
              title: item.title,
              category: item.category,
              price: item.price,
              quantity: item.quantity || 1,
              subtotal: (item.price || 0) * (item.quantity || 1)
            })) || [],
            subtotal: order.subtotal_items || 0,
            tax: 0,
            grand_total: coOrg.commitment_amount || 0,
            paid_amount: 0,
            payment_status: 'unpaid',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            issued_at: new Date().toISOString(),
          };
          
          const coBill = await base44.asServiceRole.entities.Bill.create(billData);
          if (coBill?.id) {
            createdCount++;
            bills.push(coBill);
          }
        }
      }
    }

    return Response.json({
      success: true,
      message: `Generated ${createdCount} bills from tournament orders`,
      bills: bills
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});