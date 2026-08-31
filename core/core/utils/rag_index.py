from __future__ import annotations

from typing import List

from .command_docs import COMMAND_DOCS

try:
    from sentence_transformers import SentenceTransformer
    import faiss
    import numpy as np
    _VECTOR_RAG_AVAILABLE = True
except Exception:
    SentenceTransformer = None
    faiss = None
    np = None
    _VECTOR_RAG_AVAILABLE = False


class CommandRAG:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.keys = list(COMMAND_DOCS.keys())
        self.docs = [self._build_doc_text(key) for key in self.keys]

        self.model = None
        self.index = None
        self.embeddings = None

        if _VECTOR_RAG_AVAILABLE:
            self.model = SentenceTransformer(model_name)
            embeddings = self.model.encode(
                self.docs,
                normalize_embeddings=True,
                convert_to_numpy=True,
            ).astype("float32")
            self.embeddings = embeddings
            self.index = faiss.IndexFlatIP(embeddings.shape[1])
            self.index.add(embeddings)

    def _build_doc_text(self, key: str) -> str:
        doc = COMMAND_DOCS[key]
        parts = [
            f"command: {key}",
            f"description: {doc.get('description', '')}",
            f"usage: {doc.get('usage', key)}",
        ]

        examples = doc.get("examples", [])
        if examples:
            parts.append(f"examples: {', '.join(examples)}")

        rng = doc.get("range", {})
        if rng:
            range_bits = ", ".join(
                f"{name}=[{bounds[0]}, {bounds[1]}]" for name, bounds in rng.items()
            )
            parts.append(f"range: {range_bits}")

        notes = doc.get("notes")
        if notes:
            parts.append(f"notes: {notes}")

        aliases = doc.get("aliases", [])
        if aliases:
            parts.append(f"aliases: {', '.join(aliases)}")

        return " | ".join(parts)

    def retrieve(self, query: str, k: int = 3) -> List[str]:
        if not query:
            return self.docs[:k]

        if self.model is not None and self.index is not None:
            q = self.model.encode([query], normalize_embeddings=True, convert_to_numpy=True).astype("float32")
            _, idxs = self.index.search(q, min(k, len(self.docs)))
            return [self.docs[i] for i in idxs[0] if i != -1]

        # Fallback keyword retrieval
        query_tokens = {token for token in query.lower().split() if token}
        scored = []
        for key, doc_text in zip(self.keys, self.docs):
            haystack = (key + " " + doc_text).lower()
            score = sum(1 for token in query_tokens if token in haystack)
            scored.append((score, doc_text))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [doc for score, doc in scored[:k] if score > 0] or self.docs[:k]