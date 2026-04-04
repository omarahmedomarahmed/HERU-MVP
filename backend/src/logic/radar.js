import { supabaseAdmin } from '../lib/supabase.js';
import { createBill, createBillingSnapshot, calculatePlatformFee } from './billing.js';

/**
 * Validate and process a co-organizer commitment to a radar entry.
 *
 * Rules:
 * - Minimum commitment is 33%
 * - Max 3 parties total (main + 2 co-orgs, or main + 1 sponsor at 66%)
 * - 33% = co-organizer label, 66% = sponsor label
 */
export async function commitCoOrganizer({
  radarId,
  organizerId,
  organizerBrand,
  commitmentPercent,
}) {
  // Fetch radar entry
  const { data: radar, error: radarErr } = await supabaseAdmin
    .from('sponsorship_radar')
    .select('*')
    .eq('id', radarId)
    .single();

  if (radarErr || !radar) {
    throw Object.assign(new Error('Radar entry not found'), { status: 404 });
  }

  if (radar.status === 'fully_funded' || radar.status === 'closed') {
    throw Object.assign(new Error('This radar entry is no longer accepting commitments'), { status: 400 });
  }

  if (organizerId === radar.main_organizer_id) {
    throw Object.assign(new Error('You cannot commit to your own tournament'), { status: 400 });
  }

  // Check minimum commitment
  if (commitmentPercent < 33) {
    throw Object.assign(new Error('Minimum commitment is 33%'), { status: 400 });
  }

  // Check max parties
  const existingCoOrgs = radar.co_organizers || [];
  const totalParties = 1 + existingCoOrgs.length; // main + existing co-orgs

  if (totalParties >= 3) {
    throw Object.assign(new Error('Maximum 3 parties already reached'), { status: 400 });
  }

  // Check if already committed
  const alreadyCommitted = existingCoOrgs.find((co) => co.organizer_id === organizerId);
  if (alreadyCommitted) {
    throw Object.assign(new Error('You have already committed to this tournament'), { status: 400 });
  }

  // Check total funding doesn't exceed 100%
  const currentFunding = radar.main_organizer_percent + existingCoOrgs.reduce((sum, co) => sum + co.percent, 0);
  if (currentFunding + commitmentPercent > 100) {
    throw Object.assign(
      new Error(`Cannot commit ${commitmentPercent}%. Only ${100 - currentFunding}% remaining.`),
      { status: 400 }
    );
  }

  // Determine label
  const role = commitmentPercent >= 66 ? 'sponsor' : 'co-organizer';

  // Calculate amount owed
  const totalCost = parseFloat(radar.total_cost);
  const commitmentAmount = Math.round(totalCost * (commitmentPercent / 100) * 100) / 100;
  const feeShare = calculatePlatformFee(commitmentAmount);
  const grandTotal = commitmentAmount + feeShare;

  // Build co-organizer entry
  const coOrgEntry = {
    organizer_id: organizerId,
    brand: organizerBrand,
    percent: commitmentPercent,
    role,
    amount: commitmentAmount,
    fee_share: feeShare,
    grand_total: grandTotal,
    access_granted: false,
    committed_at: new Date().toISOString(),
  };

  const updatedCoOrgs = [...existingCoOrgs, coOrgEntry];
  const newFundingPercent = currentFunding + commitmentPercent;
  const newStatus = newFundingPercent >= 100 ? 'fully_funded' : 'in_progress';
  const amountStillNeeded = Math.max(0, totalCost - (totalCost * newFundingPercent) / 100);

  // Update radar
  await supabaseAdmin
    .from('sponsorship_radar')
    .update({
      co_organizers: updatedCoOrgs,
      funding_percent: newFundingPercent,
      amount_still_needed: amountStillNeeded,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', radarId);

  // Update tournament co_organizers
  if (radar.tournament_id) {
    const { data: tournament } = await supabaseAdmin
      .from('tournaments')
      .select('co_organizers')
      .eq('id', radar.tournament_id)
      .single();

    const tournamentCoOrgs = [...(tournament?.co_organizers || []), coOrgEntry];
    await supabaseAdmin
      .from('tournaments')
      .update({
        co_organizers: tournamentCoOrgs,
        radar_funding_percent: newFundingPercent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', radar.tournament_id);
  }

  // Fetch organizer profile for bill
  const { data: orgProfile } = await supabaseAdmin
    .from('organizer_profiles')
    .select('brand_name')
    .eq('user_id', organizerId)
    .single();

  // Create bill for co-organizer
  const bill = await createBill({
    billType: 'co_organizer',
    tournamentId: radar.tournament_id,
    tournamentName: radar.tournament_name,
    payerId: organizerId,
    payerType: 'organizer',
    payerName: orgProfile?.brand_name || organizerBrand?.brand_name || 'Unknown',
    items: radar.order_breakdown || [],
    subtotal: commitmentAmount,
    platformFee: feeShare,
    grandTotal,
    sharedTournament: true,
    totalTournamentCost: totalCost,
  });

  // Create billing snapshot
  await createBillingSnapshot({
    tournamentId: radar.tournament_id,
    tournamentName: radar.tournament_name,
    tournamentType: 'shared',
    organizerId,
    organizerBrandName: orgProfile?.brand_name || '',
    billingType: 'shared_co',
    commitmentPercent,
    amountDue: grandTotal,
  });

  return { coOrgEntry, bill, radarStatus: newStatus };
}

/**
 * Calculate funding status for a radar entry.
 */
export function calculateFunding(radar) {
  const mainPercent = radar.main_organizer_percent || 33;
  const coOrgPercent = (radar.co_organizers || []).reduce((sum, co) => sum + co.percent, 0);
  const totalFunding = mainPercent + coOrgPercent;
  const amountStillNeeded = Math.max(0, radar.total_cost * ((100 - totalFunding) / 100));

  return {
    mainPercent,
    coOrgPercent,
    totalFunding,
    amountStillNeeded,
    isFullyFunded: totalFunding >= 100,
    slotsRemaining: Math.max(0, 3 - 1 - (radar.co_organizers || []).length),
  };
}
