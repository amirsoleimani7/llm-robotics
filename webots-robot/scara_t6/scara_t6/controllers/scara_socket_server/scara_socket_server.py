"""SCARA T6 Interactive Terminal Controller with Suction Cup and Fruit Manipulation."""

import math
import sys
import cmd
import socket
import threading
import re

# Cross-platform readline handling
try:
    import readline
except ImportError:
    try:
        import pyreadline as readline
    except ImportError:
        # Fallback if neither is available
        readline = None

from controller import Robot, Supervisor
import os
import datetime


class SCARAT6Controller:
    """Main controller class for SCARA T6 robot."""
    
    # Joint limits based on SCARA T6 specifications
    JOINT_LIMITS = {
        'base': {'min': -3.14159, 'max': 3.14159, 'unit': 'rad'},
        'arm': {'min': -1.50, 'max': 1.50, 'unit': 'rad'},
        'shaft': {'min': -0.15, 'max': 0.0, 'unit': 'm'}
    }
    
    def __init__(self):
        # Initialize robot
        self.robot = Robot()
        self.supervisor = Supervisor()
        self.timestep = int(self.robot.getBasicTimeStep())
        
        # Initialize motors
        self.base_motor = self.robot.getDevice("base_arm_motor")
        self.arm_motor = self.robot.getDevice("arm_motor")
        self.shaft_motor = self.robot.getDevice("shaft_linear_motor")
        
        # Set motor velocities (default values from SCARA T6)
        self.base_motor.setVelocity(1.0)
        self.arm_motor.setVelocity(1.0)
        self.shaft_motor.setVelocity(0.1)
        
        # Initialize position sensors
        self.base_sensor = self.robot.getDevice('base_arm_position')
        self.base_sensor.enable(self.timestep)
        self.arm_sensor = self.robot.getDevice('arm_position')
        self.arm_sensor.enable(self.timestep)
        
        # Initialize suction cup
        self.suction_cup = None
        self._init_suction_cup()
        
        # LED
        self.led = self.robot.getDevice("epson_led")
        
        # Robot parameters (DH parameters for SCARA)
        self.L1 = 0.3  # Link 1 length (meters)
        self.L2 = 0.3  # Link 2 length (meters)
        
        # State variables
        self.saved_positions = {}
        self.speed_factor = 1.0
        self.verbose_level = 1
        self.running = True
        self.attached_object = None
        # recording folder for command videos
        try:
            self.recordings_dir = os.path.join(os.getcwd(), "webots_recordings")
            os.makedirs(self.recordings_dir, exist_ok=True)
        except Exception:
            self.recordings_dir = None
        
    def _init_suction_cup(self):
        """Initialize the suction cup tool."""
        try:
            # Look for vacuum gripper node
            vacuum_node = self.supervisor.getFromDef("VACCUM")
            if vacuum_node:
                self.suction_cup = vacuum_node
                if self.verbose_level >= 1:
                    print("Suction cup found and initialized.")
            else:
                # Alternative: try to find it as a child device
                self.suction_cup = self.robot.getDevice("suction_cup")
                if self.suction_cup:
                    print("Suction cup device initialized.")
                else:
                    print("Warning: No suction cup found. Grip commands will be simulated.")
        except Exception as e:
            print(f"Warning: Could not initialize suction cup: {e}")

    def start_recording(self, filename: str, width: int = 640, height: int = 480):
        """Start movie recording using Supervisor.movieStart.

        Returns the absolute path used (or None on failure).
        """
        if not self.supervisor:
            return None

        if not self.recordings_dir:
            return None

        filepath = os.path.join(self.recordings_dir, filename)
        try:
            # Webots expects a filename; record as mpeg/mp4
            # quality 100, no caption
            self.supervisor.movieStart(filepath, width, height, "mp4", 100, False)
            return filepath
        except Exception as e:
            if self.verbose_level >= 1:
                print(f"Warning: movieStart failed: {e}")
            return None

    def stop_recording(self):
        try:
            self.supervisor.movieStop()
        except Exception as e:
            if self.verbose_level >= 1:
                print(f"Warning: movieStop failed: {e}")
    
    def get_joint_positions(self):
        """Get current positions of all joints."""
        # Step simulation to update sensors
        self.robot.step(self.timestep)
        
        return {
            'base': self.base_sensor.getValue(),
            'arm': self.arm_sensor.getValue(),
            'shaft': self.shaft_motor.getTargetPosition()
        }
    
    def check_joint_limit(self, joint_name, value):
        """Check if a joint value is within limits."""
        limits = self.JOINT_LIMITS[joint_name]
        if value < limits['min'] or value > limits['max']:
            return False, f"Value {value:.4f} {limits['unit']} out of range [{limits['min']:.4f}, {limits['max']:.4f}]"
        return True, "OK"
    
    def move_joint(self, joint_name, value):
        """Move a joint to an absolute position."""
        # Check limits
        is_valid, message = self.check_joint_limit(joint_name, value)
        if not is_valid:
            print(f"ERROR: {message}")
            return False
        
        # Move joint
        if joint_name == 'base':
            self.base_motor.setPosition(value)
            print(f"Moving base to {value:.4f} rad")
        elif joint_name == 'arm':
            self.arm_motor.setPosition(value)
            print(f"Moving arm to {value:.4f} rad")
        elif joint_name == 'shaft':
            self.shaft_motor.setPosition(value)
            print(f"Moving shaft to {value:.4f} m")
        
        return True
    
    def move_joint_relative(self, joint_name, delta):
        """Move a joint relative to its current position."""
        positions = self.get_joint_positions()
        current = positions[joint_name]
        target = current + delta
        
        is_valid, message = self.check_joint_limit(joint_name, target)
        if not is_valid:
            print(f"ERROR: Cannot move {joint_name} by {delta:.4f}: {message}")
            return False
        
        if joint_name == 'base':
            self.base_motor.setPosition(target)
            print(f"Moving base from {current:.4f} to {target:.4f} rad (Δ{delta:+.4f})")
        elif joint_name == 'arm':
            self.arm_motor.setPosition(target)
            print(f"Moving arm from {current:.4f} to {target:.4f} rad (Δ{delta:+.4f})")
        elif joint_name == 'shaft':
            self.shaft_motor.setPosition(target)
            print(f"Moving shaft from {current:.4f} to {target:.4f} m (Δ{delta:+.4f})")
        
        return True
    
    def move_home(self):
        """Move robot to home position."""
        print("Moving to home position...")
        self.move_joint('base', 0.0)
        self.move_joint('arm', 0.0)
        self.move_joint('shaft', 0.0)
        return True
    
    def move_park(self):
        """Move robot to park position (safe position)."""
        print("Moving to park position...")
        self.move_joint('base', 0.0)
        self.move_joint('arm', 1.0)
        self.move_joint('shaft', 0.0)
        return True
    
    def forward_kinematics(self):
        """Calculate end effector position from joint angles."""
        positions = self.get_joint_positions()
        theta1 = positions['base']
        theta2 = positions['arm']
        shaft = positions['shaft']
        
        # Standard SCARA forward kinematics
        x = self.L1 * math.cos(theta1) + self.L2 * math.cos(theta1 + theta2)
        y = self.L1 * math.sin(theta1) + self.L2 * math.sin(theta1 + theta2)
        z = shaft
        
        return x, y, z
    
    def inverse_kinematics(self, x, y, z):
        """Calculate joint angles from end effector position."""
        # Handle shaft (z-axis) separately
        if z < self.JOINT_LIMITS['shaft']['min'] or z > self.JOINT_LIMITS['shaft']['max']:
            return None, f"Z position {z:.4f} m out of range [{self.
            JOINT_LIMITS['shaft']['min']:.4f}, {self.JOINT_LIMITS['shaft']['max']:.4f}]"
        
        # Calculate theta2 using cosine law
        cos_theta2 = (x**2 + y**2 - self.L1**2 - self.L2**2) / (2 * self.L1 * self.L2)
        
        if abs(cos_theta2) > 1.0:
            return None, f"Position ({x:.4f}, {y:.4f}, {z:.4f}) is unreachable"
        
        # Two possible solutions
        theta2_up = math.acos(cos_theta2)
        
        # Calculate theta1 for elbow up configuration
        k1 = self.L1 + self.L2 * math.cos(theta2_up)
        k2 = self.L2 * math.sin(theta2_up)
        theta1_up = math.atan2(y, x) - math.atan2(k2, k1)
        
        theta1 = theta1_up
        theta2 = theta2_up
        
        # Check joint limits
        base_valid, _ = self.check_joint_limit('base', theta1)
        arm_valid, _ = self.check_joint_limit('arm', theta2)
        
        if not base_valid or not arm_valid:
            # Try elbow down configuration
            theta2_down = -math.acos(cos_theta2)
            k1 = self.L1 + self.L2 * math.cos(theta2_down)
            k2 = self.L2 * math.sin(theta2_down)
            theta1_down = math.atan2(y, x) - math.atan2(k2, k1)
            
            theta1 = theta1_down
            theta2 = theta2_down
            
            base_valid, _ = self.check_joint_limit('base', theta1)
            arm_valid, _ = self.check_joint_limit('arm', theta2)
            
            if not base_valid or not arm_valid:
                return None, f"Position ({x:.4f}, {y:.4f}, {z:.4f}) exceeds joint limits"
        
        return (theta1, theta2, z), None
    
    def move_to_xyz(self, x, y, z):
        """Move end effector to Cartesian coordinates."""
        result, error = self.inverse_kinematics(x, y, z)
        
        if result is None:
            print(f"ERROR: {error}")
            return False
        
        theta1, theta2, shaft_z = result
        
        print(f"Moving to Cartesian position ({x:.4f}, {y:.4f}, {z:.4f})")
        print(f"Joint angles: base={theta1:.4f} rad, arm={theta2:.4f} rad, shaft={shaft_z:.4f} m")
        
        self.move_joint('base', theta1)
        self.move_joint('arm', theta2)
        self.move_joint('shaft', shaft_z)
        
        return True
    
    def grip(self):
        """Activate suction cup to grip object."""
        if self.suction_cup:
            try:
                self._attach_closest_object()
                print("Suction cup activated - gripping")
                return True
            except Exception as e:
                print(f"Warning: Could not activate suction: {e}")
                return False
        else:
            print("No suction cup available")
            return False
    
    def release(self):
        """Deactivate suction cup to release object."""
        if self.suction_cup:
            try:
                self._detach_object()
                print("Suction cup deactivated - released")
                return True
            except Exception as e:
                print(f"Warning: Could not release: {e}")
                return False
        else:
            print("No suction cup available")
            return False
    
    def _attach_closest_object(self):
        """Attach the closest fruit to the suction cup."""
        try:
            ee_x, ee_y, ee_z = self.forward_kinematics()
            
            root = self.supervisor.getRoot()
            children = root.getField('children')
            
            closest_fruit = None
            closest_distance = float('inf')
            
            for i in range(children.getCount()):
                node = children.getMFNode(i)
                if node and node.getTypeName() == 'Solid':
                    name_field = node.getField('name')
                    if name_field:
                        name = name_field.getSFString()
                        if 'fruit' in name.lower():
                            translation = node.getField('translation')
                            if translation:
                                fruit_pos = translation.getSFVec3f()
                                distance = math.sqrt(
                                    (fruit_pos[0] - ee_x)**2 + 
                                    (fruit_pos[1] - ee_y)**2 + 
                                    (fruit_pos[2] - ee_z)**2
                                )
                                
                                if distance < closest_distance and distance < 0.05:
                                    closest_distance = distance
                                    closest_fruit = node
            
            if closest_fruit:
                self.attached_object = closest_fruit
                print(f"Attached fruit: {closest_fruit.getField('name').getSFString()}")
        except Exception as e:
            if self.verbose_level >= 2:
                print(f"Debug: Could not attach object: {e}")
    
    def _detach_object(self):
        """Detach any attached object."""
        if self.attached_object:
            try:
                self.attached_object.resetPhysics()
                print(f"Released {self.attached_object.getField('name').getSFString()}")
                self.attached_object = None
            except Exception as e:
                if self.verbose_level >= 2:
                    print(f"Debug: Could not detach: {e}")
    
    def pick_sequence(self):
        """Execute a complete pick sequence."""
        print("=== Starting Pick Sequence ===")
        
        print("Step 1: Moving to approach position...")
        self.move_home()
        self.step_simulation(50)
        
        print("Step 2: Lowering to pick position...")
        self.move_joint('shaft', -0.12)
        self.step_simulation(50)
        
        print("Step 3: Activating suction cup...")
        self.grip()
        self.step_simulation(30)
        
        print("Step 4: Lifting object...")
        self.move_joint('shaft', -0.05)
        self.step_simulation(50)
        
        print("=== Pick Sequence Complete ===")
        return True
    
    def place_sequence(self):
        """Execute a complete place sequence."""
        print("=== Starting Place Sequence ===")
        
        print("Step 1: Lowering to place position...")
        self.move_joint('shaft', -0.12)
        self.step_simulation(50)
        
        print("Step 2: Releasing object...")
        self.release()
        self.step_simulation(30)
        
        print("Step 3: Retracting...")
        self.move_joint('shaft', -0.05)
        self.step_simulation(50)
        
        print("=== Place Sequence Complete ===")
        return True
    
    def step_simulation(self, steps=1):
        """Step the simulation forward."""
        for _ in range(steps):
            self.robot.step(self.timestep)
    
    def set_speed(self, factor):
        """Set speed multiplier."""
        factor = max(0.1, min(2.0, factor))
        self.speed_factor = factor
        self.base_motor.setVelocity(1.0 * factor)
        self.arm_motor.setVelocity(1.0 * factor)
        self.shaft_motor.setVelocity(0.1 * factor)
        print(f"Speed set to {factor:.1f}x")
    
    def led_on(self):
        """Turn LED on."""
        self.led.set(1)
        print("LED ON")
    
    def led_off(self):
        """Turn LED off."""
        self.led.set(0)
        print("LED OFF")
    
    def print_status(self):
        """Print current robot status."""
        positions = self.get_joint_positions()
        x, y, z = self.forward_kinematics()
        
        print("\n" + "="*50)
        print("SCARA T6 STATUS")
        print("="*50)
        print(f"Joint Positions:")
        print(f"  Base: {positions['base']:7.4f} rad  [{self.JOINT_LIMITS['base']['min']:.4f}, {self.JOINT_LIMITS['base']['max']:.4f}]")
        print(f"  Arm:  {positions['arm']:7.4f} rad  [{self.JOINT_LIMITS['arm']['min']:.4f}, {self.JOINT_LIMITS['arm']['max']:.4f}]")
        print(f"  Shaft: {positions['shaft']:7.4f} m    [{self.JOINT_LIMITS['shaft']['min']:.4f}, {self.JOINT_LIMITS['shaft']['max']:.4f}]")
        print(f"\nEnd Effector Position:")
        print(f"  X: {x:.4f} m")
        print(f"  Y: {y:.4f} m")
        print(f"  Z: {z:.4f} m")
        print(f"\nGripper: {'Closed' if self.attached_object else 'Open'}")
        print(f"Speed: {self.speed_factor:.1f}x")
        print("="*50 + "\n")


class SCARATerminal(cmd.Cmd):
    """Interactive terminal for SCARA T6 control."""
    
    intro = """
╔══════════════════════════════════════════════╗
║     SCARA T6 INTERACTIVE CONTROLLER         ║
║     Type 'help' or '?' to list commands     ║
║     Type 'help <command>' for details       ║
╚══════════════════════════════════════════════╝
"""
    prompt = "SCARA>> "
    
    def __init__(self, host='127.0.0.1', port=65432):
        super().__init__()
        self.controller = None
        self.running = True
        
        # Networking
        self.host = host
        self.port = port
        self.server_socket = None
        self.cmd_lock = threading.Lock()
        
        # Setup readline if available
        if readline:
            readline.parse_and_bind('tab: complete')
            # Enable command history
            try:
                readline.read_history_file('.scara_history')
            except:
                pass
    
    def start_socket_server(self):
        """Start a background socket server to receive remote commands."""
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(1)
            print(f"[*] Socket server ready. Listening on {self.host}:{self.port}")
        except Exception as e:
            print(f"[!] Failed to start socket server: {e}")
            return

        def server_thread():
            while self.running:
                try:
                    self.server_socket.settimeout(1.0)
                    conn, addr = self.server_socket.accept()
                    print(f"\n[*] Socket connection established by {addr}")
                    print(self.prompt, end='', flush=True)
                    with conn:
                        while self.running:
                            data = conn.recv(1024)
                            if not data:
                                break
                            # Handle potentially batched strings split by newlines
                            commands = data.decode('utf-8').strip().split('\n')
                            for cmd_str in commands:
                                cmd_str = cmd_str.strip()
                                if cmd_str:
                                    print(f"\n[Remote] {cmd_str}")
                                    # prepare recording filename
                                    video_basename = None
                                    try:
                                        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
                                        safe_cmd = re.sub(r'[^A-Za-z0-9_\-]', '_', cmd_str)[:80]
                                        video_basename = f"{timestamp}_{safe_cmd}.mp4"
                                    except Exception:
                                        video_basename = None

                                    video_path = None
                                    if hasattr(self, 'controller') and self.controller and video_basename:
                                        try:
                                            video_path = self.controller.start_recording(video_basename)
                                        except Exception:
                                            video_path = None

                                    # execute command
                                    self.onecmd(cmd_str)

                                    # allow simulation to run briefly to capture motion
                                    try:
                                        if hasattr(self, 'controller') and self.controller:
                                            self.controller.step_simulation(100)
                                    except Exception:
                                        pass

                                    # stop recording (if started)
                                    if hasattr(self, 'controller') and self.controller and video_path:
                                        try:
                                            self.controller.stop_recording()
                                        except Exception:
                                            pass

                                    # Send an acknowledgment back to client including video filename if present
                                    try:
                                        if video_path:
                                            # send only basename so clients can reference via known folder
                                            conn.sendall(f"OK|{os.path.basename(video_path)}\n".encode('utf-8'))
                                        else:
                                            conn.sendall(b"OK\n")
                                    except:
                                        pass
                                    print(self.prompt, end='', flush=True)
                except socket.timeout:
                    continue
                except Exception as e:
                    pass # Ignore standard disconnect/timeout errors
                    
        # Run socket server daemon thread so it doesn't block Webots stdin
        self.sock_thread = threading.Thread(target=server_thread, daemon=True)
        self.sock_thread.start()

    def onecmd(self, line):
        """Execute a single command safely utilizing the thread lock."""
        with self.cmd_lock:
            return super().onecmd(line)

    def preloop(self):
        """Initialize robot when terminal starts."""
        print("Initializing SCARA T6 robot...")
        self.controller = SCARAT6Controller()
        print("Robot initialized successfully.\n")
        self.start_socket_server()
    
    def postloop(self):
        """Save history on exit."""
        if readline:
            try:
                readline.write_history_file('.scara_history')
            except:
                pass
    
    def default(self, line):
        """Handle unknown commands."""
        if line.strip():
            print(f"Unknown command: '{line}'. Type 'help' for available commands.")
    
    def emptyline(self):
        """Do nothing on empty line."""
        pass
    
    def do_home(self, arg):
        """Move robot to home position (all joints at 0).
        Usage: home"""
        self.controller.move_home()
        self._step_simulation()
    
    def do_park(self, arg):
        """Move robot to safe park position.
        Usage: park"""
        self.controller.move_park()
        self._step_simulation()
    
    def do_base(self, arg):
        """Move base joint to absolute angle.
        Usage: base <angle>
        Example: base 0.5"""
        try:
            angle = float(arg)
            self.controller.move_joint('base', angle)
            self._step_simulation()
        except ValueError:
            print("ERROR: Please provide a valid angle in radians")
    
    def do_arm(self, arg):
        """Move arm joint to absolute angle.
        Usage: arm <angle>
        Example: arm 0.3"""
        try:
            angle = float(arg)
            self.controller.move_joint('arm', angle)
            self._step_simulation()
        except ValueError:
            print("ERROR: Please provide a valid angle in radians")
    
    def do_shaft(self, arg):
        """Move shaft to absolute position.
        Usage: shaft <position>
        Example: shaft -0.1"""
        try:
            position = float(arg)
            self.controller.move_joint('shaft', position)
            self._step_simulation()
        except ValueError:
            print("ERROR: Please provide a valid position in meters")
    
    def do_base_rel(self, arg):
        """Move base joint relative to current position.
        Usage: base_rel <delta_angle>
        Example: base_rel 0.1"""
        try:
            delta = float(arg)
            self.controller.move_joint_relative('base', delta)
            self._step_simulation()
        except ValueError:
            print("ERROR: Please provide a valid delta angle")
    
    def do_arm_rel(self, arg):
        """Move arm joint relative to current position.
        Usage: arm_rel <delta_angle>
        Example: arm_rel -0.2"""
        try:
            delta = float(arg)
            self.controller.move_joint_relative('arm', delta)
            self._step_simulation()
        except ValueError:
            print("ERROR: Please provide a valid delta angle")
    
    def do_shaft_rel(self, arg):
        """Move shaft relative to current position.
        Usage: shaft_rel <delta_position>
        Example: shaft_rel -0.05"""
        try:
            delta = float(arg)
            self.controller.move_joint_relative('shaft', delta)
            self._step_simulation()
        except ValueError:
            print("ERROR: Please provide a valid delta position")
    
    def do_move_to(self, arg):
        """Move end effector to Cartesian coordinates (x, y, z).
        Usage: move_to <x> <y> <z>
        Example: move_to 0.3 0.2 -0.1"""
        try:
            coords = arg.split()
            if len(coords) != 3:
                print("ERROR: Please provide exactly 3 coordinates: x y z")
                return
            x, y, z = map(float, coords)
            self.controller.move_to_xyz(x, y, z)
            self._step_simulation()
        except ValueError:
            print("ERROR: Please provide valid numeric coordinates")
    
    def do_where(self, arg):
        """Display current joint positions and end effector pose.
        Usage: where"""
        self.controller.print_status()
    
    def do_grip(self, arg):
        """Activate suction cup to grip object.
        Usage: grip"""
        self.controller.grip()
        self._step_simulation()
    
    def do_release(self, arg):
        """Deactivate suction cup to release object.
        Usage: release"""
        self.controller.release()
        self._step_simulation()
    
    def do_pick(self, arg):
        """Execute complete pick sequence at current position.
        Usage: pick"""
        self.controller.pick_sequence()
    
    def do_place(self, arg):
        """Execute complete place sequence at current position.
        Usage: place"""
        self.controller.place_sequence()
    
    def do_save_pos(self, arg):
        """Save current joint positions with a name.
        Usage: save_pos <name>
        Example: save_pos home_position"""
        if not arg:
            print("ERROR: Please provide a name for the position")
            return
        
        positions = self.controller.get_joint_positions()
        self.controller.saved_positions[arg] = positions
        print(f"Position '{arg}' saved: base={positions['base']:.4f}, arm={positions['arm']:.4f}, shaft={positions['shaft']:.4f}")
    
    def do_goto_pos(self, arg):
        """Move to a saved position.
        Usage: goto_pos <name>
        Example: goto_pos home_position"""
        if not arg:
            print("ERROR: Please provide the position name")
            return
        
        if arg not in self.controller.saved_positions:
            print(f"ERROR: Position '{arg}' not found. Use 'list_pos' to see saved positions.")
            return
        
        positions = self.controller.saved_positions[arg]
        print(f"Moving to saved position '{arg}'...")
        self.controller.move_joint('base', positions['base'])
        self.controller.move_joint('arm', positions['arm'])
        self.controller.move_joint('shaft', positions['shaft'])
        self._step_simulation()
    
    def do_list_pos(self, arg):
        """List all saved positions.
        Usage: list_pos"""
        if not self.controller.saved_positions:
            print("No positions saved.")
        else:
            print("\nSaved Positions:")
            print("-" * 50)
            for name, pos in self.controller.saved_positions.items():
                print(f"  {name:20s}: base={pos['base']:7.4f}, arm={pos['arm']:7.4f}, shaft={pos['shaft']:7.4f}")
            print("-" * 50)
    
    def do_delete_pos(self, arg):
        """Delete a saved position.
        Usage: delete_pos <name>
        Example: delete_pos home_position"""
        if not arg:
            print("ERROR: Please provide the position name")
            return
        
        if arg in self.controller.saved_positions:
            del self.controller.saved_positions[arg]
            print(f"Position '{arg}' deleted.")
        else:
            print(f"ERROR: Position '{arg}' not found.")
    
    def do_speed(self, arg):
        """Set speed multiplier (0.1 to 2.0).
        Usage: speed <factor>
        Example: speed 0.5"""
        try:
            factor = float(arg)
            self.controller.set_speed(factor)
        except ValueError:
            print("ERROR: Please provide a valid speed factor (0.1 to 2.0)")
    
    def do_led(self, arg):
        """Control LED state.
        Usage: led <on|off|1|0>
        Example: led on"""
        arg = arg.lower().strip()
        if arg in ['on', '1']:
            self.controller.led_on()
        elif arg in ['off', '0']:
            self.controller.led_off()
        else:
            print("ERROR: Please specify 'on'/'1' or 'off'/'0'")
    
    def do_wait(self, arg):
        """Wait for specified seconds.
        Usage: wait <seconds>
        Example: wait 2.0"""
        try:
            seconds = float(arg)
            timestep = self.controller.timestep / 1000.0
            steps = int(seconds / timestep)
            print(f"Waiting {seconds} seconds...")
            self.controller.step_simulation(steps)
            print("Done waiting.")
        except ValueError:
            print("ERROR: Please provide a valid number of seconds")
    
    def do_status(self, arg):
        """Display detailed robot status.
        Usage: status"""
        self.controller.print_status()
    
    def do_verbose(self, arg):
        """Set verbosity level (0=quiet, 1=normal, 2=debug).
        Usage: verbose <level>
        Example: verbose 2"""
        try:
            level = int(arg)
            if level in [0, 1, 2]:
                self.controller.verbose_level = level
                print(f"Verbosity set to level {level}")
            else:
                print("ERROR: Verbosity level must be 0, 1, or 2")
        except ValueError:
            print("ERROR: Please provide a valid level (0, 1, or 2)")
    
    def do_clear(self, arg):
        """Clear the terminal screen.
        Usage: clear"""
        import os
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def do_quit(self, arg):
        """Exit the controller.
        Usage: quit"""
        print("Shutting down SCARA T6 controller...")
        self.running = False
        if self.server_socket:
            try:
                self.server_socket.close()
            except:
                pass
        return True
    
    def do_exit(self, arg):
        """Exit the controller (same as quit).
        Usage: exit"""
        return self.do_quit(arg)
    
    def do_help(self, arg):
        """Show help for commands.
        Usage: help [command]"""
        if arg:
            cmd.Cmd.do_help(self, arg)
        else:
            print("\n" + "="*50)
            print("AVAILABLE COMMANDS")
            print("="*50)
            print("\nJoint Control:")
            print("  base <angle>          Move base joint")
            print("  arm <angle>           Move arm joint")
            print("  shaft <position>      Move shaft")
            print("  base_rel <delta>      Relative base movement")
            print("  arm_rel <delta>       Relative arm movement")
            print("  shaft_rel <delta>     Relative shaft movement")
            
            print("\nMovement:")
            print("  home                  Move to home position")
            print("  park                  Move to park position")
            print("  move_to <x> <y> <z>  Move to Cartesian coordinates")
            print("  where                 Show current position")
            
            print("\nGripper:")
            print("  grip                  Activate suction cup")
            print("  release               Deactivate suction cup")
            print("  pick                  Execute pick sequence")
            print("  place                 Execute place sequence")
            
            print("\nPosition Management:")
            print("  save_pos <name>       Save current position")
            print("  goto_pos <name>       Move to saved position")
            print("  list_pos              List saved positions")
            print("  delete_pos <name>     Delete saved position")
            
            print("\nSettings:")
            print("  speed <factor>        Set speed (0.1-2.0)")
            print("  led <on|off>          Control LED")
            print("  verbose <level>       Set verbosity (0-2)")
            
            print("\nSystem:")
            print("  wait <seconds>        Wait for time")
            print("  status                Show detailed status")
            print("  clear                 Clear screen")
            print("  help [command]        Show help")
            print("  quit/exit             Exit controller")
            print("="*50 + "\n")
    
    def _step_simulation(self):
        """Run simulation steps to process movements."""
        self.controller.step_simulation(100)
    
    def cmdloop(self, intro=None):
        """Custom command loop with simulation running."""
        while self.running:
            try:
                super().cmdloop(intro=self.intro if intro is None else "")
                break
            except KeyboardInterrupt:
                print("\nUse 'quit' or 'exit' to exit.")
            except Exception as e:
                print(f"Error: {e}")


def main():
    """Main function to start the controller."""
    terminal = SCARATerminal(host='127.0.0.1', port=65432)
    terminal.cmdloop()


if __name__ == "__main__":
    main()