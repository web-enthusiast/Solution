# train_model.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib

# Load your labeled dataset (positive and negative examples)
data = pd.read_excel("C:/Users/Daphney/Downloads/DisbBackup_200867168_20220405091952327.xlsx")

# Preprocess text data (tokenization, stop words removal, etc.)
vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(data["document_text"])
y = data["risk_label"]

# Split data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a logistic regression model
model = LogisticRegression()
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# Save the trained model and vectorizer
joblib.dump(model, "risk_analysis_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")
