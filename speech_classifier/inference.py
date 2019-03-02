import librosa
import multiprocessing
from collections import Counter
from keras import Sequential
import numpy as np
import time
import argparse
from keras.layers import Convolution2D, BatchNormalization, Activation, MaxPool2D, Flatten, Dense, Dropout

RATE = 24000
N_MFCC = 13
COL_SIZE = 30

def predict_class_audio(MFCCs, model):
    '''
    Predict class based on MFCC samples
    :param MFCCs: Numpy array of MFCCs
    :param model: Trained model
    :return: Predicted class of MFCC segment group
    '''
    MFCCs = MFCCs.reshape(MFCCs.shape[0],MFCCs.shape[1],MFCCs.shape[2],1)
    y_predicted = model.predict_classes(MFCCs,verbose=0)
    return(Counter(list(y_predicted)).most_common(1)[0][0])

def predict_class_all(X_train, model):
    '''
    :param X_train: List of segmented mfccs
    :param model: trained model
    :return: list of predictions
    '''
    predictions = []
    for mfcc in X_train:
        predictions.append(predict_class_audio(mfcc, model))
    return predictions

def get_wav(language_num):
    '''
    Load wav file from disk and down-samples to RATE
    :param language_num (list): list of file names
    :return (numpy array): Down-sampled wav file
    '''
    y, sr = librosa.load('{}'.format(language_num))
    return(librosa.core.resample(y=y,orig_sr=sr,target_sr=RATE, scale=True))

def to_mfcc(wav):
    '''
    Converts wav file to Mel Frequency Ceptral Coefficients
    :param wav (numpy array): Wav form
    :return (2d numpy array: MFCC
    '''
    return(librosa.feature.mfcc(y=wav, sr=RATE, n_mfcc=N_MFCC))

def make_segments(mfccs):
    '''
    Makes segments of mfccs and attaches them to the labels
    :param mfccs: list of mfccs
    :param labels: list of labels
    :return (tuple): Segments with labels
    '''
    segments = []
    for mfcc in mfccs:
        for start in range(0, int(mfcc.shape[1] / COL_SIZE)):
            segments.append(mfcc[:, start * COL_SIZE:(start + 1) * COL_SIZE])
    return segments

def segment_one(mfcc):
    '''
    Creates segments from on mfcc image. If last segments is not long enough to be length of columns divided by COL_SIZE
    :param mfcc (numpy array): MFCC array
    :return (numpy array): Segmented MFCC array
    '''
    segments = []
    for start in range(0, int(mfcc.shape[1] / COL_SIZE)):
        segments.append(mfcc[:, start * COL_SIZE:(start + 1) * COL_SIZE])
    return(np.array(segments))

def create_segmented_mfccs(X_train):
    '''
    Creates segmented MFCCs from X_train
    :param X_train: list of MFCCs
    :return: segmented mfccs
    '''
    segmented_mfccs = []
    for mfcc in X_train:
        segmented_mfccs.append(segment_one(mfcc))
    return(segmented_mfccs)

def get_model():

    model = Sequential()

    model.add(Convolution2D(32, (4, 10), padding="same", input_shape=(13, 30, 1)))
    model.add(BatchNormalization())
    model.add(Activation('relu'))
    model.add(MaxPool2D())

    model.add(Convolution2D(32, (4, 10), padding="same"))
    model.add(BatchNormalization())
    model.add(Activation('relu'))
    model.add(MaxPool2D())

    model.add(Convolution2D(32, (4, 10), padding="same"))
    model.add(BatchNormalization())
    model.add(Activation('relu'))
    model.add(MaxPool2D())

    model.add(Flatten())

    model.add(Dense(256, activation='relu'))
    model.add(Dense(256, activation='relu'))
    model.add(Dropout(0.5))

    model.add(Dense(64, activation='relu'))
    model.add(Dense(64, activation='relu'))

    model.add(Dense(16, activation='relu'))
    model.add(Dense(16, activation='relu'))

    model.add(Dropout(0.5))

    model.add(Dense(4, activation='softmax'))

    model.compile(loss='categorical_crossentropy',
                  optimizer='adadelta',
                  metrics=['accuracy'])

    model.load_weights('model5.h5')

    return model

def predict(config):
    pool = multiprocessing.Pool(processes=multiprocessing.cpu_count())
    audio_files = [config.wave_path]
    X_test = pool.map(get_wav, audio_files)
    X_test = pool.map(to_mfcc, X_test)

    model = get_model()

    y_pred = predict_class_all(create_segmented_mfccs(X_test), model)

    dict = {
        0: 'english',
        1: 'arabic',
        2: 'mandarin',
        3: 'hindi'
    }

    return y_pred[0], dict

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('--wave_path', type=str, help='wave file path')

    config = parser.parse_args()

    x , y = predict(config)
    print(y[x])