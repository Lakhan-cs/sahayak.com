from pathlib import Path
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = Path(__file__).resolve().parent
DATASET = BASE_DIR / "requirement_expanded_v2.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

data = pd.read_csv(DATASET).dropna(subset=["text", "service"])
X = data["text"].astype(str)
y = data["service"].astype(str)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), min_df=1, sublinear_tf=True)
model = LogisticRegression(max_iter=2000, class_weight="balanced")
X_train_features = vectorizer.fit_transform(X_train)
model.fit(X_train_features, y_train)
predictions = model.predict(vectorizer.transform(X_test))
print(f"Training records: {len(X_train)}")
print(f"Testing records : {len(X_test)}")
print(f"Accuracy        : {accuracy_score(y_test, predictions):.2f}")
print(classification_report(y_test, predictions, zero_division=0))
joblib.dump(model, MODEL_DIR / "service_model.pkl")
joblib.dump(vectorizer, MODEL_DIR / "vectorizer.pkl")
print("Models saved successfully.")
