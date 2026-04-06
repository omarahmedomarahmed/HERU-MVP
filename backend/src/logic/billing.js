import { supabaseAdmin } from '../lib/supabase.js';

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '15');

/**
 * Generate a unique bill number: HERU-YYYY-NNNN
 */
export async function generateBillNumber() {
  const year = new Date().getFullYear();
  const { count } = await supabaseAdmin
    .from('bills')
    .select('*', { count: 'exact', head: true })
    .ilike('bill_number', `HERU-${year}-%`);

  const seq = (count || 0) + 1;
  return `HERU-${year}-${String(seq).padStart(4, '0')}`;
}

/**
 * Create a bill record.
 */
export async function createBill({
  billType,
  tournamentId,
  tournamentName,
  tournamentOrderId,
  payerId,
  payerType,
  payerName,
  payerEmail,
  items = [],
  subtotal,
  platformFee,
  grandTotal,
  sharedTournament = false,
  sharedBillRef,
  totalTournamentCost,
  dueDate,
}) {
  const billNumber = await generateBillNumber();

  const { data, error } = await supabaseAdmin
    .from('bills')
    .insert({
      bill_number: billNumber,
      bill_type: billType,
      tournament_id: tournamentId,
      tournament_name: tournamentName,
      tournament_order_id: tournamentOrderId,
      payer_id: payerId,
      payer_type: payerType,
      payer_name: payerName,
      payer_email: payerEmail,
      items,
      subtotal,
      platform_fee: platformFee,
      tax: 0,
      grand_total: grandTotal,
      payment_status: 'unpaid',
      due_date: dueDate || null,
      shared_tournament: sharedTournament,
      shared_bill_ref: sharedBillRef,
      total_tournament_cost: totalTournamentCost,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a billing snapshot for a party's commitment.
 */
export async function createBillingSnapshot({
  tournamentId,
  tournamentName,
  tournamentType,
  organizerId,
  organizerBrandName,
  organizerBrandLogo,
  billingType,
  commitmentPercent,
  amountDue,
}) {
  const { data, error } = await supabaseAdmin
    .from('billing_snapshots')
    .insert({
      tournament_id: tournamentId,
      tournament_name: tournamentName,
      tournament_type: tournamentType,
      organizer_id: organizerId,
      organizer_brand_name: organizerBrandName,
      organizer_brand_logo: organizerBrandLogo,
      billing_type: billingType,
      commitment_percent: commitmentPercent,
      amount_due: amountDue,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a bill as paid and trigger downstream effects.
 * Returns the updated bill.
 */
export async function markBillPaid(billId, paymentMethod, paymobTransactionId) {
  // First fetch the bill to get grand_total
  const { data: existingBill } = await supabaseAdmin
    .from('bills')
    .select('grand_total')
    .eq('id', billId)
    .single();

  const { data: bill, error } = await supabaseAdmin
    .from('bills')
    .update({
      payment_status: 'paid',
      paid_amount: existingBill?.grand_total || 0,
      paid_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethod || 'manual',
      paymob_transaction_id: paymobTransactionId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', billId)
    .select()
    .single();

  if (error) throw error;

  // Update billing snapshot if exists
  if (bill.tournament_id) {
    await supabaseAdmin
      .from('billing_snapshots')
      .update({
        amount_paid: bill.grand_total,
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('tournament_id', bill.tournament_id)
      .eq('organizer_id', bill.payer_id);
  }

  return { ...bill, payment_status: 'paid', paid_amount: bill.grand_total };
}

/**
 * Calculate the platform fee for a given subtotal.
 */
export function calculatePlatformFee(subtotal) {
  return Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
}
