import urllib.request
import urllib.error
import json

api_key = "AIzaSyAc6bYuKlW0kBtXafK0tmblTRy1rprCDRo"
# Using gemini-flash-latest as found in the models list
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"

payload = {
    "contents": [{"parts": [{"text": "Hello, are you working?"}]}]
}

data = json.dumps(payload).encode('utf-8')

print(f"Testing URL: {url}")
print("Sending request...")

try:
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        response_body = response.read().decode('utf-8')
        print(f"Status: {response.getcode()}")
        print("Response:")
        print(response_body)
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")
except Exception as e:
    print(f"General Error: {e}")
