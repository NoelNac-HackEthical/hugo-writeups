import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Dense(1, input_shape=(1,))
])

model.compile(optimizer="adam", loss="mean_squared_error")

model.save("minimal.h5")
