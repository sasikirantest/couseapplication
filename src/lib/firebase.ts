import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6F73jqlGtyYB9cmCQtjDVsQ35M9MYuEI",
  authDomain: "video-course-f932c.firebaseapp.com",
  projectId: "video-course-f932c",
  storageBucket: "video-course-f932c.firebasestorage.app",
  messagingSenderId: "946403967881",
  appId: "1:946403967881:web:0c054ce88503e988a19758",
  measurementId: "G-XDB80GT61T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;