import { estaExpirado } from "./dadosLocais";

const DB_NAME = "redator-db";
const STORE = "kv";

// Conexão única, aberta na primeira operação e reaproveitada nas seguintes (PA-22).
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => {
      const db = req.result;
      // Se o navegador fechar a conexão ou outra aba pedir uma versão nova,
      // descarta a conexão guardada para que a próxima operação abra outra.
      db.onclose = () => { dbPromise = null; };
      db.onversionchange = () => { db.close(); dbPromise = null; };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null; // permite tentar de novo na próxima operação
      reject(req.error);
    };
  });

  return dbPromise;
}

// Cada valor é gravado com a data da gravação, para expirar depois de 7 dias sem
// atualização (PA-12).
interface Registro<T> {
  salvoEm: number;
  valor: T;
}

async function transacao(modo: IDBTransactionMode, operar: (store: IDBObjectStore) => void): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, modo);
    operar(tx.objectStore(STORE));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const registro: Registro<unknown> = { salvoEm: Date.now(), valor: value };
  return transacao("readwrite", (store) => store.put(registro, key));
}

/**
 * Lê um valor. Devolve `undefined` se não existir ou se tiver passado da validade
 * (nesse caso, o valor é apagado). Registros antigos, gravados sem data, também
 * são tratados como vencidos.
 */
export async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  const registro = await new Promise<Registro<T> | undefined>((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as Registro<T> | undefined);
    req.onerror = () => reject(req.error);
  });

  if (registro === undefined) return undefined;
  if (estaExpirado(registro?.salvoEm)) {
    await kvDelete(key).catch(() => { /* tenta de novo na próxima leitura */ });
    return undefined;
  }
  return registro.valor;
}

export async function kvDelete(key: string): Promise<void> {
  return transacao("readwrite", (store) => store.delete(key));
}

/** Apaga tudo o que foi guardado no IndexedDB do sistema. */
export async function kvClear(): Promise<void> {
  return transacao("readwrite", (store) => store.clear());
}
