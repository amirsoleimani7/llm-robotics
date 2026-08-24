import socket
from typing import Dict, List

from .rag_functions import extract_function_calls, format_function_calls


DEFAULT_SOCKET_HOST = "127.0.0.1"
DEFAULT_SOCKET_PORT = 65432
DEFAULT_SOCKET_TIMEOUT = 180.0  # recording/encoding can take time


def normalize_socket_commands(command_text: str) -> List[str]:
    """Return socket-ready commands extracted from LLM output."""
    command_calls = extract_function_calls(command_text)
    if not command_calls:
        return []
    return [call["raw_text"] for call in command_calls]


def send_commands_to_socket(
    command_text: str,
    host: str = DEFAULT_SOCKET_HOST,
    port: int = DEFAULT_SOCKET_PORT,
    timeout: float = DEFAULT_SOCKET_TIMEOUT,
) -> List[Dict[str, str]]:
    """Send validated commands to the SCARA socket server and collect responses."""
    commands = normalize_socket_commands(command_text)
    if not commands:
        commands = [command_text.strip()]
    commands = [c for c in commands if c]

    if not commands:
        raise ValueError("No valid socket commands were found.")

    payload = "\n".join(commands) + "\n"

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
        client.settimeout(timeout)
        client.connect((host, port))
        client.sendall(payload.encode("utf-8"))
        client.shutdown(socket.SHUT_WR)

        chunks = []
        while True:
            try:
                chunk = client.recv(4096)
                if not chunk:
                    break
                chunks.append(chunk)
            except socket.timeout:
                break

    response = b"".join(chunks).decode("utf-8", errors="replace").strip()
    if not response:
        response = "[Timeout waiting for server acknowledgment]"

    print(f"responses is : {[{'command': 'PROMPT_BATCH', 'response': response}]}")
    return [{"command": "PROMPT_BATCH", "response": response}]


def format_socket_execution(responses: List[Dict[str, str]]) -> str:
    """Format socket execution responses into a compact string."""
    return format_function_calls(
        [{"raw_text": f"{item['command']} -> {item['response']}"} for item in responses]
    )
