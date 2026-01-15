import urllib.request
import json

api_key = "AIzaSyAc6bYuKlW0kBtXafK0tmblTRy1rprCDRo"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode('utf-8'))
        with open('models.txt', 'w') as f:
            for model in data.get('models', []):
                name = model['name']
                if 'gemini' in name.lower() and 'generateContent' in model.get('supportedGenerationMethods', []):
                    f.write(f"{name}\n")
        print("Models saved to models.txt")
except Exception as e:
    print(f"Error: {e}")
