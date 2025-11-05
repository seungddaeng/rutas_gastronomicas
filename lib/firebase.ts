import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCBgZuxn1K2ABikBCga-0NjRtNFGMMui48',
  authDomain: 'rutasgastronomicas.firebaseapp.com',
  projectId: 'rutasgastronomicas',
  storageBucket: 'rutasgastronomicas.appspot.com',
  messagingSenderId: '970592502851',
  appId: '1:970592502851:web:1bd4f47e4f5a3ee1ec40f6',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export default firebase;
