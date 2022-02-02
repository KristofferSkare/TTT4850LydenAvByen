import firebase from "firebase/app";

import "firebase/firestore";


firebase.initializeApp({
    apiKey: 'AIzaSyBlwk3EHwhLvVlgzZEbQhrsGpQcCW0UYvY',
    projectId: 'ttt4850lydenavbyen-a54cf'
  });
  
let db = firebase.firestore();

const converter = <T,>() => ({
    toFirestore: (data: Partial<T>) => data,
    fromFirestore: (snap: firebase.firestore.QueryDocumentSnapshot) => snap.data() as T,
  });
const doc = <T,>(docPath: string) => firebase.firestore().doc(docPath).withConverter(converter<T>());
const collection = <T,>(collectionPath: string) => firebase.firestore().collection(collectionPath).withConverter(converter<T>());

export {db, doc, collection};
export default firebase;