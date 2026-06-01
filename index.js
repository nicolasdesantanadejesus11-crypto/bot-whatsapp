const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const express = require("express");
const P = require("pino");
const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const tiktok = require("tiktokdl-core");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const MERCADO_PAGO_TOKEN = "APP_USR-8124409326410768-052619-b7ead4f96b8eb757dc8168899e2ab24f-580463856";

const mpClient = new MercadoPagoConfig({
  accessToken: MERCADO_PAGO_TOKEN
});

const payment = new Payment(mpClient);

const FILE_PIX = "./database/pix.json";

let pixPendentes = fs.existsSync(FILE_PIX)
  ? JSON.parse(fs.readFileSync(FILE_PIX))
  : {};

const savePix = () =>
  fs.writeFileSync(FILE_PIX, JSON.stringify(pixPendentes, null, 2));
// ================= ADV =================
const FILE_ADVS = "./database/advs.json";

let advs = fs.existsSync(FILE_ADVS)
  ? JSON.parse(fs.readFileSync(FILE_ADVS))
  : {};

const saveAdvs = () =>
  fs.writeFileSync(FILE_ADVS, JSON.stringify(advs, null, 2));

// ================= EXPRESS =================
const app = express();

app.get("/", (req, res) => {
  res.send("SANTANA BOT ONLINE");
});

app.listen(process.env.PORT || 3000);

// ================= AUSÊNCIA =================
const FILE_AUSENCIA = "./database/ausencias.json";

let ausencias = fs.existsSync(FILE_AUSENCIA)
  ? JSON.parse(fs.readFileSync(FILE_AUSENCIA))
  : {};

const saveAusencias = () =>
  fs.writeFileSync(FILE_AUSENCIA, JSON.stringify(ausencias, null, 2));

// ================= CONFIG =================
const ADMIN_USER = "_santanarlk";
const ADMIN_PASS = "nicolas1234";

const FILE_KEYS = "./database/keys.json";
const FILE_GRUPOS = "./database/grupos.json";

let keys = fs.existsSync(FILE_KEYS)
  ? JSON.parse(fs.readFileSync(FILE_KEYS))
  : {};

let gruposAtivos = fs.existsSync(FILE_GRUPOS)
  ? JSON.parse(fs.readFileSync(FILE_GRUPOS))
  : {};

const save = (f, d) =>
  fs.writeFileSync(f, JSON.stringify(d, null, 2));

let loggedIn = {};

// ================= LIMPA KEYS =================
setInterval(() => {

  const now = Date.now();

  for (const k in keys) {
    if (keys[k].expira && now > keys[k].expira) {
      delete keys[k];
    }
  }

  save(FILE_KEYS, keys);

}, 60000);

// ================= FUNÇÕES =================
function textoMsg(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ""
  ).trim();
}

async function isAdmin(sock, jid, sender) {

  const meta = await sock.groupMetadata(jid);

  const p = meta.participants.find(
    x => x.id === sender
  );

  return (
    p?.admin === "admin" ||
    p?.admin === "superadmin"
  );
}

// ================= BOT =================
async function iniciarBot() {

  const {
    state,
    saveCreds
  } = await useMultiFileAuthState("sessao");

  const sock = makeWASocket({
    auth: state,
    logger: P({
      level: "silent"
    }),
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on(
    "connection.update",
    ({ connection, qr, lastDisconnect }) => {

      if (qr) {
        qrcode.generate(qr, {
          small: true
        });
      }

      if (connection === "close") {

        const code =
          lastDisconnect?.error?.output?.statusCode;

        if (code !== DisconnectReason.loggedOut) {
          iniciarBot();
        }
      }
    }
  );

  sock.ev.on(
    "messages.upsert",
    async ({ messages }) => {

      try {

        const msg = messages[0];

        if (!msg.message || msg.key.fromMe)
          return;

        const jid = msg.key.remoteJid;

        const isGroup =
          jid.endsWith("@g.us");

        const sender =
          msg.key.participant || jid;

        const texto = textoMsg(msg);

        const cmd =
          texto.split(" ")[0].toLowerCase();
	const comandosLiberadosPv = [
  ".painel",
  ".login",
  ".gerarkey",
  ".reiniciar",
  ".comprarkey",
  ".verkey"
];

if (
  !jid.endsWith("@g.us") &&
  texto.startsWith(".") &&
  !comandosLiberadosPv.includes(cmd)
) {
  return sock.sendMessage(jid, {
    text:
"❌ Esse comando só funciona em grupo."
  });
}



// ================= AUTO RESPOSTA PV =================
const autoPvCooldown = {};

if (!isGroup && !texto.startsWith(".")) {
  const agora = Date.now();

  if (
    !autoPvCooldown[jid] ||
    agora - autoPvCooldown[jid] > 60000
  ) {
    autoPvCooldown[jid] = agora;

    return sock.sendMessage(jid, {
      text:
`╭━━〔 🤖 SANTANA BOT 〕━━⬣

👋 Olá, seja bem-vindo!

Para comprar uma key, use:

.comprarkey 1
.comprarkey 5
.comprarkey 15
.comprarkey 30

💸 O bot vai gerar um Pix automático.

Depois que pagar, você recebe sua key aqui no privado.

Para ativar no grupo, mande no grupo:

.ativar SUAKEY

Exemplo:
.ativar KEY-ABC123

╰━━━━━━━━━━━━━━⬣`
    });
  }

  return;
}
		  
      // ================= PAINEL =================
      if (cmd === ".painel") {

        if (!loggedIn[jid]) {
          return sock.sendMessage(jid, {
            text:
`╭━━〔 👑 PAINEL DEV 〕━━⬣
┃ ❌ Login não feito
┃
┃ 🔐 Fazer login:
┃ .login
╰━━━━━━━━━━━━━━⬣`
          });
        }

        return sock.sendMessage(jid, {
          text:
`╭━━〔 🔑 PAINEL KEY 〕━━⬣
┃ ✅ Login ativo
┃
┃ 🔑 Gerar key:
┃ .gerarkey 1
┃ .gerarkey 5
┃ .gerarkey 15
┃ .gerarkey 30
┃
┃ 📅 Ver keys:
┃ .verkeys
┃
┃ ♻️ Reiniciar:
┃ .reiniciar
╰━━━━━━━━━━━━━━⬣`
        });
      }
	  
	  
      // ================= VER KEYS =================
      if (cmd === ".verkeys" || cmd === ".verkey") {

        if (!loggedIn[jid]) {
          return sock.sendMessage(jid, {
            text: "❌ Faça login primeiro"
          });
        }

        let txt = "╭━━〔 🔑 GRUPOS ATIVOS 〕━━⬣\n\n";

        for (const k in keys) {

          const data = new Date(
            keys[k].expira
          ).toLocaleString("pt-BR");

          let nomeGrupo = "SEM GRUPO";

          if (keys[k].grupo) {

            try {

              const meta =
                await sock.groupMetadata(
                  keys[k].grupo
                );

              nomeGrupo = meta.subject;

            } catch {
              nomeGrupo = "GRUPO NÃO ENCONTRADO";
            }
          }

          txt +=
`👥 Grupo:
${nomeGrupo}

🔑 Key:
${k}

⏳ Expira:
${data}

━━━━━━━━━━━━━━
`;
        }

        txt += "\n╰━━━━━━━━━━━━━━⬣";

        return sock.sendMessage(jid, {
          text: txt
        });
      }

      // ================= LOGIN =================
      if (cmd === ".login") {

        const [, u, p] = texto.split(" ");

        if (
          u === ADMIN_USER &&
          p === ADMIN_PASS
        ) {

          loggedIn[jid] = true;

          return sock.sendMessage(jid, {
            text:
`✅ LOGIN OK

Agora use:

.painel`
          });
        }

        return sock.sendMessage(jid, {
          text: "❌ LOGIN ERRADO"
        });
      }

      // ================= REINICIAR =================
      if (cmd === ".reiniciar") {

        if (!loggedIn[jid]) {
          return sock.sendMessage(jid, {
            text:
"❌ Faça login primeiro"
          });
        }

        await sock.sendMessage(jid, {
          text:
`♻️ Reiniciando bot...`
        });

        process.exit(1);
      }

      // ================= GERAR KEY =================
      if (cmd === ".gerarkey") {

        if (!loggedIn[jid]) {

          return sock.sendMessage(jid, {
            text:
"❌ Faça login primeiro"
          });
        }

        const dias =
          parseInt(texto.split(" ")[1]) || 1;

        const key =
          "KEY-" +
          Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase();

        keys[key] = {
          expira:
            Date.now() +
            dias * 86400000,

          grupo: null
        };

        save(FILE_KEYS, keys);

        return sock.sendMessage(jid, {
          text:
`🔑 KEY GERADA

${key}

⏳ ${dias} dia(s)

Use:
.ativar ${key}`
        });
      }

      // ================= ATIVAR =================
      if (cmd === ".ativar") {

        const key =
          texto.split(" ")[1];

        if (!keys[key]) {

          return sock.sendMessage(jid, {
            text: "❌ KEY inválida"
          });
        }

        if (
          Date.now() >
          keys[key].expira
        ) {

          delete keys[key];

          save(FILE_KEYS, keys);

          return sock.sendMessage(jid, {
            text: "❌ KEY expirada"
          });
        }

        keys[key].grupo = jid;

        gruposAtivos[jid] = key;

        save(FILE_KEYS, keys);
        save(FILE_GRUPOS, gruposAtivos);

        return sock.sendMessage(jid, {
          text:
"✅ GRUPO ATIVADO"
        });
      }

      // ================= BLOQUEIO =================
      if (
        isGroup &&
        !gruposAtivos[jid]
      ) {

        if (texto.startsWith(".")) {

          return sock.sendMessage(jid, {
            text:
`❌ Grupo sem key.

Use:
.ativar KEY`
          });
        }

        return;
      }
	  
	        // ================= ABRIR =================
      if (cmd === ".a" || cmd === "a") {

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só admin"
          });
        }

        await sock.groupSettingUpdate(
          jid,
          "not_announcement"
        );

        return sock.sendMessage(jid, {
          text: "🔓 GRUPO ABERTO"
        });
      }

      // ================= FECHAR =================
      if (cmd === ".f" || cmd === "f") {

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só admin"
          });
        }

        await sock.groupSettingUpdate(
          jid,
          "announcement"
        );

        return sock.sendMessage(jid, {
          text: "🔒 GRUPO FECHADO"
        });
      }

      // ================= DELETE =================
      if (cmd === ".d" || cmd === "d") {

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só admin"
          });
        }

        const quoted =
          msg.message?.extendedTextMessage?.contextInfo;

        if (!quoted?.stanzaId) {
          return sock.sendMessage(jid, {
            text: "❌ Responda uma mensagem"
          });
        }

        await sock.sendMessage(jid, {
          delete: {
            remoteJid: jid,
            fromMe: false,
            id: quoted.stanzaId,
            participant: quoted.participant
          }
        });

        return sock.sendMessage(jid, {
          react: {
            text: "🗑️",
            key: msg.key
          }
        });
      }
	  
	  
	  // ================= COMANDO BAN =================
if (cmd === ".ban") {
  if (!isGroup) {
    return sock.sendMessage(jid, {
      text: "❌ Esse comando só funciona em grupo."
    });
  }

  if (!(await isAdmin(sock, jid, sender))) {
    return sock.sendMessage(jid, {
      text: "❌ Só admin pode usar."
    });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const user = context?.mentionedJid?.[0] || context?.participant;

  if (!user) {
    return sock.sendMessage(jid, {
      text: "❌ Marque alguém ou responda a mensagem para banir"
    });
  }

  // Verificar se o usuário é admin
  const userIsAdmin = await isAdmin(sock, jid, user);
  if (userIsAdmin) {
    return sock.sendMessage(jid, {
      text: "❌ Não posso banir um administrador."
    });
  }

  // Banir o usuário do grupo
  await sock.groupParticipantsUpdate(jid, [user], "remove");
  
  return sock.sendMessage(jid, {
    text: `🚫 USUÁRIO BANIDO\n\n👤 @${user.split("@")[0]}`,
    mentions: [user]
  });
}


			  
	

      // ================= ADV =================
      if (cmd === ".adv") {

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só admin"
          });
        }

        const mentioned =
          msg.message?.extendedTextMessage
            ?.contextInfo?.mentionedJid;

        if (!mentioned?.[0]) {
          return sock.sendMessage(jid, {
            text: "❌ Marque alguém"
          });
        }

        const user = mentioned[0];

        advs[user] =
          (advs[user] || 0) + 1;

        saveAdvs();

        if (advs[user] >= 3) {

          await sock.groupParticipantsUpdate(
            jid,
            [user],
            "remove"
          );

          advs[user] = 0;
          saveAdvs();

          return sock.sendMessage(jid, {
            text:
` BANIDO

👤 @${user.split("@")[0]}
⚠️ 3/3 ADV`,
            mentions: [user]
          });
        }

        return sock.sendMessage(jid, {
          text:
`⚠️ ADV ${advs[user]}/3

👤 @${user.split("@")[0]}`,
          mentions: [user]
        });
      }

      // ================= REMOVER ADV =================
      if (cmd === ".removeradv") {

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só admin"
          });
        }

        const mentioned =
          msg.message?.extendedTextMessage
            ?.contextInfo?.mentionedJid;

        if (!mentioned?.[0]) {
          return sock.sendMessage(jid, {
            text: "❌ Marque alguém"
          });
        }

        const user = mentioned[0];

        advs[user] =
          Math.max(0, (advs[user] || 0) - 1);

        saveAdvs();

        return sock.sendMessage(jid, {
          text:
`✅ ADV REMOVIDA

👤 @${user.split("@")[0]}
📊 ${advs[user]}/3`,
          mentions: [user]
        });
      }
	  
	        // ================= S5 =================
      if (cmd === ".s5" || cmd === "s5") {

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só admin"
          });
        }

        const meta = await sock.groupMetadata(jid);
        const members = meta.participants.map(p => p.id);

        const textBase =
`⸺͟͞🎮 *ᴘᴜxᴀɴᴅᴏ sᴀʟᴀ* 🎮

> 🔥 *ᴄᴏʀʀᴇ ᴘʀᴏ x4 ᴘʀʀ*
> ⚡ *ᴠᴀɪ ʟᴏᴛᴀʀ ᴊᴊ KKKKK*
> 🚀 *sᴀʟᴀ ᴏɴ ᴀɢᴏʀᴀ*

> ׄ 🎯 ⃞. *sᴀɴᴛᴀɴᴀ ʙᴏᴛ*`;

        for (let i = 0; i < 8; i++) {

          await sock.sendMessage(jid, {
            text:
`${textBase}

*${i + 1}/8*`,
            mentions: members
          });

          await new Promise(r =>
            setTimeout(r, 1200)
          );
        }

        return sock.sendMessage(jid, {
          poll: {
            name: "🎮 JOGADORES ONLINE 🔥",
            values: [
              "🚀 ONLINE",
              "💤 OFFLINE"
            ],
            selectableCount: 1
          }
        });
      }
	  
	  
	   // ================= MENU =================
if (cmd === ".menu" || cmd === ".help") {

  await sock.sendMessage(jid, {
    image: fs.readFileSync("./media/menus/menu.png"),
    caption: `
╭━━━〔 𝗦𝗔𝗡𝗧𝗔𝗡𝗔 𝗕𝗢𝗧 〕━━━⬣
┃ 👤 Usuário:
┃ @${sender.split("@")[0]}
┃
┃ 🤖 Status: ONLINE
╰━━━━━━━━━━━━━━━━⬣

╭━━〔 🚫 ADM 〕━━⬣
┃ .a
┃ .f
┃ .d
┃ .s5
┃ .t mensagem
┃ .revelar
┃ .promover
┃ .rebaixar
┃ .adv @
┃ .removeradv @
╰━━━━━━━━━━━━━━⬣

╭━━〔 👤 MEMBROS 〕━━⬣
┃ .gay
┃ .lindo
┃ .play nome
┃ .tiktok
┃ .menu/.help
┃ .fig
╰━━━━━━━━━━━━━━⬣
`,
    mentions: [sender]
  }, { quoted: msg });

}

      // ================= GAY =================
      if (cmd === ".gay") {

        if (!isGroup) {
          return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupo"
          });
        }

        const meta = await sock.groupMetadata(jid);

        const membros = meta.participants
          .map(v => v.id)
          .filter(v => v !== sock.user.id);

        const alvo =
          membros[Math.floor(Math.random() * membros.length)];

        const porcentagem =
          Math.floor(Math.random() * 101);

        await sock.sendMessage(jid, {
          image: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Gay_Pride_Flag.svg/1280px-Gay_Pride_Flag.svg.png"
          },
          caption:
`╭━━━〔 🏳️‍🌈 GAY METER 〕━━━⬣
┃ 👤 Sorteado:
┃ @${alvo.split("@")[0]}
┃
┃ 💅 Resultado:
┃ ${porcentagem}% GAY KKKKKKK
╰━━━━━━━━━━━━━━━━⬣`,
          mentions: [alvo]
        });

        await sock.sendMessage(jid, {
          react: {
            text: "🏳️‍🌈",
            key: msg.key
          }
        });
      }


      // ================= LINDO =================
      if (cmd === ".lindo") {

        const porcentagem =
          Math.floor(Math.random() * 101);

        await sock.sendMessage(jid, {
          image: {
            url: "https://wallpapers.com/images/hd/handsome-giga-chad-hmsvijj0ji4dhedr.jpg"
          },
          caption:
`╭━━━〔 😍 LINDÔMETRO 〕━━━⬣
┃ 👤 Usuário:
┃ @${sender.split("@")[0]}
┃
┃ ✨ Resultado:
┃ ${porcentagem}% LINDO(A)
╰━━━━━━━━━━━━━━━━⬣`,
          mentions: [sender]
        });

        await sock.sendMessage(jid, {
          react: {
            text: "😍",
            key: msg.key
          }
        });
      }
	  
	        // ================= TOTAG =================
      if (cmd === ".t" || cmd === "t") {

        try {

          if (!isGroup) {
            return sock.sendMessage(jid, {
              text: "❌ Esse comando só funciona em grupo."
            });
          }

          if (!(await isAdmin(sock, jid, sender))) {
            return sock.sendMessage(jid, {
              text: "❌ Só admin pode usar."
            });
          }

          const meta = await sock.groupMetadata(jid);
          const members = meta.participants.map(p => p.id);

          const context =
            msg.message?.extendedTextMessage?.contextInfo;

          const quoted = context?.quotedMessage;

          const textoComando = texto.includes(" ")
            ? texto.slice(texto.indexOf(" ") + 1).trim()
            : "";

          if (!quoted && textoComando) {
            return sock.sendMessage(jid, {
              text: textoComando,
              mentions: members
            });
          }

          if (!quoted) {
            return sock.sendMessage(jid, {
              text:
`❌ Use assim:

.t mensagem

Ou responda texto, áudio, vídeo, foto ou figurinha com:

.t`
            });
          }

          if (
            quoted.conversation ||
            quoted.extendedTextMessage?.text
          ) {
            const txt =
              textoComando ||
              quoted.conversation ||
              quoted.extendedTextMessage.text;

            return sock.sendMessage(jid, {
              text: txt,
              mentions: members
            });
          }

          if (quoted.imageMessage) {
            const buffer =
              await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                {
                  logger: P({ level: "silent" }),
                  reuploadRequest:
                    sock.updateMediaMessage
                }
              );

            return sock.sendMessage(jid, {
              image: buffer,
              caption:
                textoComando ||
                quoted.imageMessage.caption ||
                "‎",
              mentions: members
            });
          }

          if (quoted.videoMessage) {
            const buffer =
              await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                {
                  logger: P({ level: "silent" }),
                  reuploadRequest:
                    sock.updateMediaMessage
                }
              );

            return sock.sendMessage(jid, {
              video: buffer,
              caption:
                textoComando ||
                quoted.videoMessage.caption ||
                "‎",
              mentions: members
            });
          }

          if (quoted.audioMessage) {
            const buffer =
              await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                {
                  logger: P({ level: "silent" }),
                  reuploadRequest:
                    sock.updateMediaMessage
                }
              );

            return sock.sendMessage(jid, {
              audio: buffer,
              mimetype: "audio/mp4",
              ptt:
                quoted.audioMessage.ptt || false,
              mentions: members
            });
          }

          if (quoted.stickerMessage) {
            const buffer =
              await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                {
                  logger: P({ level: "silent" }),
                  reuploadRequest:
                    sock.updateMediaMessage
                }
              );

            return sock.sendMessage(jid, {
              sticker: buffer,
              mentions: members
            });
          }

          return sock.sendMessage(jid, {
            text:
"❌ Esse tipo de mensagem não é suportado no totag."
          });

        } catch (e) {

          console.log(
            "ERRO TOTAG:",
            e.message
          );

          return sock.sendMessage(jid, {
            text: "❌ Erro no comando totag."
          });
        }
      }

      // ================= REVELAR =================
      if (cmd === ".revelar" || cmd === ".r") {

        try {

          if (!isGroup) {
            return sock.sendMessage(jid, {
              text: "❌ Esse comando só funciona em grupo."
            });
          }

          const context =
            msg.message?.extendedTextMessage?.contextInfo;

          const quoted =
            context?.quotedMessage;

          if (!quoted) {
            return sock.sendMessage(jid, {
              text:
`❌ Use respondendo uma foto ou vídeo com:

.revelar`
            });
          }

          if (quoted.imageMessage) {
            const buffer =
              await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                {
                  logger: P({ level: "silent" }),
                  reuploadRequest:
                    sock.updateMediaMessage
                }
              );

            return sock.sendMessage(jid, {
              image: buffer,
              caption:
                quoted.imageMessage.caption ||
                "‎"
            });
          }

          if (quoted.videoMessage) {
            const buffer =
              await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                {
                  logger: P({ level: "silent" }),
                  reuploadRequest:
                    sock.updateMediaMessage
                }
              );

            return sock.sendMessage(jid, {
              video: buffer,
              caption:
                quoted.videoMessage.caption ||
                "‎"
            });
          }

          return sock.sendMessage(jid, {
            text:
"❌ Só consigo revelar/remandar foto ou vídeo."
          });

        } catch (e) {

          console.log(
            "ERRO REVELAR:",
            e.message
          );

          return sock.sendMessage(jid, {
            text: "❌ Erro ao revelar mídia."
          });
        }
      }
	  
	  
      // ================= TIKTOK =================
      if (cmd === ".tiktok") {
        try {
          const url = texto.split(" ")[1];

          if (!url) {
            return sock.sendMessage(jid, {
              text: "❌ Use: .tiktok link"
            });
          }

          await sock.sendMessage(jid, {
            text: "🎵 Baixando TikTok sem marca d'água..."
          });

          const api = await axios.get(
            `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
          );

          const videoUrl = api.data?.data?.play;

          if (!videoUrl) {
            return sock.sendMessage(jid, {
              text: "❌ Não consegui pegar o vídeo desse link."
            });
          }

          await sock.sendMessage(jid, {
            video: { url: videoUrl },
            caption:
`╭━━━〔 🎵 TIKTOK 〕━━━⬣
┃ ✅ Vídeo baixado
┃ 🚫 Sem marca d'água
╰━━━━━━━━━━━━━━⬣`
          });

          await sock.sendMessage(jid, {
            react: {
              text: "☑️",
              key: msg.key
            }
          });

        } catch (e) {
          console.log("ERRO TIKTOK:", e.response?.data || e.message);

          return sock.sendMessage(jid, {
            text: "❌ Erro ao baixar TikTok."
          });
        }
      } 
	 

// ================= COMPRAR KEY PIX =================
if (cmd === ".comprarkey") {
  try {
    const dias = parseInt(texto.split(" ")[1]);

    const precos = {
      1: 1.00,
      5: 3.00,
      15: 7.50,
      30: 11.00
    };

    if (!precos[dias]) {
      return sock.sendMessage(jid, {
        text: "❌ Use: .comprarkey 1, 5, 15 ou 30"
      });
    }

    const pagamento = await payment.create({
      body: {
        transaction_amount: precos[dias],
        description: `KEY SANTANA BOT ${dias} DIA(S)`,
        payment_method_id: "pix",
        payer: {
          email: "cliente@santanabot.com"
        },
        metadata: {
          jid,
          dias
        }
      }
    });

    const idPagamento = pagamento.id;

    pixPendentes[idPagamento] = {
      jid,
      dias,
      valor: precos[dias],
      entregue: false
    };

    savePix();

    const qrBase64 =
      pagamento.point_of_interaction.transaction_data.qr_code_base64;

    const copiaCola =
      pagamento.point_of_interaction.transaction_data.qr_code;

    await sock.sendMessage(jid, {
      image: Buffer.from(qrBase64, "base64"),
      caption:
`╭━━〔 💸 COMPRAR KEY 〕━━⬣
┃ Plano: ${dias} dia(s)
┃ Valor: R$ ${precos[dias].toFixed(2)}
┃
┃ Pague o Pix e aguarde.
┃ A key será enviada automaticamente.
╰━━━━━━━━━━━━━━⬣

PIX COPIA E COLA:

${copiaCola}`
    });

  } catch (e) {
    console.log("ERRO COMPRARKEY:", e.response?.data || e.message);

    return sock.sendMessage(jid, {
      text: "❌ Erro ao gerar Pix."
    });
  }
}

	 
	

      // ================= PROMOVER ADM =================
      if (cmd === ".promover") {

        if (!isGroup) {
          return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupo."
          });
        }

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só admin pode usar."
          });
        }

        const context =
          msg.message?.extendedTextMessage?.contextInfo;

        const user =
          context?.mentionedJid?.[0] ||
          context?.participant;

        if (!user) {
          return sock.sendMessage(jid, {
            text:
`❌ Use assim:

.promover @membro

Ou responda a mensagem da pessoa com:

.promover`
          });
        }

        await sock.groupParticipantsUpdate(
          jid,
          [user],
          "promote"
        );

        return sock.sendMessage(jid, {
          text:
`✅ PROMOVIDO A ADM

👤 @${user.split("@")[0]}`,
          mentions: [user]
        });
      }

      // ================= REBAIXAR ADM =================
      if (cmd === ".rebaixar" || cmd === ".reibaixar") {

        if (!isGroup) {
          return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupo."
          });
        }

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só admin pode usar."
          });
        }

        const context =
          msg.message?.extendedTextMessage?.contextInfo;

        const user =
          context?.mentionedJid?.[0] ||
          context?.participant;

        if (!user) {
          return sock.sendMessage(jid, {
            text:
`❌ Use assim:

.rebaixar @adm

Ou responda a mensagem da pessoa com:

.rebaixar`
          });
        }

        await sock.groupParticipantsUpdate(
          jid,
          [user],
          "demote"
        );

        return sock.sendMessage(jid, {
          text:
`✅ ADM REBAIXADO

👤 @${user.split("@")[0]}`,
          mentions: [user]
        });
      }
	  
	  
	  
	        // ================= AUSÊNCIA =================
      if (cmd === ".ausencia") {
        if (!isGroup) {
          return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupo."
          });
        }

        if (!(await isAdmin(sock, jid, sender))) {
          return sock.sendMessage(jid, {
            text: "❌ Só ADM pode ativar ausência."
          });
        }

        const motivo = texto.replace(".ausencia", "").trim();

        if (!motivo) {
          return sock.sendMessage(jid, {
            text: "❌ Use: .ausencia motivo"
          });
        }

        ausencias[sender] = {
          motivo,
          desde: Date.now()
        };

        saveAusencias();

        return sock.sendMessage(jid, {
          text:
`✅ AUSÊNCIA ATIVADA

👤 ADM: @${sender.split("@")[0]}
📝 Motivo: ${motivo}

Use .on para voltar.`,
          mentions: [sender]
        });
      }

      // ================= VOLTOU / ONLINE =================
      if (cmd === ".on") {
        if (ausencias[sender]) {
          delete ausencias[sender];
          saveAusencias();

          return sock.sendMessage(jid, {
            text:
`✅ VOCÊ VOLTOU

👤 @${sender.split("@")[0]} não está mais ausente.`,
            mentions: [sender]
          });
        }

        return sock.sendMessage(jid, {
          text: "ℹ️ Você não estava ausente."
        });
      }

      // ================= RESPONDER MARCAÇÃO DE ADM AUSENTE =================
      if (isGroup) {
        const mentioned =
          msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        for (const marcado of mentioned) {
          if (ausencias[marcado]) {
            await sock.sendMessage(jid, {
              text:
`⚠️ ADM AUSENTE

👤 @${marcado.split("@")[0]}
📝 Motivo: ${ausencias[marcado].motivo}

Aguarde ele voltar.`,
              mentions: [marcado]
            });

            break;
          }
        }
      }
	  
	  
	  
	  // ================= ACEITAR ENTRADAS PENDENTES =================
if (cmd === ".aceitar") {

  if (!isGroup) {
    return sock.sendMessage(jid, {
      text: "❌ Só em grupo"
    });
  }

  if (!(await isAdmin(sock, jid, sender))) {
    return sock.sendMessage(jid, {
      text: "❌ Só admin"
    });
  }

  try {

    // pega pedidos pendentes
    const requests = await sock.groupRequestParticipantsList(jid);

    if (!requests || requests.length === 0) {
      return sock.sendMessage(jid, {
        text: "❌ Nenhum membro pendente"
      });
    }

    let aprovados = [];

    for (const user of requests) {

      await sock.groupRequestParticipantsUpdate(
        jid,
        [user.jid],
        "approve"
      );

      aprovados.push(user.jid);
    }

    return sock.sendMessage(jid, {
      text:
`✅ MEMBROS ACEITOS

👥 Total: ${aprovados.length}

${aprovados.map(u => "👤 @" + u.split("@")[0]).join("\n")}`,
      mentions: aprovados
    });

  } catch (e) {

    console.log("ERRO ACEITAR:", e.message);

    return sock.sendMessage(jid, {
      text: "❌ Erro ao aceitar membros"
    });
  }
}
	  
	
      // ================= PLAY =================
      if (cmd === ".play") {

        try {

          const q = texto.replace(".play", "").trim();

          if (!q) {
            return sock.sendMessage(jid, {
              text: "❌ Use: .play nome da música"
            });
          }

          await sock.sendMessage(jid, {
            text:
`╭━━━〔 🎧 SANTANA PLAY 〕━━━⬣
┃ 🔎 Procurando música...
┃ 👤 Pedido: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━⬣`,
            mentions: [sender]
          });

          const r = await yts(q);

          if (!r.videos.length) {
            return sock.sendMessage(jid, {
              text: "❌ Música não encontrada"
            });
          }

          const v = r.videos[0];

          await sock.sendMessage(jid, {
            image: { url: v.thumbnail },
            caption:
`╭━━━〔 🎵 PLAY 〕━━━⬣
┃ 🎶 Nome: ${v.title}
┃ 👤 Canal: ${v.author.name}
┃ ⏱️ Tempo: ${v.timestamp}
┃ 👑 Pedido: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━⬣

📥 Baixando áudio...`,
            mentions: [sender]
          });

          const api = await axios.get(
            `https://youtube-mp36.p.rapidapi.com/dl?id=${v.videoId}`,
            {
              headers: {
                "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
                "x-rapidapi-key": "b8b7b39029msh1305aa17e245991p1dc47ajsn5b5e84453827"
              }
            }
          );

          const audioUrl = api.data.link;

          if (!audioUrl) {
            return sock.sendMessage(jid, {
              text: "❌ Erro ao baixar áudio"
            });
          }

          const buffer = await axios({
            method: "GET",
            url: audioUrl,
            responseType: "arraybuffer",
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Referer": "https://youtube-mp36.p.rapidapi.com/"
            }
          });

          await sock.sendMessage(jid, {
            audio: Buffer.from(buffer.data),
            mimetype: "audio/mpeg",
            fileName: `${v.title}.mp3`,
            ptt: false
          });

          await sock.sendMessage(jid, {
            react: {
              text: "☑️",
              key: msg.key
            }
          });

        } catch (e) {

          console.log(
            "ERRO PLAY:",
            e.response?.data || e.message
          );

          return sock.sendMessage(jid, {
            text: "❌ Erro ao baixar música."
          });
        }
      }

    } catch (e) {
      console.log("ERRO:", e.message);
    }
  });



  // ================= BEM-VINDO AUTOMÁTICO =================
  sock.ev.on("group-participants.update", async (data) => {
    try {
      for (const user of data.participants) {
        if (data.action === "add") {
          await sock.sendMessage(data.id, {
            text:
`╭━━━〔 👋 BEM-VINDO 〕━━━⬣

👤 Olá @${user.split("@")[0]}

🔥 Seja bem-vindo ao grupo!

📜 Leia as regras
🎮 Respeite os membros
🚫 Sem spam/flood

╰━━━━━━━━━━━━━━━━⬣`,
            mentions: [user]
          });
        }
      }
    } catch (e) {
      console.log("ERRO BEM-VINDO:", e.message);
    }
  });




  setInterval(async () => {

    for (const id in pixPendentes) {

      try {

        const pix = pixPendentes[id];

        if (pix.entregue) continue;

        const info = await payment.get({
          id
        });

        if (info.status === "approved") {

          const key =
            "KEY-" +
            Math.random()
              .toString(36)
              .slice(2, 8)
              .toUpperCase();

          keys[key] = {
            expira:
              Date.now() +
              pix.dias * 86400000,

            grupo: null
          };

          save(FILE_KEYS, keys);

          pixPendentes[id].entregue = true;

          savePix();

          await sock.sendMessage(pix.jid, {
            text:
`✅ PAGAMENTO APROVADO!

🔑 SUA KEY:
${key}

⏳ ${pix.dias} dia(s)

Use no grupo:

.ativar ${key}`
          });

        }

      } catch (e) {

        console.log(
          "ERRO VERIFICAR PIX:",
          e.message
        );

      }

    }

  }, 10000);

}

// ================= INICIAR BOT =================
iniciarBot();

// ================= MANTER CMD ABERTO =================
process.stdin.resume();