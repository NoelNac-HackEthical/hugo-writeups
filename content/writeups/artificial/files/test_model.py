import sys
from tensorflow import keras

model_path = sys.argv[1]
model = keras.models.load_model(model_path)

print("Modèle chargé")
