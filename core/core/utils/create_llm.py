import torch
import os
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from .rag_functions import get_system_prompt, post_process_output

os.environ['HF_HUB_OFFLINE'] = '1'
os.environ.setdefault('PYTORCH_CUDA_ALLOC_CONF', 'expandable_segments:True')
# MODEL_PATH = "/home/amir/Desktop/projects/llm-con-test/models/hub/models--microsoft--Phi-3.5-mini-instruct/snapshots/2fe192450127e6a83f7441aef6e3ca586c338b77"
MODEL_PATH_1 = "/home/amir/Desktop/projects/models/hub/models--microsoft--Phi-3.5-mini-instruct/snapshots/2fe192450127e6a83f7441aef6e3ca586c338b77"



class RobotController:
    def __init__(self, model_path):
        print("Loading model and tokenizer (CPU-only)...")

        # Force CPU usage for now
        self.device = torch.device("cpu")
        print(f"Using device: {self.device}")

        # Load tokenizer and model on CPU only to avoid CUDA OOM
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True,
        )
        # ensure model is on CPU
        try:
            self.model.to("cpu")
        except Exception:
            pass
        self.model.eval()

        self.pipe = pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            device=-1,
        )
        
        self.max_history_messages = 12
        self.chat_history = [
            {"role": "system", "content": get_system_prompt()}
        ]

    def _trim_chat_history(self):
        """Keep only the most recent messages to reduce prompt memory usage."""
        if len(self.chat_history) > self.max_history_messages:
            self.chat_history = [self.chat_history[0]] + self.chat_history[-(self.max_history_messages - 1):]

    def process_command(self, user_input, max_retries=2):
        self.chat_history.append({"role": "user", "content": user_input})
        self._trim_chat_history()

                
        retries = 0
        while retries <= max_retries:
            
            prompt = self.tokenizer.apply_chat_template(
                self.chat_history,
                tokenize=False,
                add_generation_prompt=True
            )
            
            print(f"prompt is : {user_input}")

            with torch.inference_mode():
                outputs = self.pipe(
                    prompt,
                    max_new_tokens=80,
                    temperature=0.1,
                    do_sample=True,
                    return_full_text=False,
                    generation_config=None
                )

            raw_output = outputs[0]['generated_text']

            processed_output = post_process_output(raw_output)
            
            print(f"proccessed output is {processed_output}")
            
            
            if processed_output:
                self.chat_history.append(
                    {"role": "assistant", "content": processed_output})
                return processed_output
            else:
                print(
                    f"[System: Model generated invalid output, forcing retry {retries + 1}/{max_retries}]")
                error_msg = "Error: Your previous output contained invalid functions or parameters out of bounds. Please try again and strictly follow the formatting rules."
                self.chat_history.append(
                    {"role": "assistant", "content": raw_output})
                self.chat_history.append(
                    {"role": "user", "content": error_msg})
                retries += 1

        return "System Error: LLM failed to generate valid commands after multiple attempts."

# making the instance
agent = RobotController(model_path=MODEL_PATH_1)