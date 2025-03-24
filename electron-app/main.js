const { app, BrowserWindow } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

const localhostUrl = "http://127.0.0.1:5050";
let mainWindow;
let flaskProcess;

app.setName("Archaeoptics"); // Override the lowercase app name in the menu bar

function waitForServer(url, callback) {
    let attempts = 0;
    function checkServer() {
        http.get(url, (res) => {
            if (res.statusCode === 200) {
                callback();
            } else {
                retry();
            }
        }).on('error', retry);
    }
    function retry() {
        if (attempts < 10) {
            attempts++;
            setTimeout(checkServer, 500);
        } else {
            console.error("Flask server did not start in time");
        }
    }
    checkServer();
}

app.on('ready', () => {
    let flaskExecutable = path.join(process.resourcesPath, 'app');

    // Ensure the binary exists
    if (!require('fs').existsSync(flaskExecutable)) {
        console.error("Flask binary not found:", flaskExecutable);
        return;
    }

    flaskProcess = spawn(flaskExecutable, [], { cwd: path.dirname(flaskExecutable) });

    mainWindow = new BrowserWindow({
        width: 650,
        height: 400,
        frame: false,  // 🔥 Removes the title bar
        titleBarStyle: 'hidden',  // 🔥 Hides the title bar but keeps the stoplight buttons
        trafficLightPosition: { x: 15, y: 15 },
        icon: path.join(__dirname, 'icons/png/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Needed for Electron 12
            enableRemoteModule: true, // Needed for some Electron versions
            webSecurity: false, // Disable CORS security policies
            allowRunningInsecureContent: true, // Allow loading mixed content (HTTP and HTTPS)
            experimentalFeatures: true, // Enable experimental Web Speech API features
            media: { audio: true }, 
        }
    });

    // Wait for Flask to be ready before loading the page
    waitForServer(localhostUrl, () => {
        mainWindow.loadFile(path.join(__dirname, "index.html"));
    });

    app.on('before-quit', async (event) => {
        event.preventDefault(); // Prevent immediate quit
        try {    
            await fetch(`${localhostUrl}/cleanup`);
        } catch (err) {
            console.error("Error sending cleanup to Flask:", err.message);
        }
    
        try {
            if (flaskProcess && !flaskProcess.killed) {
                flaskProcess.kill('SIGTERM'); // Try graceful shutdown
            }
        } catch (err) {
            console.error("Error killing Flask process:", err.message);
        }
    
        app.exit(); // Now it's safe to quit
    });
});
