# 🏥 CareCompanion AI



# Architecture:
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/137ea183-9e67-4bc6-bdb4-4d9a52ec9e05" />

**AI-Powered Healthcare Assistant with Chat + Appointment Booking**

CareCompanion AI is a smart healthcare companion that allows patients to describe their symptoms, receive safe AI guidance, and seamlessly book doctor appointments — all in one flow.

---

## 🚀 Features

* 🤖 AI Care Chat (context-aware, safe healthcare assistant)
* 📅 Appointment Booking & Management
* 🧠 Memory System (conversation + patient data)
* 📊 Dashboard Summary (appointments + chat insights)
* 🔄 End-to-End Workflow (Chat → Suggestion → Booking)

---

## 🏗️ Architecture Overview

The system follows a modular AI-agent architecture:

* **STT (Speech-to-Text)** → Converts voice input into text (optional)
* **Agent (LLM)** → Processes user input and generates responses
* **Memory**

  * Short-term → recent conversation context
  * Long-term → patient data, chat history
* **Tools**

  * Symptom checker
  * Appointment booking
  * Patient profile lookup
* **Scheduling System**

  * Handles appointment lifecycle (create, reschedule, cancel, reminders)

---

## 🧠 Memory Design

### Short-Term Memory

* Stores last N chat messages
* Maintains conversation context

### Long-Term Memory

* Patient profile (name, contact)
* Appointment history
* Chat history

### Storage

* Database-based persistence
* Optional vector store for semantic retrieval

---

## ⚙️ Setup Instructions

### Prerequisites

* Node.js (>= 18)
* MongoDB
* OpenAI / Claude API key

### Installation

```bash
git clone https://github.com/your-username/carecompanion-ai.git
cd carecompanion-ai
npm install
```

### Environment Variables (.env)

```
PORT=5000
MONGODB_URI=your_mongodb_connection
OPENAI_API_KEY=your_api_key
```

### Run the Server

```bash
npm run dev
```

---

## 🔌 API Endpoints

### 👤 Users

* `POST /api/users`
* `GET /api/users/:id`

### 📅 Appointments

* `POST /api/appointments`
* `GET /api/appointments/:userId`
* `PUT /api/appointments/:id`
* `DELETE /api/appointments/:id`

### 💬 Chat

* `POST /api/chat`

### 📊 Dashboard

* `GET /api/dashboard/:userId`

---

## ⚡ Latency Breakdown (Approx)

| Component       | Latency  |
| --------------- | -------- |
| STT             | ~800 ms  |
| LLM Response    | ~2–3 sec |
| Tools Execution | ~300 ms  |
| Database        | ~100 ms  |
| **Total**       | ~3–5 sec |

---

## ⚖️ Trade-offs

* Using LLM improves conversational quality but increases latency
* Memory improves personalization but adds storage complexity
* Real-time workflows require more backend coordination
* Safety prioritized over speed

---

## ⚠️ Known Limitations

* Not a replacement for professional medical advice
* Cannot diagnose or prescribe
* Dependent on external AI APIs
* Limited to text/voice input
* Appointment system is basic (no real hospital integration)

---

## 🛠️ Tech Stack

* Backend: Node.js, Express
* Database: MongoDB
* AI: OpenAI / Claude
* Frontend: React (optional)
* Deployment: Replit

---

## 🧪 Demo Flow

1. Create a user
2. Open chat → type: *"I have fever"*
3. AI suggests consultation
4. Book appointment directly
5. View in dashboard

---

## 📄 License

MIT License
