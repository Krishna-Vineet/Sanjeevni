# Sanjeevni: Real-Time Hospital Network OS

**Sanjeevni** is a next-generation hospital coordination platform designed to eliminate delays in patient transfers and resource allocation during medical emergencies.

## 🚑 The Problem
In critical situations, every second counts. Currently, hospital coordination is fragmented, relying on manual phone calls and uncertain capacity data. This leads to:
- **Delays**: Doctors waste time searching for available beds/ventilators.
- **Resource Mismatch**: Emergency cases sent to hospitals that lack specific required resources.
- **Coordination Gaps**: Inefficient communication between origin hospitals, ambulances, and receiving nodes.

## 🚀 Our Solution
Sanjeevni provides a unified **Real-Time Operating System** for hospital networks, enabling:
- **Instant Dispatch**: AI-powered matching of patients with the most suitable hospital based on real-time bed availability, distance, and specialized resources.
- **Code Red Broadcasts**: Instantaneous multi-hospital alerts for critical transfers with sub-second response times.
- **AI Smart Doctor**: A clinical decision support agent that assists in triage and recommends immediate actions based on patient vitals.
- **Resource Exchange Hub**: A decentralized network for hospitals to share critical inventory like Oxygen, Blood, and PPE.

## 📊 Project Status (MVP)
- **Frontend UI**: Complete. High-fidelity, production-grade React interface with premium aesthetics and responsive design.
- **API Integration**: In Progress. The application currently uses a robust Mock Service Layer mirroring the full API contract to demonstrate functional workflows.
- **Backend**: Core architecture, folder structure, and PostgreSQL database models are finalized.
- **AI Agent**: Under development using LangChain for advanced clinical reasoning and automated triage recommendations.

## 🛠️ Tech Stack

### Frontend
- **React**: Component-based UI logic.
- **TypeScript**: Type-safe development for enterprise-grade stability.
- **Tailwind CSS 4.0**: Modern, premium styling and glassmorphism effects.
- **Framer Motion**: Smooth micro-animations for an interactive experience.
- **Lucide React**: Clean, modern iconography.

### Backend
- **FastAPI**: High-performance asynchronous API framework.
- **Celery**: Background task processing for broadcasts and AI analysis.
- **PostgreSQL**: Robust relational data management for hospital profiles and medical logs.
- **RabbitMQ**: Message broker for real-time coordination and task distribution.

### AI & Intelligence
- **LangChain**: Framework for building the "Smart Doctor" assistant and orchestration.

---
