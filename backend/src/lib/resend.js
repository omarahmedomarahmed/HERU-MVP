const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@heru.gg';

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

/**
 * Send a transactional email via the Resend API.
 *
 * @param {string} to       – recipient email
 * @param {string} subject  – email subject
 * @param {string} html     – email body (HTML)
 * @returns {Promise<object>} Resend API response
 */
export async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY not set – email not sent:', {
      to,
      subject,
    });
    return { id: null, skipped: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `HERU.gg <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[resend] Send failed:', res.status, text);
    throw new Error(`Resend API error ${res.status}: ${text}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Pre-built notification templates
// ---------------------------------------------------------------------------

/**
 * Notify a payer that a bill has been issued.
 */
export async function sendBillNotification(bill) {
  const subject = `HERU.gg — Invoice ${bill.bill_number}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0a0a0a; padding: 24px; text-align: center;">
        <h1 style="color: #ff1a1a; margin: 0;">HERU.gg</h1>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        <h2 style="margin-top: 0;">Invoice ${bill.bill_number}</h2>
        <p>Hello ${bill.payer_name || 'there'},</p>
        <p>A new invoice has been generated for you:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tournament</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${bill.tournament_name || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Due</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">EGP ${Number(bill.grand_total).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Due Date</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${bill.due_date || 'Upon receipt'}</td>
          </tr>
        </table>
        <p>
          <a href="${process.env.CORS_ORIGIN || 'https://heru.gg'}/bill/${bill.bill_number}"
             style="display: inline-block; background: #ff1a1a; color: #fff; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Invoice
          </a>
        </p>
      </div>
      <div style="padding: 16px; text-align: center; color: #888; font-size: 12px;">
        HERU.gg Esports Platform — MENA Region
      </div>
    </div>
  `;

  return sendEmail(bill.payer_email, subject, html);
}

/**
 * Send a tournament-related notification email.
 *
 * @param {object} tournament – tournament record
 * @param {'published'|'live'|'completed'|'co_org_joined'} type
 * @param {string|string[]} recipients – email address(es)
 */
export async function sendTournamentNotification(tournament, type, recipients) {
  const titles = {
    published: `Tournament "${tournament.name}" Published`,
    live: `Tournament "${tournament.name}" is LIVE`,
    completed: `Tournament "${tournament.name}" Completed`,
    co_org_joined: `New Co-Organizer joined "${tournament.name}"`,
  };

  const bodies = {
    published: `<p>The tournament <strong>${tournament.name}</strong> has been published and is now visible to gamers.</p>`,
    live: `<p>The tournament <strong>${tournament.name}</strong> is now live! Matches are underway.</p>`,
    completed: `<p>The tournament <strong>${tournament.name}</strong> has been completed. Check the results on the platform.</p>`,
    co_org_joined: `<p>A new co-organizer has joined <strong>${tournament.name}</strong>. Check the tournament dashboard for details.</p>`,
  };

  const subject = `HERU.gg — ${titles[type] || tournament.name}`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0a0a0a; padding: 24px; text-align: center;">
        <h1 style="color: #ff1a1a; margin: 0;">HERU.gg</h1>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        ${bodies[type] || `<p>Update for tournament: ${tournament.name}</p>`}
        <p>
          <a href="${process.env.CORS_ORIGIN || 'https://heru.gg'}/tournaments/${tournament.id}"
             style="display: inline-block; background: #ff1a1a; color: #fff; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Tournament
          </a>
        </p>
      </div>
      <div style="padding: 16px; text-align: center; color: #888; font-size: 12px;">
        HERU.gg Esports Platform — MENA Region
      </div>
    </div>
  `;

  return sendEmail(recipients, subject, html);
}
