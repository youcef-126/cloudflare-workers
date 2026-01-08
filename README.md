# Cloudflare Workers

A collection of Cloudflare Workers for webhooks and automation tasks.

## Overview

This repository contains serverless functions deployed on Cloudflare's edge network. Each worker is designed to handle specific webhook integrations and automation workflows.

## Workers

### PhantomBuster Webhook

Receives webhook payloads from PhantomBuster, logs them, and forwards via email.

**File:** [src/phantombuster-webhook.js](src/phantombuster-webhook.js)

**Features:**
- Health check endpoint (GET)
- Webhook payload logging to Cloudflare console
- Email forwarding via Resend API
- JSON response with payload details

## Prerequisites

- [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [Resend Account](https://resend.com/) (for email functionality)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Login to Cloudflare:
```bash
npx wrangler login
```

## Configuration

### Local Development Environment

1. Copy the example environment file:
```bash
cp .env.example .dev.vars
```

2. Edit `.dev.vars` and add your actual credentials:
```bash
RESEND_API_KEY=your_actual_api_key
EMAIL_FROM=webhooks@yourdomain.com
```

The `.dev.vars` file is automatically loaded by `wrangler dev` and is gitignored for security.

### Production Environment Variables

For production deployment, set secrets using Wrangler:

```bash
# Set Resend API key
npx wrangler secret put RESEND_API_KEY

# Set email sender address
npx wrangler secret put EMAIL_FROM
```

### Wrangler Configuration

Edit [wrangler.toml](wrangler.toml) to configure worker settings:
- Worker name
- Compatibility date
- Routes and domains
- Public environment variables

## Development

Run worker locally:

```bash
npm run dev
```

The worker will be available at `http://localhost:8787`

Test the endpoint:

```bash
# Health check
curl http://localhost:8787

# Test webhook
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Deployment

### Manual Deployment

Deploy to Cloudflare manually:

```bash
npm run deploy
```

View live logs:

```bash
npm run tail
```

### Automatic Deployment (GitHub Actions)

This repository includes a GitHub Actions workflow that automatically deploys to Cloudflare Workers on push to `main` or `master` branch.

#### Setup GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - Create at: https://dash.cloudflare.com/profile/api-tokens
   - Use "Edit Cloudflare Workers" template or create custom token with Workers permissions

2. `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare Account ID
   - Find at: https://dash.cloudflare.com/ (right sidebar)

3. `RESEND_API_KEY` - Your Resend API key
   - Value: `re_Z1swq6aj_F1eDM64y4Wu4oFF7KaqX25z7`

4. `EMAIL_FROM` - Email sender address
   - Example: `webhooks@expanso.io`

Once configured, every push to the main branch will automatically deploy your workers.

## Project Structure

```
cloudflare-workers/
├── src/
│   └── phantombuster-webhook.js    # PhantomBuster webhook handler
├── package.json                     # Node dependencies
├── wrangler.toml                    # Cloudflare Worker configuration
└── README.md                        # This file
```

## Adding New Workers

1. Create a new JavaScript file in `src/`
2. Add a new section in `wrangler.toml` or create a separate config file
3. Implement the fetch handler with proper documentation
4. Update this README with worker details

Example worker structure:

```javascript
/**
 * Worker description
 */
export default {
  async fetch(request, env) {
    // Handler logic
    return new Response("Hello");
  },
};
```

## Useful Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Deploy to production
npm run deploy

# View live logs
npm run tail

# List deployments
npx wrangler deployments list

# Rollback deployment
npx wrangler rollback

# Delete worker
npx wrangler delete
```

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Resend API Documentation](https://resend.com/docs)
- [PhantomBuster API](https://phantombuster.com/api-documentation)

## License

MIT
