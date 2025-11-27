import express from "express";
import fs from "fs";

const app = express();
const filename = "codigos.txt";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Função para calcular diferença em horas
function hoursDifference(timestamp1, timestamp2) {
  return Math.abs(timestamp2 - timestamp1) / 3600;
}

// Define os intervalos em horas
const hoursFortransito = 2 * 24;       // 2 dias
const hoursForcaminho = 4 * 24;        // 4 dias
const hoursForcidade = 6 * 24;         // 6 dias
const hoursForrotadeentrega = 8 * 24;  // 8 dias
const hoursForentrega = 9 * 24;        // 9 dias
const hoursFortentativa = 13 * 24;     // 13 dias
const hoursFordevolvido = 15 * 24;     // 15 dias

app.all("/", (req, res) => {
  const code = req.query.code || req.body.objeto;
  if (!code) return res.status(400).send("Código não informado.");

  const sanitizedCode = String(code).replace(/[^\w-]/g, "");
  const currentTime = Math.floor(Date.now() / 1000);

  // Lê o arquivo de códigos
  let lines = [];
  if (fs.existsSync(filename)) {
    const content = fs.readFileSync(filename, "utf8");
    lines = content.split("\n").filter(line => line.trim() !== "");
  }

  let found = false;
  for (const line of lines) {
    const [storedCode, storedTimestampStr] = line.split(",");
    const storedTimestamp = parseInt(storedTimestampStr, 10);

    if (storedCode === sanitizedCode) {
      found = true;
      const hoursDiff = hoursDifference(storedTimestamp, currentTime);

      // Redireciona conforme o tempo decorrido
      if (hoursDiff < hoursFortransito)
        return res.redirect(`/tracking/transito/?code=${encodeURIComponent(sanitizedCode)}`);
      else if (hoursDiff < hoursForcaminho)
        return res.redirect(`/tracking/caminho/?code=${encodeURIComponent(sanitizedCode)}`);
      else if (hoursDiff < hoursForcidade)
        return res.redirect(`/tracking/cidade/?code=${encodeURIComponent(sanitizedCode)}`);
      else if (hoursDiff < hoursForrotadeentrega)
        return res.redirect(`/tracking/rotadeentrega/?code=${encodeURIComponent(sanitizedCode)}`);
      else if (hoursDiff < hoursForentrega)
        return res.redirect(`/tracking/entrega/?code=${encodeURIComponent(sanitizedCode)}`);
      else if (hoursDiff < hoursFortentativa)
        return res.redirect(`/tracking/tentativa/?code=${encodeURIComponent(sanitizedCode)}`);
      else if (hoursDiff < hoursFordevolvido)
        return res.redirect(`/tracking/tentativa/?code=${encodeURIComponent(sanitizedCode)}`);
      else
        return res.redirect(`/tracking/tentativa/?code=${encodeURIComponent(sanitizedCode)}`);
    }
  }

  // Se não encontrado, adiciona ao arquivo e redireciona para "postado"
  if (!found) {
    try {
      fs.appendFileSync(filename, `${sanitizedCode},${currentTime}\n`);
      return res.redirect(`/tracking/postado/?code=${encodeURIComponent(sanitizedCode)}`);
    } catch (err) {
      console.error("Erro ao gravar o arquivo:", err);
      return res.status(500).send("Erro ao salvar o código.");
    }
  }
});

// Porta do servidor
const PORT = 80;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});