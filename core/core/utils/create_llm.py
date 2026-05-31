import torch
import os
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from .rag_functions import get_system_prompt, post_process_output, extract_function_calls

os.environ['HF_HUB_OFFLINE'] = '1'
MODEL_PATH = "/home/amir/Desktop/projects/llm-con-test/models/hub/models--microsoft--Phi-3.5-mini-instruct/snapshots/2fe192450127e6a83f7441aef6e3ca586c338b77"



class RobotController:
    def __init__(self, model_path):
        print("Loading model and tokenizer on CUDA...")
        
        # Check if CUDA is available
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")
        
        if torch.cuda.is_available():
            print(f"GPU: {torch.cuda.get_device_name(0)}")
            print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,  # Use float16 for faster inference on GPU
            device_map="auto"  # Automatically use GPU if available
        )

        self.pipe = pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
        )
        
        self.chat_history = [
            {"role": "system", "content": get_system_prompt()}
        ]

    def process_command(self, user_input, max_retries=2):
        self.chat_history.append({"role": "user", "content": user_input})
        
        print(f"current chat history is : {self.chat_history}")
        
        retries = 0
        while retries <= max_retries:
            
            prompt = self.tokenizer.apply_chat_template(
                self.chat_history,
                tokenize=False,
                add_generation_prompt=True
            )
            
            print(f"prompt is : {prompt}")

            outputs = self.pipe(
                prompt,
                max_new_tokens=150,
                temperature=0.1,
                do_sample=True,
                return_full_text=False,
                generation_config=None
            )
            
            print(f"\nraw output is : {outputs} \n")
            
            raw_output = outputs[0]['generated_text']

            processed_output = post_process_output(raw_output)

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
# agent = RobotController(model_path=MODEL_PATH)