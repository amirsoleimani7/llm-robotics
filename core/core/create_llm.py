import torch
import os
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from .rag_functions import get_system_prompt, post_process_output, extract_function_calls

os.environ['HF_HUB_OFFLINE'] = '1'
MODEL_PATH = "/home/amir/Desktop/projects/llm-con-test/models/hub/models--microsoft--Phi-3.5-mini-instruct/snapshots/2fe192450127e6a83f7441aef6e3ca586c338b77"

class RobotController:
    def __init__(self, model_path):
        print("Loading model and tokenizer on CPU. This might take a minute...")
        # REMOVED trust_remote_code=True so it uses native transformers code
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
            

            # print(f"propmt type is : {type(prompt)}")
            print(f"propmt is : {prompt}")

            # UPDATED: Added generation_config=None to silence the warning
            outputs = self.pipe(
                prompt,
                max_new_tokens=150,
                temperature=0.1, # low randomness for more concret resualts
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
agent = RobotController(model_path=MODEL_PATH)

# # --- Run the Interactive Loop ---
# if __name__ == "__main__":
#     model_path = "./models/hub/models--microsoft--Phi-3.5-mini-instruct/snapshots/2fe192450127e6a83f7441aef6e3ca586c338b77"

#     agent = RobotController(model_path)
#     print("\n=== Robot Control Terminal Ready ===")
#     print("Type 'exit' to quit or 'clear' to reset memory.\n")

#     while True:
#         user_input = input("Operator Directive: ")

#         if user_input.lower() in ['exit', 'quit']:
#             break
#         elif user_input.lower() == 'clear':
#             agent.chat_history = [
#                 {"role": "system", "content": get_system_prompt()}]
#             print("Memory cleared.\n")
#             continue

#         print("Thinking...")
#         commands = agent.process_command(user_input)

#         print("\n--- Executable Robot Commands ---")
#         print(commands)
#         print("---------------------------------\n")

