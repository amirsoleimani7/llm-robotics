# robot/robot_controller.py
import torch
import os
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class RobotController:
    def __init__(self, model_path):
        print(f"🚀 Loading model from {model_path}...")
        os.environ['HF_HUB_OFFLINE'] = '1'
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float32,
            device_map="cpu"
        )
        
        self.pipe = pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer
        )
        
        self.chat_history = [{"role": "system", "content": "You are a helpful robot assistant."}]
        print("✅ Robot controller loaded successfully!")
    
    def process_command(self, user_input, max_retries=2):
        self.chat_history.append({"role": "user", "content": user_input})
        
        prompt = self.tokenizer.apply_chat_template(
            self.chat_history,
            tokenize=False,
            add_generation_prompt=True
        )
        
        outputs = self.pipe(
            prompt,
            max_new_tokens=150,
            temperature=0.1,
            do_sample=True,
            return_full_text=False
        )
        
        raw_output = outputs[0]['generated_text']
        self.chat_history.append({"role": "assistant", "content": raw_output})
        
        return raw_output
    
    def clear_history(self):
        self.chat_history = [{"role": "system", "content": "You are a helpful robot assistant."}]