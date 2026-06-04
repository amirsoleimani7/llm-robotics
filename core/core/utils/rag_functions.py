# rag_functions.py
import re
from typing import List, Dict, Tuple, Optional

AVAILABLE_FUNCTIONS = {
    
    "move_to_position": {
        "params": ["j1", "j2", "z"],
        "ranges": {
            "j1": (-150, 150),
            "j2": (-150, 150),
            "z": (0, 200)
        },
        "pattern": r'move_to_position\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)'
    },

    "open_gripper": {
        "params": [],
        "ranges": {},
        "pattern": r'open_gripper\(\)'
    },
    "close_gripper": {
        "params": [],
        "ranges": {},
        "pattern": r'close_gripper\(\)'
    },
    "move_home": {
        "params": [],
        "ranges": {},
        "pattern": r'move_home\(\)'
    }
}

def validate_function_call(function_call: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """Validate a function call and return (is_valid, function_name, error_message)"""
    function_call = function_call.strip()
    
    for func_name, func_info in AVAILABLE_FUNCTIONS.items():
        match = re.match(func_info["pattern"], function_call, re.IGNORECASE)
        if match:
            # Check parameter ranges for move_to_position
            if func_name == "move_to_position":
                j1, j2, z = map(float, match.groups())
                j1_range = func_info["ranges"]["j1"]
                j2_range = func_info["ranges"]["j2"]
                z_range = func_info["ranges"]["z"]
                
                if not (j1_range[0] <= j1 <= j1_range[1]):
                    return False, func_name, f"j1={j1} out of range [{j1_range[0]},{j1_range[1]}]"
                if not (j2_range[0] <= j2 <= j2_range[1]):
                    return False, func_name, f"j2={j2} out of range [{j2_range[0]},{j2_range[1]}]"
                if not (z_range[0] <= z <= z_range[1]):
                    return False, func_name, f"z={z} out of range [{z_range[0]},{z_range[1]}]"
            
            return True, func_name, None
    
    return False, None, f"Invalid function call: {function_call}"

def extract_function_calls(text: str) -> List[Dict]:
    """Extract all valid function calls from text"""
    # Remove any potential thinking tags (just in case)
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', '', text)
    
    function_calls = []
    lines = text.split('\n')
    step_num = 1
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Try to match step format: step X : function_name(params)
        step_match = re.match(r'step\s+(\d+)\s*:\s*(.+)', line, re.IGNORECASE)
        if step_match:
            step = int(step_match.group(1))
            function_call = step_match.group(2)
        else:
            # Try without step prefix
            function_call = line
            step = step_num
        
        # Validate the function call
        is_valid, func_name, error = validate_function_call(function_call)
        
        if is_valid:
            # Extract parameters for move_to_position
            params = {}
            if func_name == "move_to_position":
                match = re.match(AVAILABLE_FUNCTIONS[func_name]["pattern"], function_call, re.IGNORECASE)
                if match:
                    params = {
                        "j1": float(match.group(1)),
                        "j2": float(match.group(2)),
                        "z": float(match.group(3))
                    }
            
            function_calls.append({
                "step": step,
                "function": func_name,
                "params": params,
                "raw_text": f"step {step} : {function_call}"
            })
            step_num = step + 1
    
    return function_calls

def format_function_calls(function_calls: List[Dict]) -> str:
    """Format function calls back to string format"""
    return '\n'.join([fc["raw_text"] for fc in function_calls])

def post_process_output(raw_output: str) -> str:
    """Clean and validate LLM output"""
    # First, try to extract function calls
    function_calls = extract_function_calls(raw_output)
    
    if function_calls:
        return format_function_calls(function_calls)
    
    # If no function calls found, try to find any valid function pattern
    for func_name, func_info in AVAILABLE_FUNCTIONS.items():
        matches = re.finditer(func_info["pattern"], raw_output, re.IGNORECASE)
        for i, match in enumerate(matches, 1):
            return f"step {i} : {match.group(0)}"
    
    return ""


def get_system_prompt() -> str:
    """Get the system prompt with available functions"""
    functions_desc = "\n".join([f"- {name}" for name in AVAILABLE_FUNCTIONS.keys()])
    return f"""You are a robot control function caller. 

AVAILABLE FUNCTIONS:
{functions_desc}

CRITICAL RULES:
1. Output ONLY function calls - one per line
2. Format each line as: step X : function_name(parameters)
3. Valid parameters: j1=[-150,150], j2=[-150,150], z=[0,200]

Examples:
step 1 : move_home()
step 1 : open_gripper()
step 1 : move_to_position(50, -30, 100)

REMEMBER: Output ONLY the function calls. No explanations, no additional text. No comments on the commands at all 
Dont't randomnly use the gripper, don't use the grippers until there is an object to grap or the user specifies that you open or close your gripper"""
    

# def get_system_prompt(current_position=None) -> str:
#     """Get the system prompt with available functions and optional current position"""
    
#     functions_desc = "\n".join([f"- {name}" for name in AVAILABLE_FUNCTIONS.keys()])
    
#     # Base prompt without position
#     base_prompt = f"""You are a robot control function caller. 

# AVAILABLE FUNCTIONS:
# {functions_desc}

# CRITICAL RULES:
# 1. Output ONLY function calls - one per line
# 2. Format each line as: step X : function_name(parameters)
# 3. Valid parameters: j1=[-150,150], j2=[-150,150], z=[0,200]

# Examples:
# step 1 : move_home()
# step 1 : open_gripper()
# step 1 : move_to_position(50, -30, 100)"""
    
#     # Add current position context if provided
#     if current_position:
#         position_context = f"""

# CURRENT ROBOT POSITION:
# - Joint 1 (j1): {current_position['j1']} degrees
# - Joint 2 (j2): {current_position['j2']} degrees  
# - Z-axis (z): {current_position['z']} mm

# IMPORTANT: Use this current position to calculate relative movements.
# If user asks to "move left 20", that means decrease j1 by 20 from current {current_position['j1']}.
# If user asks to "move up 50", that means increase z by 50 from current {current_position['z']}.

# REMEMBER: Output ONLY the function calls. No explanations, no additional text."""
        
#         return base_prompt + position_context
    
#     return base_prompt + "\n\nREMEMBER: Output ONLY the function calls. No explanations, no additional text."
