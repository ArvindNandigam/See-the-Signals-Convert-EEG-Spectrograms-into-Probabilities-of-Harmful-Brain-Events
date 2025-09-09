from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import pandas as pd
import numpy as np
import tensorflow as tf

app = Flask(__name__)
CATEGORIES = ["seizure", "lpd", "gpd", "lrda", "grda", "other"]

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

model = tf.keras.models.load_model("cnn_model_best.h5")
def safe_pad(arr, target_shape):
    """Crop or zero-pad array to match target shape."""
    arr = np.array(arr)
    padded = np.zeros(target_shape, dtype=np.float32)
    rows = min(arr.shape[0], target_shape[0])
    cols = min(arr.shape[1], target_shape[1])
    padded[:rows, :cols] = arr[:rows, :cols]
    return padded

@app.route("/")
def home():
    return redirect("http://localhost:5173/")

@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        eeg_file = request.files.get("eeg_file")
        spectrogram_file = request.files.get("spectrogram_file")
        if not eeg_file or not spectrogram_file:
            return jsonify({"error": "Both files are required"}), 400

        eeg_df = pd.read_parquet(eeg_file)
        spec_df = pd.read_parquet(spectrogram_file)

        eeg_timesteps, eeg_channels = model.input[0].shape[1:3]
        spec_h, spec_w = model.input[1].shape[1:3]

        eeg_arr = eeg_df.fillna(0).values.astype(np.float32)
        eeg_arr = safe_pad(eeg_arr, (eeg_timesteps, eeg_channels))

        spec_arr = spec_df.fillna(0).values.astype(np.float32)
        spec_arr = safe_pad(spec_arr, (spec_h, spec_w))
        spec_arr = np.expand_dims(spec_arr, -1)

        eeg_arr = np.nan_to_num(eeg_arr, nan=0.0, posinf=0.0, neginf=0.0)
        spec_arr = np.nan_to_num(spec_arr, nan=0.0, posinf=0.0, neginf=0.0)


        eeg_arr = np.expand_dims(eeg_arr, 0)
        spec_arr = np.expand_dims(spec_arr, 0)


        print("EEG shape:", eeg_arr.shape, "nonzero:", np.count_nonzero(eeg_arr))
        print("SPEC shape:", spec_arr.shape, "nonzero:", np.count_nonzero(spec_arr))


        preds = model.predict({"eeg_input": eeg_arr, "spec_input": spec_arr}, verbose=0)
        preds = preds[0].tolist()
        predicted_idx = int(np.argmax(preds))
        predicted_label = CATEGORIES[predicted_idx]

        # -------------------------------
        return jsonify({
            "probabilities": {CATEGORIES[i]: float(preds[i]) for i in range(len(CATEGORIES))},
            "predicted_label": predicted_label
        })

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
