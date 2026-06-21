# VerbaDeck V2.0 - Deployment Checklist

**Version:** 2.0
**Last Updated:** November 9, 2025

---

## Pre-Deployment Checklist

### Code Quality & Testing
- [ ] All TypeScript compilation errors resolved
- [ ] ESLint shows no critical errors
- [ ] Run full test suite: `npx playwright test`
- [ ] Manual testing of core features completed
- [ ] Voice control tested in all modes
- [ ] BroadcastChannel sync verified with two windows
- [ ] File save/load tested
- [ ] Library operations tested

### Environment Configuration
- [ ] `.env` file configured on server
- [ ] AssemblyAI API key obtained and tested
- [ ] OpenRouter API key obtained and tested
- [ ] Replicate API token obtained and tested (for image generation)
- [ ] API keys validated with test requests

### Build & Bundle
- [ ] Production build succeeds: `npm run build:client`
- [ ] No build warnings (or documented/ignored)
- [ ] Bundle size reviewed (currently 1.16 MB JS, 69 KB CSS)
- [ ] Static assets present in `client/dist/`
- [ ] Service worker generated (PWA support)

### Server Configuration
- [ ] Node.js version verified (v18+ recommended)
- [ ] CORS settings reviewed for production domain
- [ ] WebSocket proxy tested
- [ ] Health check endpoint responds: `GET /health`
- [ ] API endpoints tested: `/api/models`, `/api/process-script`

### Client Configuration
- [ ] Update `WS_URL` in `client/src/lib/api-config.ts` for production
- [ ] Update API base URL if different from default
- [ ] HTTPS configured (required for microphone access)
- [ ] Domain/subdomain configured
- [ ] SSL certificate installed and valid

---

## Deployment Steps

### Step 1: Server Deployment

#### Option A: Traditional Server (VPS, EC2, etc.)
```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone repository (or upload files)
git clone https://github.com/your-org/verbadeck.git
cd verbadeck

# 3. Install dependencies
npm install

# 4. Set environment variables
cat > .env << EOF
AAI_API_KEY=your_assemblyai_key
OPENROUTER_API_KEY=your_openrouter_key
REPLICATE_API_TOKEN=your_replicate_token
EOF

# 5. Start server
cd server
npm install
npm start  # Production mode

# Or use PM2 for process management
npm install -g pm2
pm2 start server.js --name verbadeck-server
pm2 save
pm2 startup
```

#### Option B: Docker Deployment
```bash
# 1. Create Dockerfile for server (example)
cat > Dockerfile << EOF
FROM node:18
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ ./
EXPOSE 3001
CMD ["node", "server.js"]
EOF

# 2. Build and run
docker build -t verbadeck-server .
docker run -d \
  -p 3001:3001 \
  -e AAI_API_KEY=your_key \
  -e OPENROUTER_API_KEY=your_key \
  -e REPLICATE_API_TOKEN=your_key \
  --name verbadeck \
  verbadeck-server
```

#### Option C: Serverless (AWS Lambda, Cloud Functions)
```bash
# Note: WebSocket proxy requires persistent connection
# Not recommended for serverless unless using API Gateway WebSocket support
```

### Step 2: Client Deployment

#### Option A: Static Hosting (Netlify, Vercel, Cloudflare Pages)

**Netlify:**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build client
npm run build:client

# 3. Deploy
cd client
netlify deploy --prod --dir=dist

# 4. Configure environment (if needed)
# In Netlify dashboard: Site settings > Environment variables
```

**Vercel:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build client
npm run build:client

# 3. Deploy
cd client
vercel --prod
```

**Cloudflare Pages:**
```bash
# Via Cloudflare dashboard:
# 1. Connect Git repository
# 2. Build command: npm run build:client
# 3. Build output directory: client/dist
# 4. Deploy
```

#### Option B: S3 + CloudFront (AWS)
```bash
# 1. Build client
npm run build:client

# 2. Upload to S3
aws s3 sync client/dist/ s3://your-bucket-name/ --acl public-read

# 3. Create CloudFront distribution pointing to S3
# 4. Configure custom domain and SSL certificate
```

#### Option C: Self-Hosted (Nginx)
```bash
# 1. Build client
npm run build:client

# 2. Copy to web server
scp -r client/dist/* user@server:/var/www/verbadeck/

# 3. Configure Nginx
cat > /etc/nginx/sites-available/verbadeck << EOF
server {
    listen 80;
    server_name verbadeck.example.com;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name verbadeck.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/verbadeck;
    index index.html;

    # SPA routing - all routes serve index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to Node.js server
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

# 4. Enable site and restart Nginx
ln -s /etc/nginx/sites-available/verbadeck /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Post-Deployment Verification

### Automated Checks
```bash
# 1. Server health check
curl https://api.verbadeck.example.com/health
# Expected: {"status":"ok"}

# 2. Models endpoint
curl https://api.verbadeck.example.com/api/models
# Expected: JSON array of models

# 3. Client loads
curl -I https://verbadeck.example.com
# Expected: 200 OK

# 4. WebSocket connection (use wscat or browser console)
wscat -c wss://api.verbadeck.example.com/ws
# Expected: Connection accepted
```

### Manual Testing Checklist

#### Basic Functionality
- [ ] Homepage loads without errors
- [ ] No console errors (check browser DevTools)
- [ ] All navigation routes work (/, /create/scratch, /editor, /presenter, etc.)
- [ ] Images load correctly
- [ ] Footer displays correctly

#### Voice Control
- [ ] Voice button appears in top bar
- [ ] Clicking voice button requests microphone permission
- [ ] Microphone permission granted successfully
- [ ] "Listening" indicator appears when streaming
- [ ] Speaking shows transcript in bottom bar
- [ ] Trigger words advance slides
- [ ] Back command ("back", "previous") works
- [ ] Debounce prevents double-advance (2-second cooldown)

#### Q&A Mode
- [ ] Q&A button appears in presenter mode
- [ ] Toggle Q&A mode ON
- [ ] Ask question ending with "?" (e.g., "What is VerbaDeck?")
- [ ] Question detected and shown in modal
- [ ] Two answer options generated
- [ ] Answer formats: heading, brief, bullets, full
- [ ] Cancel word ("cancel") interrupts generation
- [ ] Tone selector changes answer style

#### Data Persistence
- [ ] Create presentation with multiple sections
- [ ] Wait 30 seconds (auto-save)
- [ ] Check browser console for "Auto-saved presentation" message
- [ ] Refresh page - presentation persists
- [ ] Save presentation (Ctrl+S or Save button)
- [ ] Download .verbadeck file
- [ ] Load presentation from file
- [ ] Sections restored correctly
- [ ] Save to library with name
- [ ] Load from library
- [ ] Delete from library

#### BroadcastChannel Sync
- [ ] Create presentation with 3+ sections
- [ ] Navigate to presenter mode
- [ ] Click "Open Audience View (Dual Monitor)"
- [ ] Audience window opens (new tab/window)
- [ ] Audience shows same slide as presenter
- [ ] Navigate to next slide in presenter
- [ ] Audience updates automatically
- [ ] Navigate back in presenter
- [ ] Audience updates automatically
- [ ] Close and reopen audience window
- [ ] Audience requests and receives current state

#### Multi-Screen Support
- [ ] Connect second monitor
- [ ] Open presenter view
- [ ] Click "Open Audience View"
- [ ] Audience view opens on second screen (if Window Management API supported)
- [ ] Audience view enters fullscreen mode
- [ ] Sync works across screens

#### Image Generation
- [ ] Create section in editor
- [ ] Click "Generate with AI" button
- [ ] Modal opens with prompt editor
- [ ] Select aspect ratio (16:9, 1:1, etc.)
- [ ] Select format (PNG/JPG)
- [ ] Click "Generate Image"
- [ ] Image generates and displays
- [ ] Image appears in section
- [ ] Bulk generate images for all sections
- [ ] Progress indicator shows during generation

#### Keyboard Shortcuts
- [ ] Press Ctrl+/ - keyboard shortcuts help opens
- [ ] Press Ctrl+S - save presentation
- [ ] Press Ctrl+O - open file picker
- [ ] Press Ctrl+N - new presentation (with confirmation)
- [ ] Press Ctrl+L - library opens
- [ ] Press Ctrl+P - presenter mode
- [ ] Press Ctrl+K - Know It All mode
- [ ] Press Ctrl+H - home/create view
- [ ] Press Ctrl+Space - toggle voice control

#### Know It All Wall
- [ ] Navigate to Know It All Wall (/know-it-all)
- [ ] Select preset (e.g., "Machine King Labs")
- [ ] Content loads
- [ ] Click "Start Session"
- [ ] Voice starts listening
- [ ] Ask question with "?"
- [ ] Question card appears on wall
- [ ] AI generates and displays question
- [ ] Click "Stop Session"
- [ ] Export session shows button
- [ ] Click "Clear" - confirmation modal appears

#### PWA Installation
- [ ] In Chrome: Check for "Install" icon in address bar
- [ ] Click install
- [ ] App installs as standalone
- [ ] Launch installed app
- [ ] Works offline (cached assets)

---

## Rollback Procedure

### If Deployment Fails

#### Server Rollback
```bash
# 1. Stop current server
pm2 stop verbadeck-server  # If using PM2
# Or: kill $(lsof -t -i:3001)

# 2. Restore previous version
git checkout <previous-commit-hash>
cd server
npm install
npm start

# 3. Verify health
curl http://localhost:3001/health
```

#### Client Rollback
```bash
# 1. Restore previous dist folder
cd client
rm -rf dist
git checkout <previous-commit-hash> dist/

# 2. Redeploy
netlify deploy --prod --dir=dist
# Or upload to S3/server
```

### Emergency Maintenance Page
```html
<!-- maintenance.html -->
<!DOCTYPE html>
<html>
<head>
    <title>VerbaDeck - Maintenance</title>
    <style>
        body {
            font-family: sans-serif;
            text-align: center;
            padding: 50px;
        }
    </style>
</head>
<body>
    <h1>VerbaDeck is undergoing maintenance</h1>
    <p>We'll be back shortly. Thank you for your patience.</p>
</body>
</html>
```

---

## Monitoring & Maintenance

### Health Monitoring

#### Uptime Monitoring
```bash
# Use services like:
# - UptimeRobot (https://uptimerobot.com)
# - Pingdom (https://pingdom.com)
# - Better Uptime (https://betteruptime.com)

# Monitor:
# - https://verbadeck.example.com (200 OK)
# - https://api.verbadeck.example.com/health (200 OK)
```

#### Log Monitoring
```bash
# Server logs (if using PM2)
pm2 logs verbadeck-server

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
# Add logging service (e.g., LogRocket, Sentry)
```

#### Performance Monitoring
```bash
# Use services like:
# - Lighthouse CI
# - WebPageTest
# - Google Analytics (page load times)
```

### Regular Maintenance

#### Weekly
- [ ] Check server logs for errors
- [ ] Review API usage (AssemblyAI, OpenRouter credits)
- [ ] Monitor disk space (uploaded files, logs)
- [ ] Check SSL certificate expiry date

#### Monthly
- [ ] Update dependencies: `npm outdated`
- [ ] Security audit: `npm audit`
- [ ] Review and rotate API keys (if needed)
- [ ] Backup database/localStorage data (if applicable)

#### Quarterly
- [ ] Load testing with realistic traffic
- [ ] Review and optimize bundle size
- [ ] Update documentation
- [ ] Review feature requests and bug reports

---

## Troubleshooting

### Common Issues

#### Issue: Microphone not working
**Symptoms:** No transcript, "Permission denied" error
**Solution:**
1. Verify HTTPS is enabled (required for microphone)
2. Check browser console for permission errors
3. Ensure microphone permission granted in browser settings
4. Test in Chrome DevTools > Application > Permissions

#### Issue: WebSocket connection fails
**Symptoms:** "Connection error", voice control doesn't start
**Solution:**
1. Verify server is running: `curl http://localhost:3001/health`
2. Check WebSocket URL in `client/src/lib/api-config.ts`
3. Verify firewall allows WebSocket connections
4. Check Nginx WebSocket proxy configuration

#### Issue: BroadcastChannel not syncing
**Symptoms:** Audience view doesn't update when presenter navigates
**Solution:**
1. Verify both windows are on same origin (domain)
2. Check browser console for BroadcastChannel errors
3. Ensure browser supports BroadcastChannel (Chrome 54+, Firefox 38+)
4. Test in same-origin context (localhost or same domain)

#### Issue: AI generation fails
**Symptoms:** "Error generating answer", empty responses
**Solution:**
1. Verify API keys are set: `echo $OPENROUTER_API_KEY`
2. Check API key validity with test request
3. Review server logs for API errors
4. Check API credit balance (AssemblyAI, OpenRouter)
5. Verify network connectivity from server

#### Issue: Large bundle size warning
**Symptoms:** Build warns about 500 KB+ chunks
**Solution:**
1. Implement code splitting (lazy loading)
2. Use manual chunks in Vite config
3. Analyze bundle: `npx vite-bundle-visualizer`
4. Lazy load heavy dependencies (TipTap, Framer Motion)

#### Issue: Auto-save not working
**Symptoms:** No "Auto-saved" message in console
**Solution:**
1. Verify localStorage is enabled in browser
2. Check browser console for quota errors
3. Clear localStorage if corrupted: `localStorage.clear()`
4. Verify auto-save interval (30 seconds)

---

## Security Best Practices

### API Keys
- [ ] Never commit API keys to version control
- [ ] Use environment variables on server
- [ ] Rotate keys regularly (quarterly)
- [ ] Restrict API key permissions (if possible)

### HTTPS/SSL
- [ ] Always use HTTPS in production
- [ ] Auto-renew SSL certificates (Let's Encrypt)
- [ ] Enable HSTS headers
- [ ] Use strong cipher suites

### CORS
- [ ] Restrict CORS to known domains
- [ ] Don't use `Access-Control-Allow-Origin: *` in production
- [ ] Verify origin on WebSocket connections

### Rate Limiting
- [ ] Implement rate limiting on API endpoints
- [ ] Prevent abuse of AI generation endpoints
- [ ] Monitor unusual traffic patterns

### Input Validation
- [ ] Validate file uploads (size, type)
- [ ] Sanitize user input (already handled by React)
- [ ] Limit request payload sizes

---

## Support & Documentation

### User Documentation
- **User Guide:** `client/public/USER_GUIDE.md`
- **Quick Start:** `QUICKSTART.md`
- **README:** `README.md`

### Developer Documentation
- **CLAUDE.md:** AI assistant instructions and architecture
- **FINAL_VALIDATION_REPORT.md:** Comprehensive validation report
- **DEPLOYMENT_CHECKLIST.md:** This document

### Getting Help
- GitHub Issues: https://github.com/your-org/verbadeck/issues
- Email: support@machinekingslabs.com
- Documentation: https://verbadeck.example.com/USER_GUIDE.md

---

## Changelog

### v2.0 (November 9, 2025)
- Complete refactoring with router-based navigation
- 3-panel editor workspace
- Enhanced keyboard shortcuts (15+ shortcuts)
- Know It All Wall standalone mode
- Session statistics and export
- Presentation style presets
- Bulk image generation
- Speaker notes support
- PWA support with service worker

### v1.0 (October 2024)
- Initial release
- Voice-triggered slide advancement
- AI script processing
- Live Q&A mode
- Dual-monitor presentation
- Image upload for slides

---

*End of Deployment Checklist*
