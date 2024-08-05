const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 3000;

const repertorioPath = path.join(__dirname, "repertorio.json");

app.use(express.json());
app.use(express.static(__dirname));

app.post("/canciones", async (req, res) => {
  try {
    const repertorio = await getRepertorio();

    if (!req.body.titulo.trim() || !req.body.artista.trim() || !req.body.tono.trim()) {
      return res.status(400).json({ error: "Los datos de la canción no pueden estar vacíos" });
    }

    if (repertorio.some((c) => c.id === req.body.id)) {
      return res.status(400).json({ error: "El ID de la canción ya existe, elige otro ID" });
    }

    const nuevaCancion = req.body;
    nuevaCancion.id = generateId();
    repertorio.push(nuevaCancion);
    await saveRepertorio(repertorio);
    res.status(201).json({ message: "Canción agregada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/canciones", async (req, res) => {
  try {
    const repertorio = await getRepertorio();
    res.json(repertorio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.put("/canciones/:id", async (req, res) => {
  try {
    const repertorio = await getRepertorio();
    const id = req.params.id;
    const index = repertorio.findIndex((c) => c.id === id);

    if (!req.body.titulo || !req.body.artista || !req.body.tono) {
      return res.status(400).json({ error: "Los datos de la canción son incompletos" });
    }

    if (index === -1) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }

    if (repertorio.some((c, i) => i !== index && c.id === req.body.id)) {
      return res.status(400).json({ error: "El ID de la canción ya existe, elige otro ID" });
    }

    repertorio[index] = { id, ...req.body };
    await saveRepertorio(repertorio);
    res.json({ message: "Canción editada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/canciones/:id", async (req, res) => {
  try {
    const repertorio = await getRepertorio();
    const id = req.params.id;
    const cancion = repertorio.find((c) => c.id === id);
    if (cancion) {
      res.json(cancion);
    } else {
      res.status(404).json({ error: "Canción no encontrada" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.delete("/canciones/:id", async (req, res) => {
  try {
    const repertorio = await getRepertorio();
    const id = req.params.id;
    const index = repertorio.findIndex((c) => c.id === id);
    if (index !== -1) {
      repertorio.splice(index, 1);
      await saveRepertorio(repertorio);
      res.json({ message: "Canción eliminada exitosamente" });
    } else {
      res.status(404).json({ error: "No se encuentra la cancion" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

async function getRepertorio() {
  const repertorioContent = await fs.readFile(repertorioPath, "utf-8");
  return JSON.parse(repertorioContent);
}

async function saveRepertorio(repertorio) {
  await fs.writeFile(repertorioPath, JSON.stringify(repertorio, null, 2));
}

function generateId() {
  return Math.floor(Math.random() * 9999).toString();
}