const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("flask-ready"); // Notify main.js that frontend is ready

    ipcRenderer.on("flask-status", (event, status) => {
        console.log(`Flask Backend: ${status ? "Running ✅" : "Not Ready ❌"}`);
    });
});
