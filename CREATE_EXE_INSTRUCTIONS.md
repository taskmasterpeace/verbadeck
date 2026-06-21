# Creating VerbaDeck.exe - Simple Launcher

## Method 1: Using Bat To Exe Converter (Recommended - Free!)

### **Download the Tool:**
1. Go to: https://www.f2ko.de/en/b2e.php
2. Download "Bat To Exe Converter" (free, no registration)
3. Install and run

### **Convert to .EXE:**
1. Open "Bat To Exe Converter"
2. Click "Open" → Select `VerbaDeck-Launcher.bat`
3. **Settings:**
   - **Application Title:** VerbaDeck
   - **Application Version:** 1.0.0
   - **Company:** Machine King Labs
   - **Icon:** Select `client/public/icon.ico`
   - **Execution:** Visible application
   - **Architecture:** x64
4. Click **"Compile"**
5. Save as: `VerbaDeck.exe`
6. **Done!** Double-click VerbaDeck.exe to launch

---

## Method 2: Using IExpress (Built into Windows - No Download!)

### **Step-by-Step:**

1. Press `Win+R` → Type `iexpress` → Press Enter
2. Select "Create new Self Extraction Directive file" → Next
3. Select "Extract files and run an installation command" → Next
4. Package title: **VerbaDeck Launcher** → Next
5. No prompt → Next
6. Do not display license → Next
7. Add files:
   - Click "Add" → Select `VerbaDeck-Launcher.bat`
   - Click "Add" → Select `client/public/icon.ico`
   → Next
8. Install Program: `VerbaDeck-Launcher.bat` → Next
9. Show window: "Default (recommended)" → Next
10. Finished message: "VerbaDeck is starting..." → Next
11. Browse → Save as `VerbaDeck.exe` → Next
12. No restart → Next
13. Save directive: Optional → Next
14. Click **"Next"** to create package
15. **Done!** VerbaDeck.exe is ready

---

## Method 3: Online Converter (Easiest - No Install!)

### **Quick Steps:**
1. Go to: https://bat-to-exe-converter-x64.en.softonic.com/download
   OR: https://convertio.co/bat-exe/ (online)
2. Upload `VerbaDeck-Launcher.bat`
3. Download `VerbaDeck.exe`
4. Move to VerbaDeck folder
5. **Done!**

---

## Testing Your .EXE

1. **Close all node.exe processes:**
   ```bash
   taskkill /F /IM node.exe
   ```

2. **Double-click VerbaDeck.exe**
   - Should see green terminal window
   - "Starting VerbaDeck servers..."
   - Browser opens automatically after 8 seconds
   - Go to http://localhost:5173

3. **To stop:**
   - Close the terminal window
   - Or press Ctrl+C

---

## 🎨 Making it Professional

### **Add Custom Icon:**
1. Use existing `client/public/icon.ico`
2. Or create new icon:
   - Use https://www.icoconverter.com/
   - Upload `client/public/logo.png`
   - Download as `.ico`
   - Replace `client/public/icon.ico`

### **Add to Start Menu:**
1. Right-click `VerbaDeck.exe`
2. Select "Pin to Start"
3. **Done!** VerbaDeck in Start Menu

### **Create Desktop Shortcut:**
1. Right-click `VerbaDeck.exe`
2. Send to → Desktop (create shortcut)
3. Rename: "VerbaDeck - Voice Presentations"
4. **Done!** Desktop icon

---

## 📦 Distribution

Once you have `VerbaDeck.exe`:

### **Share with Others:**
1. Zip the entire VerbaDeck folder
2. Include:
   - `VerbaDeck.exe`
   - All project files
   - `.env.example` (NOT .env!)
   - README.md
3. Recipients:
   - Unzip
   - Create `.env` with their API keys
   - Double-click `VerbaDeck.exe`
   - Done!

### **Or Create Installer:**
Use Inno Setup (free) to create `VerbaDeck-Setup.exe`:
- Proper Windows installer
- Installs to Program Files
- Start Menu shortcuts
- Uninstaller

---

## 🚀 Recommended Approach

**For you personally:**
→ Use **Bat To Exe Converter** (Method 1)
→ Takes 5 minutes
→ Professional, customizable icon
→ Works perfectly

**For distribution:**
→ Create installer with Inno Setup
→ Or just zip entire folder with .exe

---

**Want me to help you create the .exe right now?** I can guide you through Bat To Exe Converter or we can use IExpress (already on your PC).
