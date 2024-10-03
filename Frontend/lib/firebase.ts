import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "<YOUR API KEY>",
  authDomain: "content-creator-435618.firebaseapp.com",
  projectId: "content-creator-435618",
  storageBucket: "content-creator-435618.appspot.com",
  messagingSenderId: "490882006281",
  appId: "1:490882006281:web:6d666516e4c3bcdb52e7d8",
  measurementId: "G-NKKMQQSV15"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)