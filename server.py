from flask import Flask, send_from_directory, redirect
import os

app = Flask(__name__)

hosted_ext=["js", "html", "css", "jpg", "png"]

@app.route('/', methods=['GET'])
def redirect_from_root():
    return redirect("/app", code=302)

@app.route('/app')
@app.route('/app/')
def serve_index():
    return send_from_directory('./', "example.html")

@app.route("/app/<path:filename>")
def html(filename):
    ext=filename.split(".")[-1]
    if(ext in hosted_ext):
        return send_from_directory('./', filename)
    return send_from_directory('./', 'example.html')

if __name__ == '__main__':
    app.run(port=8088)
