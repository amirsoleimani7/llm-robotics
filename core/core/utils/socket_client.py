import socket
from typing import Dict, List

from .rag_functions import extract_function_calls, format_function_calls


DEFAULT_SOCKET_HOST = "127.0.0.1"
DEFAULT_SOCKET_PORT = 65432
DEFAULT_SOCKET_TIMEOUT = 5.0


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
    """Send validated commands to the SCARA socket server and collect responses.

    If no parsed function-calls are found, fall back to sending the raw text
    as a single command so the Webots server can still execute/record.
    """
    commands = normalize_socket_commands(command_text)
    # fallback: if no parsed commands, send raw LLM output as a single command
    if not commands:
        commands = [command_text.strip()]
        if not commands[0]:
            raise ValueError("No valid socket commands were found in the LLM output.")

    responses: List[Dict[str, str]] = []

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
        client.settimeout(timeout)
        client.connect((host, port))

        for command in commands:
            client.sendall((command + "\n").encode("utf-8"))

            try:
                response = client.recv(4096).decode("utf-8", errors="replace").strip()
            except socket.timeout:
                response = "[Timeout waiting for server acknowledgment]"

            if not response:
                response = "OK"

            responses.append({"command": command, "response": response})


    print(f"responses is : {responses}")
    return responses


def format_socket_execution(responses: List[Dict[str, str]]) -> str:
    """Format socket execution responses into a compact string."""
    return format_function_calls(
        [{"raw_text": f"{item['command']} -> {item['response']}"} for item in responses]
    )
