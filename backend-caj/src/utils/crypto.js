// src/utils/crypto.js
// Criptografia simétrica (AES-256-GCM) para guardar segredos de usuários no banco,
// como a chave do Gemini. A chave mestra fica só no servidor, em ENCRYPTION_KEY.
const crypto = require("crypto");

const ALGORITMO = "aes-256-gcm";
const VERSAO = "v1";

function getChaveMestra() {
  const hex = String(process.env.ENCRYPTION_KEY || "").trim();
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    // Falha "fechada": sem chave mestra válida, nada é cifrado nem decifrado.
    throw new Error("ENCRYPTION_KEY não configurada no servidor (64 caracteres hexadecimais).");
  }
  return Buffer.from(hex, "hex");
}

/** Cifra um texto. Formato: v1:<iv>:<tag>:<conteúdo>, em base64. */
function cifrar(texto) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITMO, getChaveMestra(), iv);
  const conteudo = Buffer.concat([cipher.update(String(texto), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSAO, iv.toString("base64"), tag.toString("base64"), conteudo.toString("base64")].join(":");
}

/** Decifra um texto gerado por `cifrar`. Lança erro se foi alterado ou se a chave mestra mudou. */
function decifrar(valor) {
  const [versao, iv, tag, conteudo] = String(valor || "").split(":");
  if (versao !== VERSAO || !iv || !tag || !conteudo) throw new Error("Formato de dado cifrado inválido.");

  const decipher = crypto.createDecipheriv(ALGORITMO, getChaveMestra(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(conteudo, "base64")), decipher.final()]).toString("utf8");
}

module.exports = { cifrar, decifrar };
