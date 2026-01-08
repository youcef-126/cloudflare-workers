/**
 * PhantomBuster Webhook Handler
 *
 * This Cloudflare Worker receives webhook payloads from PhantomBuster and:
 * 1. Logs the payload to Cloudflare's console
 * 2. Forwards the payload via email using Resend API
 * 3. Returns the payload in the HTTP response
 *
 * @see https://developers.cloudflare.com/workers/
 * @see https://resend.com/docs/api-reference/emails/send-email
 */

/**
 * Main fetch handler for incoming requests
 *
 * @param {Request} request - The incoming HTTP request
 * @param {Object} env - Environment variables and secrets
 * @param {string} env.RESEND_API_KEY - Resend API key (set via wrangler secret)
 * @param {string} env.EMAIL_FROM - Email sender address (set via wrangler secret)
 * @returns {Response} HTTP response
 */
export default {
  async fetch(request, env) {
    // Handle GET requests (health check)
    if (request.method === "GET") {
      return new Response("ok");
    }

    // Only accept POST requests
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Validate required environment variables
    const apiKey = env.RESEND_API_KEY;
    const from = env.EMAIL_FROM;
    const to = "mahmoud@expanso.io";

    if (!apiKey || !from) {
      return new Response("Missing RESEND_API_KEY or EMAIL_FROM", { status: 500 });
    }

    // Extract request details
    const contentType = request.headers.get("content-type") || "";
    const rawPayload = await request.text();
    const timestamp = new Date().toISOString();

    // 1. Log payload to Cloudflare console
    console.log("PHANTOMBUSTER PAYLOAD:");
    console.log(rawPayload);

    // 2. Send payload via email using Resend
    const subject = `PhantomBuster Webhook ${timestamp}`;
    const html = buildEmailHtml(timestamp, contentType, rawPayload);

    const emailResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    const emailResult = await emailResp.text();

    if (!emailResp.ok) {
      console.log("RESEND ERROR:", emailResult);
    }

    // 3. Return payload in HTTP response
    return new Response(
      JSON.stringify({
        receivedAt: timestamp,
        contentType,
        payload: rawPayload,
        emailStatus: emailResp.status,
      }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};

/**
 * Builds HTML email content with formatted payload
 *
 * @param {string} timestamp - ISO 8601 timestamp
 * @param {string} contentType - Request content-type header
 * @param {string} rawPayload - Raw webhook payload
 * @returns {string} HTML email content
 */
function buildEmailHtml(timestamp, contentType, rawPayload) {
  return `
    <h3>PhantomBuster Webhook</h3>
    <p>Time: ${timestamp}</p>
    <p>Content-Type: ${contentType}</p>
    <pre style="background:#f4f4f4;padding:12px;border-radius:6px;white-space:pre-wrap">${escapeHtml(rawPayload)}</pre>
  `;
}

/**
 * Escapes HTML special characters to prevent injection
 *
 * @param {string} s - String to escape
 * @returns {string} HTML-safe string
 */
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
