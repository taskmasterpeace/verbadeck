# How to Create a Desktop Shortcut for VerbaDeck

## Option 1: Simple Drag-and-Drop

1. **Find the batch file:**
   - Navigate to `c:\git\verbadeck\`
   - Look for `start-verbadeck.bat` (basic launcher)
   - OR `start-verbadeck-with-browser.bat` (auto-opens browser)

2. **Create shortcut:**
   - **Right-click** the `.bat` file
   - Select **"Send to" → "Desktop (create shortcut)"**

3. **Done!** Double-click the desktop shortcut to start VerbaDeck

---

## Option 2: Custom Shortcut with Icon

### Step 1: Create the Shortcut

1. **Right-click** on your Desktop
2. Select **"New" → "Shortcut"**
3. **Browse** to the batch file location:
   ```
   C:\git\verbadeck\start-verbadeck-with-browser.bat
   ```
4. Click **"Next"**
5. Name it: **VerbaDeck**
6. Click **"Finish"**

### Step 2: Customize the Shortcut (Optional)

1. **Right-click** the new shortcut → **"Properties"**

2. **Change the icon** (if you want):
   - Click **"Change Icon..."**
   - Click **"Browse..."**
   - Navigate to: `C:\git\verbadeck\client\public\icon.ico`
   - Click **"OK"** → **"OK"**

3. **Make it start minimized** (optional):
   - In Properties, find **"Run:"**
   - Change to **"Minimized"**
   - Click **"Apply"** → **"OK"**

---

## Which Batch File Should You Use?

### `start-verbadeck.bat`
- Starts server and client
- Does NOT auto-open browser
- You manually go to http://localhost:5173

### `start-verbadeck-with-browser.bat` (RECOMMENDED)
- Starts server and client
- **Automatically opens your browser** after 5 seconds
- Ready to use immediately

---

## How to Use

1. **Double-click** the desktop shortcut
2. **Wait** ~5-10 seconds for servers to start
3. **Browser opens automatically** (if using "with-browser" version)
4. **Start creating presentations!**

---

## Stopping VerbaDeck

- Go to the command window that opened
- Press **Ctrl+C** (may need to press twice)
- Or just **close the window**

---

## Troubleshooting

### "npm is not recognized"
- You need to install Node.js first
- Download from: https://nodejs.org/

### "Cannot find module"
- Run `npm install` in the `c:\git\verbadeck\` folder first

### Port already in use
- VerbaDeck is already running
- Close the existing window first

### Browser doesn't open automatically
- Just open your browser manually
- Go to: http://localhost:5173
