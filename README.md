# 🧠 Mentalytics - Student Mental Health & Social Media Impact Predictor

Mentalytics is an end-to-end Machine Learning web application designed to evaluate and predict a student's **Mental Health Score** based on daily digital habits, physical activity, sleep patterns, academic pressure, and demographic factors.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Modern Glassmorphic Dark UI), JavaScript (ES6+ Fetch API) |
| **Backend API** | Python 3.10+, **FastAPI**, **Uvicorn** (ASGI Server), **Pydantic** (Data Validation & Schemas) |
| **Machine Learning & Pipeline** | **Scikit-Learn** (`RandomForestRegressor`, `Pipeline`, `ColumnTransformer`, `StandardScaler`, `OneHotEncoder`, `OrdinalEncoder`), **Pandas**, **NumPy**, **Joblib** |
| **Data Analysis & Training** | Jupyter Notebook (`ML_Project.ipynb`), Matplotlib, Seaborn |
| **Deployment & Production** | `Procfile` (Uvicorn / Heroku / Render Ready) |

---

## 🤖 Machine Learning Model: Why `RandomForestRegressor`?

During model development, multiple algorithms (including Linear Regression and Random Forest Regressors) were evaluated. **`RandomForestRegressor`** (optimized via `RandomizedSearchCV`) was selected as the core predictive model.

### Key Reasons for Choosing Random Forest:
1. **Handling Non-Linear & Threshold Effects**: The relationship between social media usage, sleep, and mental health is non-linear. Beyond certain threshold limits (e.g., > 5-6 hours of daily usage or < 5 hours of sleep), mental health scores decline sharply. Linear models fail to capture these step-wise thresholds effectively, whereas decision tree ensembles naturally split on non-linear boundaries.
2. **Robustness Against Overfitting & Noise**: By aggregating predictions across 100 decision trees (Bootstrap Aggregating / Bagging), Random Forest reduces variance and minimizes overfitting compared to single decision trees or complex high-variance models.
3. **Seamless Multi-Modal Feature Handling**: Handles a mixed matrix of continuous numerical values (usage hours, unlocks, sleep) and high-cardinality categorical attributes (countries, platforms, academic levels).
4. **Feature Interpretability**: Provides precise Gini impurity-based feature importances, allowing us to quantify exactly which habits impact mental health the most.

---

## 📊 How the Mental Health Score is Evaluated

The mental health score is a continuous numerical rating (0.0 to 10.0 scale) predicted through an automated scikit-learn `Pipeline`:

```
Raw User Input ➡️ Pydantic Validation ➡️ ColumnTransformer Preprocessing ➡️ RandomForest Regressor ➡️ Predicted Score
```

### Preprocessing Pipeline Steps (`ColumnTransformer`):
- **Skewed Numerical Features (`Study_Hours`)**: Applied logarithmic transformation (`log1p`) to eliminate skewness, followed by `StandardScaler` normalization.
- **Plain Numerical Features (`Age`, `Avg_Daily_Usage_Hours`, `Daily_Unlocks`, `Physical_Activity_Hours`, `Sleep_Hours_Per_Night`)**: Normalized via `StandardScaler` to ensure zero mean and unit variance.
- **Ordinal Categorical Features (`Stress_Level`)**: Encoded sequentially via `OrdinalEncoder`:
  $$\text{Low} \rightarrow 0 \quad \vert \quad \text{Medium} \rightarrow 1 \quad \vert \quad \text{High} \rightarrow 2 \quad \vert \quad \text{Very High} \rightarrow 3$$
- **Nominal Categorical Features (`Gender`, `Academic_Level`, `Most_Used_Platform`, `Purpose_Of_Use`, `Grouped_country`)**: Transformed into binary dummy vectors using `OneHotEncoder(handle_unknown='ignore')`.

---

## 📈 Feature Contribution Analysis

Feature importance values extracted directly from the trained `RandomForestRegressor` reveal clear primary drivers of mental health:

### 🏆 Top Contributing Factors (Highest Impact)

| Rank | Feature Name | Contribution Weight (%) | Description / Insight |
| :---: | :--- | :---: | :--- |
| **1** | **`Avg_Daily_Usage_Hours`** | **~69.11%** | **Dominant Factor**: Daily time spent on social media has by far the highest single impact on the predicted mental health score. |
| **2** | **`Sleep_Hours_Per_Night`** | **~10.17%** | **Primary Physiological Factor**: Quality and duration of nocturnal sleep represent the second strongest predictor. |
| **3** | **`Daily_Unlocks`** | **~4.43%** | **Digital Compulsivity**: Frequency of picking up and unlocking the device throughout the day. |
| **4** | **`Study_Hours`** | **~2.72%** | **Academic Commitment**: Daily study duration. |
| **5** | **`Physical_Activity_Hours`** | **~2.59%** | **Physical Wellness**: Daily physical exercise or activity. |

---

### 📉 Least Contributing Factors (Lowest Impact)

| Rank | Feature Name | Contribution Weight (%) | Description / Insight |
| :---: | :--- | :---: | :--- |
| **1** | **`Most_Used_Platform_WeChat`** | **~0.01%** | Specific low-frequency platform choices have minimal isolated weight on mental health. |
| **2** | **`Most_Used_Platform_LINE`** | **~0.04%** | Regional app usage variation shows negligible standalone impact. |
| **3** | **`Most_Used_Platform_VKontakte`** | **~0.05%** | Minor regional platform impact. |
| **4** | **`Academic_Level_High School`** | **~0.09%** | Educational stage alone has minimal influence compared to personal habits. |
| **5** | **`Most_Used_Platform_KakaoTalk`** | **~0.14%** | Platform choice matters vastly less than *duration* of use. |

> **Key takeaway**: *How long* a student uses social media (`Avg_Daily_Usage_Hours` @ ~69.1%) and *how well they sleep* (`Sleep_Hours_Per_Night` @ ~10.2%) drive nearly **80%** of the mental health evaluation, far outweighing *which specific app* they use or *where they live*.

---

## ⚡ API Endpoints & Request Schema

### POST `/predict`
Calculates the predicted mental health score for a given student profile.

#### Request Payload Example:
```json
{
  "age": 21,
  "gender": "Female",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 80,
  "study_hours": 5.0,
  "physical_activity_hours": 1.5,
  "sleep_hours_per_night": 7.0,
  "stress_level": "Medium"
}
```

#### Response Example:
```json
{
  "predicted_mental_health_score": 6.85
}
```

---

## 🚀 Running the Project Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Dhwani107/Mentalytics.git
cd Mentalytics
```

### 2. Set Up Virtual Environment & Install Dependencies
```bash
python -m venv .venv
# Activate on Windows:
.venv\Scripts\activate
# Activate on macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Launch FastAPI Server
```bash
uvicorn main:app --reload --port 8000
```
Open your browser at `http://localhost:8000` to interact with the application.

---

## 📂 Directory Structure

```
Mentalytics/
├── main.py                                      # FastAPI application & API endpoints
├── index.html                                   # Web user interface
├── style.css                                    # Glassmorphism styling rules
├── script.js                                    # Frontend API integration & UI logic
├── requirements.txt                             # Python dependencies
├── Procfile                                     # Production deployment configuration
├── ML_Project.ipynb                             # EDA, model training & hyperparameter tuning
├── ML_Project.html                              # Exported notebook presentation
├── Student Social Media And Mental Health Impact.csv # Dataset used for training
└── README.md                                    # Project documentation
```
