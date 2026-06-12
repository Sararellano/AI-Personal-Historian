const DB_NAME = "personal-historian";
const STORE = "pending-answers";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE, { keyPath: "assignedDate" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueAnswer(questionId: number, answerText: string) {
  const db = await openDatabase();
  const transaction = db.transaction(STORE, "readwrite");
  transaction
    .objectStore(STORE)
    .put({ assignedDate: new Date().toISOString().slice(0, 10), questionId, answerText });
}

export async function takePendingAnswers(): Promise<
  Array<{ assignedDate: string; questionId: number; answerText: string }>
> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const records = request.result;
      store.clear();
      resolve(records);
    };
    request.onerror = () => reject(request.error);
  });
}
