import { supabaseAdmin } from '../lib/supabase.js';

/**
 * In-app notification helpers.
 *
 * Notifications are stored in the gamer_profiles.notifications JSONB column
 * as an array of objects. For organizers and staff we use a lightweight
 * approach — the notification is stored and can be polled by the frontend.
 */

/**
 * Create an in-app notification for a gamer by appending to their
 * gamer_profiles.notifications JSONB array.
 *
 * @param {string} userId  – the user's auth.users id
 * @param {string} type    – notification type (e.g. 'tournament_invite', 'gig_request', 'team_join', 'order_update')
 * @param {string} title   – short title
 * @param {string} message – notification body
 * @param {string} [link]  – optional in-app route to navigate to
 * @returns {Promise<object|null>} the updated profile, or null if user has no gamer profile
 */
export async function createNotification(userId, type, title, message, link = null) {
  // Fetch current notifications
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from('gamer_profiles')
    .select('notifications')
    .eq('user_id', userId)
    .single();

  if (fetchError || !profile) {
    // User might not be a gamer — silently skip
    console.warn(`[notifications] No gamer profile for user ${userId}, skipping notification.`);
    return null;
  }

  const currentNotifications = profile.notifications || [];

  const notification = {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    link,
    read: false,
    created_at: new Date().toISOString(),
  };

  // Prepend new notification (newest first), cap at 100
  const updatedNotifications = [notification, ...currentNotifications].slice(0, 100);

  const { data, error } = await supabaseAdmin
    .from('gamer_profiles')
    .update({
      notifications: updatedNotifications,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[notifications] Failed to save notification:', error);
    throw error;
  }

  return data;
}

/**
 * Mark a specific notification as read.
 *
 * @param {string} userId         – the user's auth.users id
 * @param {string} notificationId – the notification's id within the JSONB array
 */
export async function markNotificationRead(userId, notificationId) {
  const { data: profile } = await supabaseAdmin
    .from('gamer_profiles')
    .select('notifications')
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  const notifications = (profile.notifications || []).map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );

  const { data, error } = await supabaseAdmin
    .from('gamer_profiles')
    .update({ notifications, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark all notifications as read for a user.
 *
 * @param {string} userId – the user's auth.users id
 */
export async function markAllNotificationsRead(userId) {
  const { data: profile } = await supabaseAdmin
    .from('gamer_profiles')
    .select('notifications')
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  const notifications = (profile.notifications || []).map((n) => ({ ...n, read: true }));

  const { data, error } = await supabaseAdmin
    .from('gamer_profiles')
    .update({ notifications, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Notify all parties involved in a tournament.
 * This sends in-app notifications to:
 * - The main organizer (if they have a gamer profile — unlikely but safe)
 * - All co-organizers
 * - All talent users booked for the tournament
 * - All team members of registered teams
 *
 * @param {object} tournament – the tournament record
 * @param {string} type       – notification type
 * @param {string} message    – notification body
 */
export async function notifyTournamentParties(tournament, type, message) {
  const title = tournament.name || 'Tournament Update';
  const link = `/tournaments/${tournament.id}`;
  const userIds = new Set();

  // Main organizer
  if (tournament.organizer_id) userIds.add(tournament.organizer_id);
  if (tournament.main_organizer_id) userIds.add(tournament.main_organizer_id);

  // Co-organizers
  const coOrgs = tournament.co_organizers || [];
  for (const co of coOrgs) {
    if (co.organizer_id) userIds.add(co.organizer_id);
  }

  // Talents
  const talents = tournament.talents || [];
  for (const talent of talents) {
    if (talent.user_id) userIds.add(talent.user_id);
  }

  // Team members — fetch all teams registered in the tournament
  const teamIds = tournament.teams || [];
  if (teamIds.length > 0) {
    const { data: teams } = await supabaseAdmin
      .from('teams')
      .select('members, leader_id')
      .in('id', teamIds);

    if (teams) {
      for (const team of teams) {
        if (team.leader_id) userIds.add(team.leader_id);
        for (const memberId of team.members || []) {
          userIds.add(memberId);
        }
      }
    }
  }

  // Send notifications in parallel (fire-and-forget for each)
  const promises = [...userIds].map((userId) =>
    createNotification(userId, type, title, message, link).catch((err) => {
      console.warn(`[notifications] Failed to notify user ${userId}:`, err.message);
    })
  );

  await Promise.allSettled(promises);
}
