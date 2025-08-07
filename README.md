# Mini-Linkedin (Full-Stack App)

This is a full-stack social media-style application built using **Vite + React** for the frontend and **Node.js + Express + MongoDB** for the backend.



## 📂 Tech Stack

### Frontend:
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- [Tailwind CSS](https://tailwindcss.com/) *(optional)*

### Backend:
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB + Mongoose](https://mongoosejs.com/)
- [JWT Authentication](https://jwt.io/)

---

## ✨ Features

- User Authentication (Login / Register)
- Create, View, and Delete Posts
- User Profiles with Profile Picture
- Like / Comment system *(optional)*
- Responsive Design

---

## 🧑‍💻 Getting Started (Local Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```
#### 2. setup backend
```bash
cd backend
npm install
touch .env
```
add your .env file
```bash
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
```
run your code 
```bash
npm run dev
```
#### 3. setup frontend

```bash
cd frontend
npm install
npm run dev
```
add env of frontend also
```bash
VITE_BASE_URL=htttp://localhost:5000/api
```




