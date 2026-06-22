from fastembed import TextEmbedding
from config import EMBEDDING_MODEL_NAME

_model = None

def _get_model() -> TextEmbedding:
    global _model
    if _model is None:
        _model = TextEmbedding(model_name=EMBEDDING_MODEL_NAME)
    return _model

def embed_texts(texts: list[str], batch_size: int = 32) -> list[list[float]]:
    model = _get_model()
    vectors = list(model.embed(texts, batch_size=batch_size))
    return [v.tolist() for v in vectors]

def embed_one(text: str) -> list[float]:
    return embed_texts([text])[0]