import sqlite3 from "sqlite3";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "users.db");
let db;

const promisifyDb = (db) => {
  // Wrapper para db.run que preserva lastID e changes
  db.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes,
          });
        }
      });
    });
  };

  db.get = promisify(db.get.bind(db));
  db.all = promisify(db.all.bind(db));
  return db;
};

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        reject(err);
        return;
      }
      console.log("Conectado ao banco de dados SQLite");

      db = promisifyDb(db);

      // Criar tabela de usuários se não existir
      db.runAsync(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          age INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      )
        .then(() => {
          console.log("Tabela 'users' criada/verificada com sucesso");
          resolve();
        })
        .catch(reject);
    });
  });
};

export const getUsers = async () => {
  return await db.all("SELECT * FROM users ORDER BY id DESC");
};

export const getUserById = async (id) => {
  return await db.get("SELECT * FROM users WHERE id = ?", [id]);
};

export const createUser = async ({ name, email, phone, age }) => {
  const result = await db.runAsync(
    "INSERT INTO users (name, email, phone, age) VALUES (?, ?, ?, ?)",
    [name, email, phone || null, age || null]
  );
  return await getUserById(result.lastID);
};

export const updateUser = async (id, { name, email, phone, age }) => {
  await db.runAsync(
    "UPDATE users SET name = ?, email = ?, phone = ?, age = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, email, phone || null, age || null, id]
  );
  return await getUserById(id);
};

export const deleteUser = async (id) => {
  const result = await db.runAsync("DELETE FROM users WHERE id = ?", [id]);
  return result.changes > 0;
};

