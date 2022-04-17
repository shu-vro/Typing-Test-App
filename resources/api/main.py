import wikipedia
from flask import Flask, jsonify

app = Flask(__name__)


@app.route('/', methods=['GET'])
def getParagraphs():
    try:
        title = wikipedia.random()
        page = wikipedia.summary(title, 3)
        response = jsonify(message=page)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        print(e)
        return jsonify(errorMessage="Failed!"), 404


if __name__ == '__main__':
    app.run(debug=True)
