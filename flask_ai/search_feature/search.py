from flask import Flask, render_template, request, jsonify
from requirement_model import RequirementModel

app = Flask(__name__)

model = RequirementModel()


@app.route("/")
def home():
    return render_template("search.html")


@app.route("/api/understand", methods=["POST"])
def understand():

    data = request.get_json()

    text = data.get("text", "")

    result = model.understand(text)

    return jsonify(result)


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )