from flask import Flask, request, jsonify
import joblib

#Initialize Flask
app = Flask(__name__)

#Load Trained Model
model = joblib.load("random_forest_log_model.pkl")

print("✅ Model loaded successfully")

#Home Route
@app.route("/")
def home():
    return "Log Root Cause Prediction API Running 🚀"

# Predict Route
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if "log" not in data:
            return jsonify({"error": "Please provide 'log' field"}), 400

        log_message = data["log"]

        prediction = model.predict([log_message])[0]
        probability = max(model.predict_proba([log_message])[0])

        return jsonify({
            "log": log_message,
            "predicted_root_cause": prediction,
            "confidence": round(float(probability) * 100, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Run Server
if __name__ == "__main__":
    app.run(debug=True, port=5000)
