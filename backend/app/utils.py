import json

def ensure_list(data):
    """
    Ensures that the input data is returned as a Python list.
    Handles None, stringified JSON arrays, and already parsed lists.
    """
    if not data:
        return []
    if isinstance(data, str):
        try:
            parsed = json.loads(data)
            return parsed if isinstance(parsed, list) else [data]
        except:
            return [data]
    return data
