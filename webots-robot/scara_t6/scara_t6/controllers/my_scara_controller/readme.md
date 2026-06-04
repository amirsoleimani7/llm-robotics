# SCARA T6 Interactive Terminal Controller

## Overview

This controller provides an interactive terminal interface for controlling the SCARA T6 robot in Webots. It features joint control, inverse kinematics, suction cup manipulation, and position management.

## Installation

1. Copy `scara_interactive_controller.py` to your SCARA T6 controller directory
2. In Webots, select the SCARA T6 robot node
3. Set the `controller` field to point to this controller
4. Run the simulation

## Getting Started

When the simulation starts, you'll see:
╔══════════════════════════════════════════════╗
║ SCARA T6 INTERACTIVE CONTROLLER ║
║ Type 'help' or '?' to list commands ║
║ Type 'help <command>' for details ║
╚══════════════════════════════════════════════╝
SCARA>>

## Quick Example

SCARA>> home
Moving to home position...

SCARA>> where
Shows current joint positions and end effector pose

SCARA>> move_to 0.3 0.2 -0.1
Moves end effector to specified coordinates

SCARA>> grip
Activates suction cup

## Command Reference

### Joint Control Commands

| Command             | Description             | Range             | Example           |
| ------------------- | ----------------------- | ----------------- | ----------------- |
| `base <angle>`      | Absolute base rotation  | [-1.57, 1.57] rad | `base 0.5`        |
| `arm <angle>`       | Absolute arm angle      | [-1.50, 1.50] rad | `arm 0.3`         |
| `shaft <position>`  | Absolute shaft height   | [-0.15, 0.0] m    | `shaft -0.1`      |
| `base_rel <delta>`  | Relative base movement  | -                 | `base_rel 0.1`    |
| `arm_rel <delta>`   | Relative arm movement   | -                 | `arm_rel -0.2`    |
| `shaft_rel <delta>` | Relative shaft movement | -                 | `shaft_rel -0.05` |

### Movement Commands

| Command               | Description                 | Example                |
| --------------------- | --------------------------- | ---------------------- |
| `home`                | All joints to 0 position    | `home`                 |
| `park`                | Safe park position          | `park`                 |
| `move_to <x> <y> <z>` | Cartesian movement (meters) | `move_to 0.3 0.2 -0.1` |
| `where`               | Show current position       | `where`                |

### Gripper Commands

| Command   | Description            | Example   |
| --------- | ---------------------- | --------- |
| `grip`    | Activate suction cup   | `grip`    |
| `release` | Deactivate suction cup | `release` |
| `pick`    | Execute pick sequence  | `pick`    |
| `place`   | Execute place sequence | `place`   |

### Position Management

| Command             | Description            | Example               |
| ------------------- | ---------------------- | --------------------- |
| `save_pos <name>`   | Save current position  | `save_pos approach`   |
| `goto_pos <name>`   | Move to saved position | `goto_pos approach`   |
| `list_pos`          | List saved positions   | `list_pos`            |
| `delete_pos <name>` | Delete saved position  | `delete_pos approach` |

### Settings and Utilities

| Command           | Description                | Example     |
| ----------------- | -------------------------- | ----------- |
| `speed <factor>`  | Speed multiplier (0.1-2.0) | `speed 0.5` |
| `led <on\|off>`   | Control LED                | `led on`    |
| `wait <seconds>`  | Pause execution            | `wait 2.0`  |
| `status`          | Detailed robot status      | `status`    |
| `verbose <level>` | Verbosity 0-2              | `verbose 1` |
| `clear`           | Clear screen               | `clear`     |
| `help [command]`  | Show help                  | `help base` |
| `quit` or `exit`  | Exit controller            | `quit`      |

## Joint Limits

| Joint | Minimum | Maximum | Unit    |
| ----- | ------- | ------- | ------- |
| Base  | -1.57   | 1.57    | radians |
| Arm   | -1.50   | 1.50    | radians |
| Shaft | -0.15   | 0.0     | meters  |

The controller will automatically check limits and prevent out-of-range movements.

## Pick and Place Sequence

### Pick Sequence Steps:

1. Move to approach position above target
2. Lower shaft to grip height (-0.12 m)
3. Activate suction cup
4. Lift object to safe height (-0.05 m)

### Place Sequence Steps:

1. Lower shaft to release height (-0.12 m)
2. Deactivate suction cup
3. Retract to safe height (-0.05 m)

## Inverse Kinematics

The controller implements SCARA inverse kinematics for Cartesian control:

- L1 = 0.3 m (first link)
- L2 = 0.3 m (second link)
- Uses elbow-up/down configurations automatically
- Validates reachability and joint limits

## Error Handling

The controller provides clear error messages for:

- Out of range joint values
- Unreachable Cartesian positions
- Missing suction cup
- Invalid command syntax

## Advanced Usage

### Saving and Recalling Positions

SCARA>> base 0.5
SCARA>> arm 0.3
SCARA>> save_pos pick_position
Position 'pick_position' saved
SCARA>> home
SCARA>> goto_pos pick_position
Moving to saved position 'pick_position'...

### Speed Control

SCARA>> speed 0.5 # Half speed for precise movements
SCARA>> speed 2.0 # Double speed for fast movements

## Troubleshooting

1. **Robot doesn't move**: Check that simulation is running
2. **Suction cup not working**: Verify VACCUM node exists in robot definition
3. **Move_to fails**: Ensure coordinates are within reachable workspace
4. **Commands not recognized**: Commands are case-insensitive

## Technical Notes

- The controller uses Webots Python API
- Inverse kinematics supports multiple solutions (elbow up/down)
- Forward kinematics uses standard SCARA DH parameters
- Suction cup control uses Webots Supervisor API for object manipulation

## Support

For issues or questions, check:

- Webots documentation: https://cyberbotics.com/doc/
- SCARA T6 specifications in the robot's PROTO files
- Controller source code comments for implementation details
