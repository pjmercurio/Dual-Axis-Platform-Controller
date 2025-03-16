from flask import Flask, request, jsonify, render_template
import serial
import atexit

app = Flask(__name__)

# Configure serial connection (adjust the port and baudrate for your SKR board)
SERIAL_PORT = "/dev/cu.usbmodem21101"
BAUDRATE = 115200

try:
    ser = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=1)
    ser.write(b"M106 S250\n")  # Turn on the fan at full speed
    ser.flush()
    ser.write(b"M84 S1\n")  # Disable steppers after 1 second
    ser.flush()
    ser.write(b"M211 S0\n")  # Disable software endstops
    ser.flush()
    ser.write(b"G91\n")  # Set relative positioning
    ser.flush()
    print("SKR board connected and initialized successfully!")
except Exception as e:
    print(f"Error connecting to SKR board: {e}")
    ser = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route("/send_gcode", methods=["POST"])
def send_gcode():
    if not ser:
        return jsonify({"error": "Serial connection not established"}), 500

    gcode = request.json.get("gcode")
    if not gcode:
        return jsonify({"error": "No G-code provided"}), 400

    ser.write((gcode + "\n").encode())  # Send G-code over USB
    ser.flush()
    
    return jsonify({"message": f"G-code '{gcode}' sent"}), 200

@app.route('/send_gcode_sequence', methods=['POST'])
def send_gcode_sequence():
    # Split the G-code sequence into individual commands
    if not ser:
        return jsonify({"error": "Serial connection not established"}), 500

    gcode_sequence = request.json.get("gcode")
    if not gcode_sequence:
        return jsonify({"error": "No G-code provided"}), 400

    for line in gcode_sequence.strip().split('\n'):
        ser.write((line + "\n").encode())
        ser.flush()

    return jsonify({'status': 'success', 'message': 'G-code sequence sent successfully'})

def cleanup():
    print("Cleaning up before exiting...")
    if ser:
        ser.write(b"M107\n") # Turn off the fan
        ser.flush()
        ser.close()

atexit.register(cleanup)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
