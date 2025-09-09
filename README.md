# EEG & Spectrogram Brain Activity Analysis

Transform EEG and spectrogram data into real-time probabilities of harmful brain activity, including seizures and other neural patterns.

---

## Overview

This project allows users to upload EEG recordings and spectrogram files, and outputs predicted probabilities for various harmful brain activities. The model is trained on critically ill patient data, annotated by experts, and designed to improve detection accuracy in neurocritical care, epilepsy research, and drug development.

The platform detects:

- Seizures
- Lateralized Periodic Discharges (LPD)
- Generalized Periodic Discharges (GPD)
- Lateralized Rhythmic Delta Activity (LRDA)
- Generalized Rhythmic Delta Activity (GRDA)
- Other abnormal brain activity patterns

---

## Features

- **Upload EEG & Spectrogram Files**: Support for 50-second EEG segments and 10-minute spectrogram windows.
- **Automatic Analysis**: Advanced neural network predicts probabilities for harmful brain activity.
- **Visual Results**: Dashboard displays predicted probabilities for each class.
- **Expert-Informed**: Model trained on expert-annotated data to reduce labeling disagreements.
- **Secure & Private**: All uploads are processed safely without storing personal data.

---

## Getting Started

### Prerequisites

- Python 3.9+
- Flask or Django (depending on backend implementation)
- Libraries: `numpy`, `pandas`, `scipy`, `torch`, `tensorflow`, `matplotlib` (optional for visualization)
