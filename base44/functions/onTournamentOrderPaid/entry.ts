import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Triggered by entity automation when TournamentOrder payment_status changes to 'paid'
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;

    if (!data) {
      return Response.json({ ok: true, message: 'No data payload' });
    }

    const order = data;
    const tournamentId = order.tournament_id;
    const tournamentName = order.tournament_name || 'Unknown Tournament';

    if (!tournamentId) {
      return Response.json({ ok: true, message: 'No tournament_id' });
    }

    // Fetch tournament to get talents list
    const tournaments = await base44.asServiceRole.entities.Tournament.list();
    const tournament = tournaments.find(t => t.id === tournamentId);

    if (!tournament || !tournament.talents?.length) {
      return Response.json({ ok: true, message: 'No talents to notify' });
    }

    const notified = [];

    for (const talent of tournament.talents) {
      if (!talent.user_id) continue;

      const profiles = await base44.asServiceRole.entities.GamerProfile.filter({ user_id: talent.user_id });
      if (!profiles.length) continue;

      const gamerProfile = profiles[0];
      const notification = {
        id: `gig_${tournamentId}_${talent.user_id}_${Date.now()}`,
        type: 'gig_request',
        message: `New gig available: ${tournamentName} — ${talent.talent_type} for EGP ${(talent.price || 0).toLocaleString()}. View your Gig Requests.`,
        read: false,
        created_at: new Date().toISOString(),
        link: '/gigs',
      };

      const existingNotifications = gamerProfile.notifications || [];
      await base44.asServiceRole.entities.GamerProfile.update(gamerProfile.id, {
        notifications: [...existingNotifications, notification],
      });

      notified.push(talent.user_id);
    }

    return Response.json({ ok: true, notified_count: notified.length, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});