function sendGCode(gcode) {
    fetch('/send_gcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gcode: gcode })
    })
    .then(response => response.json())
    .then(data => {
        console.log('G-code sent:', data.message);
    })
    .catch(error => {
        console.error('Error sending G-code:', error);
    });
}

function sendGCodeSequence(gcode) {
    fetch('/send_gcode_sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gcode: gcode })
    })
    .then(response => response.json())
    .then(data => {
        console.log('G-code sent:', data.message);
    })
    .catch(error => {
        console.error('Error sending G-code:', error);
    });
}

function updateRangeValue(value) {
    document.getElementById('range-value').innerText = value;
}

function getMovementDistance() {
    return parseInt(document.getElementById('slider').value, 10) || 5;
}

function move(axis, distance) {
    const gcode = `G0 ${axis}${distance}`;
    sendGCode(gcode);
}

document.addEventListener('DOMContentLoaded', () => {
    const feedRate = 2000;
    const micButton = document.getElementById('mic-button');
    const fanButton = document.getElementById('fan-button');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    let isManuallyStopped = false;

    // Initialize SKR board
    fetch('/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json())
    .then(response => {
        console.log('SKR board initialized successfully.');
        if (response.status === 200) {
            fanButton.classList.add('active');
        }
    })
    .catch(error => {
        console.error(error);
    });

    document.addEventListener('keydown', (event) => {
        const distance = getMovementDistance();
        switch (event.key) {
            case 'ArrowUp':
                sendGCode(`G1 Y${distance} F${feedRate}`);
                break;
            case 'ArrowDown':
                sendGCode(`G1 Y-${distance} F${feedRate}`);
                break;
            case 'ArrowLeft':
                sendGCode(`G1 X-${distance} F${feedRate}`);
                break;
            case 'ArrowRight':
                sendGCode(`G1 X${distance} F${feedRate}`);
                break;
        }
    });

    micButton.addEventListener('click', () => {
        if (micButton.classList.contains('listening')) {
            isManuallyStopped = true;
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        micButton.classList.add('listening');
    };

    recognition.onend = () => {
        // Restart recognition if it was not manually stopped
        if (!isManuallyStopped) {
            recognition.start();
        } else {
            micButton.classList.remove('listening');
            isManuallyStopped = false;
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
        console.log('Recognized speech:', transcript);

        // Check for specific distance command first
        const pattern = /^move\s(\w+)\s(\d*\.?\d+)\s(?:millimeters?|mm)$/i;
        const validDirections = ['up', 'down', 'left', 'right'];
        const match = transcript.match(pattern);

        if (match) {
            const direction = match[1].toLowerCase();
            const distance = parseFloat(match[2] === 'to' ? '2' : match[2]); // Speech recognition may return 'to' instead of the number '2'

            if (validDirections.includes(direction)) {
                switch (direction) {
                    case 'up':
                        sendGCode(`G1 Y${distance} F${feedRate}`);
                        break;
                    case 'down':
                        sendGCode(`G1 Y-${distance} F${feedRate}`);
                        break;
                    case 'left':
                        sendGCode(`G1 X-${distance} F${feedRate}`);
                        break;
                    case 'right':
                        sendGCode(`G1 X${distance} F${feedRate}`);
                        break;
                }
            } else {
                console.log('Invalid direction:', direction);
            }

            return;
        }

        // Handle other commands
        switch (transcript) {
            case 'move up':
                sendGCode(`G1 Y10 F${feedRate}`);
                break;
            case 'move down':
                sendGCode(`G1 Y-10 F${feedRate}`);
                break;
            case 'move left':
                sendGCode(`G1 X-10 F${feedRate}`);
                break;
            case 'move right':
                sendGCode(`G1 X10 F${feedRate}`);
                break;
            case 'say no':
                sendGCodeSequence('G1 X15\n G1 X-15\n G1 X15\n G1 X-15');
                break;
            case 'say yes':
                sendGCodeSequence('G1 Y15\n G1 Y-15\n G1 Y15\n G1 Y-15');
                break;
            case 'do the cha cha slide':
                sendGCodeSequence(`
                    G1 X15
                    G4 P5
                    G1 X-3
                    G4 P5
                    G1 X-3
                    G4 P750
                    G1 X-15
                    G1 P5
                    G1 X3
                    G4 P5
                    G1 X3
                    G4 P750
                    G1 Y15
                    G4 P5
                    G1 Y-3
                    G4 P5
                    G1 Y-3
                    G4 P750
                    G1 Y-15
                    G1 P5
                    G1 Y3
                    G4 P5
                    G1 Y3
                `);
                break;
            case 'fan on':
                sendGCode('M106 S225');
                fanButton.classList.add('active');
                break;
            case 'fan off':
                fanButton.classList.remove('active');
                sendGCode('M107');
                break;
            case 'run test':
                sendGCodeSequence('G1 X10\n G1 X-10\n G4 P200\n G1 Y10\n G1 Y-10');
                break;
            default:
                console.log('Unrecognized command:', transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error detected:', event.error);
    };

    fanButton.addEventListener('click', function() {
        this.classList.toggle('active');
        sendGCode(this.classList.contains('active') ? 'M106 S250' : 'M107');
    });

    document.getElementById('home-button').addEventListener('click', function() {
        this.classList.toggle('active');
        sendGCode('G28 X');
    });

    document.getElementById('camera-button').addEventListener('click', function() {
        sendGCodeSequence(`
            G1 X10
            G4 P250
            G1 X10
            G4 P250
            G1 X10
            G4 P250
            G1 X10
            G4 P250
            G1 X-40
            G4 P250
            G1 Y10
            G4 P250
            G1 X10
            G4 P250
            G1 X10
            G4 P250
            G1 X10
            G4 P250
            G1 X10
            G4 P250
            G1 X-40
            G4 P250
            G1 Y-10`
        );
    });
});
