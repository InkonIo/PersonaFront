import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDudhIxtEcQVoY04vPlLjBjoH8IkTVNln3E",
    authDomain: "personapushnotification.firebaseapp.com",
    databaseURL: "https://personapushnotification.firebaseio.com",
    projectId: "personapushnotification",
    storageBucket: "personapushnotification.appspot.com",
    messagingSenderId: "1013169922009",
    appId: "1:1013169922009:ios:37c6b82c0dd795b9ff43c8",
    measurementId: "G-ABCDEFG123"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

export { app }