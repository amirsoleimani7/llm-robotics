import os
import torch
from abc import ABC, abstractmethod
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from .rag_functions import get_system_prompt, post_process_output

os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")
MODEL_PATH_1 = "/home/amir/Desktop/projects/models/hub/models--microsoft--Phi-3.5-mini-instruct/snapshots/2fe192450127e6a83f7441aef6e3ca586c338b77"


class BaseLLMBackend(ABC):
    @abstractmethod
    def generate(self, messages):
        raise NotImplementedError


class LocalHFBackend(BaseLLMBackend):
    def __init__(self, model_path: str):
        print("Loading local model and tokenizer (CPU-only)...")
        self.device = torch.device("cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True,
        )
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

    def generate(self, messages):
        prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        with torch.inference_mode():
            outputs = self.pipe(
                prompt,
                max_new_tokens=80,
                temperature=0.1,
                do_sample=True,
                return_full_text=False,
            )
        return outputs[0]["generated_text"]


class OpenAIBackend(BaseLLMBackend):
    def __init__(self, api_key: str, model: str):
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def generate(self, messages):
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.1,
        )
        return resp.choices[0].message.content


class GenericCallbackBackend(BaseLLMBackend):
    def __init__(self, callback):
        self.callback = callback

    def generate(self, messages):
        return self.callback(messages)


def build_backend():
    provider = os.getenv("LLM_PROVIDER", "local").lower()

    if provider == "openai":
        return OpenAIBackend(
            api_key=os.environ["OPENAI_API_KEY"],
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        )

    if provider == "callback":
        raise ValueError(
            "Use RobotController(backend=...) with a callback backend.")

    return LocalHFBackend(MODEL_PATH_1)


class RobotController:
    def __init__(self, backend=None):
        self.backend = backend or build_backend()
        self.max_history_messages = 12
        self.chat_history = [
            {"role": "system", "content": get_system_prompt()}]

    def _trim_chat_history(self):
        if len(self.chat_history) > self.max_history_messages:
            self.chat_history = [self.chat_history[0]] + \
                self.chat_history[-(self.max_history_messages - 1):]

    def process_command(self, user_input, max_retries=2):
        self.chat_history.append({"role": "user", "content": user_input})
        self._trim_chat_history()

        retries = 0
        while retries <= max_retries:
            print(f"prompt is : {user_input}")
            raw_output = self.backend.generate(self.chat_history)
            processed_output = post_process_output(raw_output)

            print(f"proccessed output is {processed_output}")

            if processed_output:
                self.chat_history.append(
                    {"role": "assistant", "content": processed_output})
                return processed_output

            error_msg = (
                "Error: Your previous output contained invalid functions or parameters out of bounds. "
                "Please try again and strictly follow the formatting rules."
            )
            self.chat_history.append(
                {"role": "assistant", "content": raw_output})
            self.chat_history.append({"role": "user", "content": error_msg})
            retries += 1

        return "System Error: LLM failed to generate valid commands after multiple attempts."


def make_backend_from_env():
    provider = os.getenv("LLM_PROVIDER", "local").lower()
    if provider == "openai":
        return OpenAIBackend(
            api_key=os.environ["OPENAI_API_KEY"],
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        )
    return LocalHFBackend(MODEL_PATH_1)


agent = RobotController()
