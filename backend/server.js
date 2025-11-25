import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initDatabase, getUsers, getUserById, createUser, updateUser, deleteUser } from "./database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || (process.env.RENDER ? "production" : "development");

app.use(express.json());

initDatabase();

app.get("/api/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, phone, age } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
    }

    const user = await createUser({ name, email, phone, age });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, phone, age } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
    }

    const user = await updateUser(req.params.id, { name, email, phone, age });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

if (NODE_ENV === "production") {
  // Serve arquivos estáticos da pasta raiz do projeto
  // No Render, se root directory for a raiz, funciona direto
  // Se root for backend/, precisa copiar arquivos ou ajustar caminho
  const publicPath = process.env.PUBLIC_PATH
    ? join(__dirname, process.env.PUBLIC_PATH)
    : join(__dirname, "..");

  app.use(express.static(publicPath));

  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      const indexPath = join(publicPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("Erro ao servir index.html:", err);
          res.status(404).send("Arquivo não encontrado");
        }
      });
    }
  });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${NODE_ENV}`);
  if (NODE_ENV === "production") {
    console.log(`Aplicação disponível em http://localhost:${PORT}`);
  } else {
    console.log(`API disponível em http://localhost:${PORT}/api/users`);
  }
});

