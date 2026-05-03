```

## ⚙️ Installation & Setup

### Local Development
1. **Clone the repository**:
   ```bash
   git clone [https://github.com/amanjadhav14/loglens-siem.git](https://github.com/amanjadhav14/loglens-siem.git)
   cd loglens-siem
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

## 🌐 Deployment
*   **Frontend**: Hosted at [loglens-siem.vercel.app](https://loglens-siem.vercel.app).
*   **Backend**: Powered by Render.

## 🛡️ About the Developer
Developed by a Computer Science Engineer with a specialized Diploma in IT and Cybersecurity certification. This project reflects a commitment to scaling secure, professional-grade enterprise solutions.

---
*Note: This SIEM is designedI have updated the **README.md** to include the default credentials for your SOC dashboard. This makes it easier for others to test your project while it's in the demonstration phase.

---

# LogLens - SIEM Dashboard

LogLens is a comprehensive Security Information and Event Management (SIEM) dashboard designed for real-time log analysis, attack detection, and threat monitoring. This project bridges the gap between raw security data and actionable insights through a sleek React-based frontend and a high-performance Flask backend.

## 🚀 Features
*   **Real-time Log Ingestion**: Seamlessly process and visualize incoming security logs.
*   **Attack Detection**: Utilizes a signature-based detection engine (`detector.py`) to identify SQL Injection, Brute Force, and XSS attacks.
*   **Interactive SOC Dashboard**: Monitor security posture through high-resolution visual charts and metrics.
*   **Geographical Mapping**: Visualize attack origins using IP-based geolocation.
*   **Report Generation**: Export findings directly to CSV or PDF for compliance and auditing.

## 🔐 Default Credentials
For demonstration purposes, you can access the dashboard using the following credentials:
*   **Username**: `admin`
*   **Password**: `1234`

## 🛠️ Technical Stack
*   **Frontend**: React.js, Tailwind CSS (Deployed on **Vercel**).
*   **Backend**: Python, Flask, Gunicorn (Deployed on **Render**).
*   **Security**: Signature-based pattern matching, CORS protection.
*   **Environment**: Developed and tested on **Kali Linux**.

## 📂 Project Structure
```text
loglens-siem/
├── frontend/             # React application (UI/UX)
└── backend/              # Python Flask API
    ├── app.py            # Main entry point
    ├── detector.py       # Threat detection logic
    ├── signatures.json   # Security attack patterns
    └── requirements.txt  # Python dependencies
```

## ⚙️ Installation & Setup

### Local Development
1. **Clone the repository**:
   ```bash
   git clone [https://github.com/amanjadhav14/loglens-siem.git](https://github.com/amanjadhav14/loglens-siem.git)
   cd loglens-siem
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

## 🌐 Deployment
*   **Frontend**: Hosted at [loglens-siem.vercel.app](https://loglens-siem.vercel.app).
*   **Backend**: Powered by Render.

## 🛡️ About the Developer
Developed by a Computer Science Engineer with a specialized Diploma in IT and Cybersecurity certification. This project reflects a commitment to scaling secure, professional-grade enterprise solutions.

---
*Note: This SIEM is designed for educational and professional demonstration purposes in SOC environments.*
```
