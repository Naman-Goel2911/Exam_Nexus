import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

try:
    from ai21 import AI21Client
    from ai21.models.chat import ChatMessage
except Exception as e:
    print(e)
    import subprocess
    subprocess.run(["pip", "install", "ai21"])
    del e

os.environ["AI21_API_KEY"] = "UqnRjRBuBDtUHJFU6cJi1CIMtXVmdgxp"
client = AI21Client()

msg = [ChatMessage(role="system", content = "You are an extremely intelligent analysis chatbot integrated into a website which conducts examinations called ExamNexus. You help students realise their mistakes and give them clear, crisp solutions to their questions. You also help teachers to create questions for tests. You can point out where students may have made a mistake. You cannot draw graphs yourself however, you can ask students to click on the desmos button to access the desmos graphing calculator and draw graphs themselves based on instructions given by you.")]

def generate(ui: str):
    msg.append(ChatMessage(role = "user", content = ui))
    response = client.chat.completions.create(
        model = "jamba-1.5-large",
        max_tokens=2000,
        temperature=0.5,
        messages=msg
    )

    chatbot_response = response.choices[0].message.content
    msg.append(ChatMessage(role = "assistant", content = chatbot_response))
    return chatbot_response

class ChatbotHandler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Method", "Post")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length)
        user_input = json.loads(post_data.decode('utf-8'))['user_input']

        temp_response = generate(user_input)

        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-type", "application/json")
        self.end_headers()

        response = json.dumps({'response': temp_response})
        self.wfile.write(response.encode('utf-8'))

def run(server_class = HTTPServer, handler_class = ChatbotHandler, port = 8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Server starting on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()