# Dual-Axis-Platform-Controller

A web interface for controlling the X and Y axis stepper motors via serial connection to an SKR control board. Motors can be controlled via GUI buttons, arrow keys, or voice commands (e.g "move 15 milimeters to the right").

## Parts List

- BTT SKR Ender3 2.0 Control Board
- 24v, 6a (or more) power supply
- 2020 Aluminim Extrusions
- 2 NEMA11 Stepper Motors with lead screw and rail
- Angle brackets
- Project box
- 24v DC cooling fan
- USB Cable

## Building & Running

The app can be run by simply running `./run.sh` from the root folder. This will handle installing dependencies and creating a virtual environment. URLs to access the webapp will be printed to the console.

To build the standalone app, run `./build.sh`. This will first compile the Flask app and its associated static assets into a binary, then this binary is copied into the Electron app's dist folder, where the Electron app is then build with the Flask binary as a bundle resource. The final product ends up in the root build folder as a standalone app which when opened will spin up the Flask server, check for a serial connection with the controller board, and get the urls for opening the web app, displaying them in the main window.

## Images

![IMG_3596](https://github.com/user-attachments/assets/bcf455b6-b31d-4500-9bce-d456af8036f1)
<img height="525" alt="Screenshot 2025-03-16 at 7 22 38 PM" src="https://github.com/user-attachments/assets/1b9d02ae-0ff3-42cd-8240-d48d592a5354" />
