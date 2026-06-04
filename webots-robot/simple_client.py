import socket
import time
import sys

HOST = '127.0.0.1'  # The server's hostname or IP address
PORT = 65432        # The port used by the SCARA controller

def send_command(sock, command):
    """Sends a command to the SCARA server and prints the response."""
    print(f">>> Sending: {command}")
    # Append newline to signify the end of the command string
    sock.sendall((command + '\n').encode('utf-8'))
    
    # Wait for the acknowledgment from the controller server
    try:
        response = sock.recv(4096).decode('utf-8')
        print(f"<<< Response: {response.strip()}\n")
    except socket.timeout:
        print("<<< Response: [Timeout waiting for server]\n")

def run_demo_sequence(s):
    """Executes the original hardcoded sequence of commands."""
    print("\n--- Running Original Sequence ---")
    send_command(s, "home")
    time.sleep(1) # Optional pause between commands
    
    send_command(s, "base 0.5")
    send_command(s, "arm -0.5")
    send_command(s, "shaft -0.1")
    
    send_command(s, "grip")
    send_command(s, "where")
    
    time.sleep(2)
    
    send_command(s, "park")
    print("--- Sequence Complete ---\n")

def main():
    print("╔══════════════════════════════════════════════╗")
    print("║        SCARA REMOTE INTERACTIVE CLIENT       ║")
    print("╚══════════════════════════════════════════════╝")
    print("Connecting to SCARA Controller...")
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Set a timeout so the client doesn't freeze if the server hangs
        s.settimeout(5.0) 
        
        try:
            s.connect((HOST, PORT))
            print("Connected successfully!\n")
            print("Type any SCARA command (e.g., 'home', 'base 0.5', 'where').")
            print("Type 'demo' to run the original automated sequence.")
            print("Type 'quit' or 'exit' to close this client.\n")
            
            # Interactive Loop
            while True:
                try:
                    # Get input from the user
                    user_input = input("SCARA Client>> ").strip()
                    
                    # Ignore empty inputs
                    if not user_input:
                        continue
                        
                    # Handle local client exit
                    if user_input.lower() in ['quit', 'exit']:
                        print("Closing remote connection...")
                        break
                        
                    # Handle the original test sequence
                    if user_input.lower() == 'demo':
                        run_demo_sequence(s)
                        continue
                        
                    # Send typed command to the server
                    send_command(s, user_input)
                    
                except KeyboardInterrupt:
                    # Catch Ctrl+C gracefully
                    print("\nClosing remote connection...")
                    break
            
        except ConnectionRefusedError:
            print("\nConnection failed. Make sure the Webots SCARA controller is running.")
        except Exception as e:
            print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    main()