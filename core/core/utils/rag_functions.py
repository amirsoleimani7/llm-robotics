import math
import re
from typing import Dict, List, Optional, Tuple

from .command_docs import COMMAND_DOCS


AVAILABLE_FUNCTIONS = {
    "home": {"params": [], "ranges": {}, "aliases": ["move_home"]},
    "park": {"params": [], "ranges": {}, "aliases": []},
    "base": {"params": ["angle"], "ranges": {"angle": (-3.14159, 3.14159)}, "aliases": []},
    "arm": {"params": ["angle"], "ranges": {"angle": (-1.50, 1.50)}, "aliases": []},
    "shaft": {"params": ["position"], "ranges": {"position": (-0.15, 0.0)}, "aliases": []},
    "base_rel": {"params": ["delta"], "ranges": {"delta": (-1.57, 1.57)}, "aliases": []},
    "arm_rel": {"params": ["delta"], "ranges": {"delta": (-1.50, 1.50)}, "aliases": []},
    "shaft_rel": {"params": ["delta"], "ranges": {"delta": (-0.15, 0.15)}, "aliases": []},
    "move_to": {
        "params": ["x", "y", "z"],
        "ranges": {"x": (-0.60, 0.60), "y": (-0.60, 0.60), "z": (-0.15, 0.0)},
        "aliases": [],
    },
    "where": {"params": [], "ranges": {}, "aliases": []},
    "grip": {"params": [], "ranges": {}, "aliases": ["open_gripper"]},
    "release": {"params": [], "ranges": {}, "aliases": ["close_gripper"]},
    "pick": {"params": [], "ranges": {}, "aliases": []},
    "place": {"params": [], "ranges": {}, "aliases": []},
    "save_pos": {"params": ["name"], "ranges": {}, "aliases": []},
    "goto_pos": {"params": ["name"], "ranges": {}, "aliases": []},
    "list_pos": {"params": [], "ranges": {}, "aliases": []},
    "delete_pos": {"params": ["name"], "ranges": {}, "aliases": []},
    "speed": {"params": ["factor"], "ranges": {"factor": (0.1, 2.0)}, "aliases": []},
    "led": {"params": ["state"], "ranges": {}, "aliases": []},
    "wait": {"params": ["seconds"], "ranges": {"seconds": (0.0, 3600.0)}, "aliases": []},
    "status": {"params": [], "ranges": {}, "aliases": []},
    "verbose": {"params": ["level"], "ranges": {"level": (0, 2)}, "aliases": []},
    "clear": {"params": [], "ranges": {}, "aliases": []},
    "quit": {"params": [], "ranges": {}, "aliases": []},
    "exit": {"params": [], "ranges": {}, "aliases": []},
}

_ALIASES = {
    alias: canonical
    for canonical, spec in AVAILABLE_FUNCTIONS.items()
    for alias in spec.get("aliases", [])
}

_NAME_RE = r"[A-Za-z0-9_\-]+"


def _clean_line(line: str) -> str:
    line = re.sub(r"<think>.*?</think>", "", line, flags=re.DOTALL | re.IGNORECASE)
    line = re.sub(r"<[^>]+>", "", line)
    line = line.strip().strip("`")
    line = re.sub(r"^[\-\*\u2022]\s*", "", line)
    line = re.sub(r"^step\s+\d+\s*[:\.-]?\s*", "", line, flags=re.IGNORECASE)
    return line.strip()


def _parse_command(command_text: str) -> Tuple[Optional[str], List[str]]:
    command_text = command_text.strip()
    if not command_text:
        return None, []

    if command_text.endswith(")") and "(" in command_text:
        name, arg_text = command_text.split("(", 1)
        name = name.strip().lower()
        arg_text = arg_text[:-1].strip()
        args = [arg for arg in re.split(r"[\s,]+", arg_text) if arg]
        return name, args

    parts = command_text.split()
    if not parts:
        return None, []
    name = parts[0].lower()
    args = parts[1:]
    return name, args


def validate_function_call(function_call: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """Validate a socket command and return (is_valid, command_name, error_message)."""
    function_call = _clean_line(function_call)
    command_name, args = _parse_command(function_call)

    if not command_name:
        return False, None, "Empty command"

    command_name = _ALIASES.get(command_name, command_name)

    if command_name not in AVAILABLE_FUNCTIONS:
        return False, None, f"Invalid command: {function_call}"

    spec = AVAILABLE_FUNCTIONS[command_name]
    expected_params = spec["params"]

    if len(args) != len(expected_params):
        return False, command_name, (
            f"{command_name} expects {len(expected_params)} argument(s), got {len(args)}"
        )

    normalized_args: List[str] = []

    for index, param_name in enumerate(expected_params):
        raw_value = args[index]

        if param_name == "name":
            if not re.fullmatch(_NAME_RE, raw_value):
                return False, command_name, f"Invalid name argument: {raw_value}"
            normalized_args.append(raw_value)
            continue

        if param_name == "state":
            state = raw_value.lower()
            if state not in {"on", "off", "1", "0"}:
                return False, command_name, f"Invalid LED state: {raw_value}"
            normalized_args.append("on" if state in {"on", "1"} else "off")
            continue

        try:
            value = float(raw_value)
        except ValueError:
            return False, command_name, f"Invalid numeric value: {raw_value}"

        if param_name == "level" and not value.is_integer():
            return False, command_name, f"verbose level must be an integer, got {raw_value}"

        value_range = spec["ranges"].get(param_name)
        if value_range is not None:
            lower, upper = value_range
            if not (lower <= value <= upper):
                return False, command_name, f"{param_name}={value} out of range [{lower}, {upper}]"

        if param_name == "level":
            normalized_args.append(str(int(value)))
        elif param_name in {"factor", "seconds"}:
            normalized_args.append(f"{value:.3f}".rstrip("0").rstrip("."))
        else:
            normalized_args.append(f"{value:.6f}".rstrip("0").rstrip("."))

    return True, command_name, " ".join([command_name, *normalized_args]).strip()


def extract_function_calls(text: str) -> List[Dict]:
    """Extract valid socket commands from text."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"```(?:\w+)?", "", text)
    text = text.replace("```", "")

    function_calls: List[Dict] = []
    lines = text.splitlines()
    step_num = 1

    for line in lines:
        cleaned_line = _clean_line(line)
        if not cleaned_line:
            continue

        step_match = re.match(r"step\s+(\d+)\s*[:\.-]?\s*(.+)", line.strip(), re.IGNORECASE)
        if step_match:
            step = int(step_match.group(1))
            cleaned_line = _clean_line(step_match.group(2))
        else:
            step = step_num

        is_valid, command_name, normalized_command = validate_function_call(cleaned_line)
        if is_valid and command_name and normalized_command:
            raw_args = normalized_command.split()[1:]
            params = {}
            if raw_args:
                spec = AVAILABLE_FUNCTIONS[command_name]
                params = {name: raw_args[idx] for idx, name in enumerate(spec["params"])}

                if command_name == "move_to":
                    try:
                        x = float(params.get("x", 0.0))
                        y = float(params.get("y", 0.0))
                        z = float(params.get("z", 0.0))

                        # SCARA reach check
                        L1 = 0.3
                        L2 = 0.3
                        max_reach = L1 + L2

                        r = math.hypot(x, y)
                        if r > max_reach:
                            scale = max_reach / r
                            params["x"] = f"{x * scale:.6f}".rstrip("0").rstrip(".")
                            params["y"] = f"{y * scale:.6f}".rstrip("0").rstrip(".")
                            params["z"] = f"{z:.6f}".rstrip("0").rstrip(".")
                            normalized_command = f"move_to {params['x']} {params['y']} {params['z']}"
                    except Exception:
                        pass

            function_calls.append(
                {
                    "step": step,
                    "function": command_name,
                    "params": params,
                    "raw_text": normalized_command,
                }
            )
            step_num = step + 1

    return function_calls


def format_function_calls(function_calls: List[Dict]) -> str:
    """Format commands back into socket-ready text."""
    return "\n".join([fc["raw_text"] for fc in function_calls])


def post_process_output(raw_output: str) -> str:
    """Clean and validate LLM output for the socket server."""
    function_calls = extract_function_calls(raw_output)
    return format_function_calls(function_calls) if function_calls else ""


def _format_retrieved_docs(retrieved_docs: List[str]) -> str:
    if not retrieved_docs:
        return "- No relevant docs found."

    return "\n".join(f"- {doc}" for doc in retrieved_docs)


def build_system_prompt(retrieved_docs: List[str]) -> str:
    docs_text = _format_retrieved_docs(retrieved_docs)

    return f"""You are a robot command generator for a SCARA socket server.

RETRIEVED COMMAND DOCS:
{docs_text}

AVAILABLE COMMAND SCHEMA:
{AVAILABLE_FUNCTIONS}

CRITICAL RULES:
1. Output ONLY valid socket commands.
2. Output one command per line.
3. Do not add step numbers, explanations, markdown, or code fences.
4. Use the exact command names accepted by the socket server.
5. Keep numeric values within valid ranges.
6. Prefer commands supported by the retrieved docs.
"""


def get_system_prompt() -> str:
    """Fallback static prompt."""
    return build_system_prompt([])
