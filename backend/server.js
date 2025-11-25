import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
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
  // Em produção, serve arquivos estáticos
  // Primeiro tenta da pasta atual (backend/) - para Render (arquivos copiados no build)
  // Se não encontrar, tenta da pasta pai - para desenvolvimento local
  const currentPath = __dirname;
  const parentPath = join(__dirname, "..");

  // Tenta servir da pasta atual primeiro (onde os arquivos são copiados no build)
  app.use(express.static(currentPath));

  // Também tenta da pasta pai (caso esteja rodando localmente)
  app.use(express.static(parentPath));

  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      // Tenta index.html na pasta atual primeiro (Render)
      const indexPathCurrent = join(currentPath, "index.html");
      const indexPathParent = join(parentPath, "index.html");

      // Verifica qual arquivo existe e serve
      if (existsSync(indexPathCurrent)) {
        res.sendFile(indexPathCurrent);
      } else if (existsSync(indexPathParent)) {
        res.sendFile(indexPathParent);
      } else {
        console.error("index.html não encontrado em nenhum dos caminhos");
        res.status(404).send("index.html não encontrado");
      }
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

