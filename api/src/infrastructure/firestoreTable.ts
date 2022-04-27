import * as admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import { Table } from "../adapters/gateway/interfaces/Table";

const credential = JSON.parse(
  process.env["FIREBASE_CREDENTIAL"] as string
) as ServiceAccount;
console.log(Object.keys(credential));
admin.initializeApp({
  credential: admin.credential.cert(credential),
});
const firestore = admin.firestore();

export const firestoreTable = <T>(tableName: string): Table<T> => {
  const refs = firestore.collection(tableName);

  return {
    query: async (_) => {
      const vals = await refs.get();
      if (vals.empty) {
        return [];
      } else {
        return vals.docs.map((val) => val.data() as T);
      }
    },
    put: async (val: T) => {
      await refs.add(val);
    },
  };
};
