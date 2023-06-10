const { Telegraf } = require("telegraf");

// Inisialisasi Token
const TOKEN = "MASUKKAN TOKEN BOT TELEGRAM DISINI";

const bot = new Telegraf(TOKEN);

const axios = require("axios");

const startMessage = `
    Haloooo Selamat Datang di Rio Bot\nSilahkan klik button dibawah untuk melihat daftar destinasi wisata yaaa
`;

bot.start((ctx) => {
  ctx.reply(startMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "\uD83D\uDD0D Cari Kategori", callback_data: "categori" },
          { text: `\u2B50 Daftar Wisata`, callback_data: "wisata" },
        ],
      ],
    },
  });
});

bot.action("categori", async (ctx) => {
  ctx.answerCbQuery("Loading...");
  let res = await axios.get(
    "https://cache1.phantombooster.com/q56wUiH8gPg/zZE3vZg0EGa2z3d7N0ynOw/dataset-wisata.json"
  );
  const parameterData = res.data.map(({ placeUrl, title, rating, reviewCount, imgUrl, category }) => ({
    placeUrl,
    title,
    rating: rating ?? "Tidak ada rating",
    reviewCount: reviewCount ?? "Tidak ada review",
    imgUrl: imgUrl ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png",
    category: category ?? "Tidak Ada Kategori",
  }));

  const uniqueCategory = [...new Set(parameterData.map((items) => items.category).filter(Boolean))];

  let catMsg = `Silahkan tulis kategori destinasi wisata yang anda inginkan. Contoh /kategori Museum\nBerikut Daftar Kategori yang bisa anda tulis:\n`;
  uniqueCategory.forEach((newCategory) => {
    catMsg += `\u27a2 ${newCategory}\n`;
  });
  ctx.reply(catMsg);

  bot.command("kategori", (ctx) => {
    let answer = ctx.message.text;
    let inputAnswer = answer.split(" ");
    let messageAnswer = "";

    if (inputAnswer.length == 1) {
      messageAnswer = "Format Perintah Salah!";
    } else {
      inputAnswer.shift();
      messageAnswer = inputAnswer.join(" ");
    }

    let msg = `*Rekomendasi berdasarkan kategori yang Anda cari :*\n`;
    let catIdx = messageAnswer;
    parameterData
      .filter((item) => item.category === catIdx)
      .forEach((newParams) => {
        msg += `\u27a2 [${newParams.title}](${newParams.placeUrl})\n`;
      });
    ctx.reply(msg, { parse_mode: "Markdown" });
  });
});

bot.action("wisata", async (ctx) => {
  ctx.answerCbQuery("Merekomendasikan...");
  let res = await axios.get(
    "https://cache1.phantombooster.com/q56wUiH8gPg/zZE3vZg0EGa2z3d7N0ynOw/dataset-wisata.json"
  );

  const parameterData = res.data.map(({ placeUrl, title, rating, reviewCount, imgUrl, category }) => ({
    placeUrl,
    title,
    rating: rating ?? "Tidak ada rating",
    reviewCount: reviewCount ?? "Tidak ada review",
    imgUrl: imgUrl ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png",
    category: category ?? "Tidak Ada Kategori",
  }));

  let currIdx = 0;

  const wisata = parameterData[currIdx];
  const photoUrl = wisata.imgUrl;
  const caption = `*${wisata.title}*\n\u2B50 Ratings: ${wisata.rating}\n\uD83D\uDCCA Reviews: ${wisata.reviewCount}\n\u{1F3F7} Kategori: ${wisata.category}`;

  ctx.replyWithPhoto(photoUrl, {
    caption: caption,
    reply_markup: {
      inline_keyboard: [
        [
          { text: `\u23ED Selanjutnya`, callback_data: "next" },
          { text: `\ud83c\udf10 Google Maps`, url: `${wisata.placeUrl}` },
        ],
      ],
    },
    parse_mode: "Markdown",
  });

  const uniqueCategory = [...new Set(parameterData.map((items) => items.category).filter(Boolean))];
  setTimeout(() => {
    let msg = `*Anda Mungkin juga akan menyukai ini :*\n`;
    parameterData.slice(11, 21).forEach((newParams) => {
      msg += `\u27a2 [${newParams.title}](${newParams.placeUrl})\n`;
    });
    ctx.reply(msg, { parse_mode: "Markdown" });
    console.log(uniqueCategory);
  }, 2000);

  bot.action("next", (ctx) => {
    currIdx++;
    if (currIdx >= 10) {
      currIdx = 0;
    }
    const wisata = parameterData[currIdx];
    const photoUrl = wisata.imgUrl;
    const caption = `*${wisata.title}*\n\u2B50 Ratings: ${wisata.rating}\n\uD83D\uDCCA Reviews: ${wisata.reviewCount}\n\u{1F3F7} Kategori: ${wisata.category}`;

    // Next Image Function
    ctx.editMessageMedia(
      { type: "photo", media: photoUrl, caption: caption, parse_mode: "Markdown" },
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: `\u23ED Selanjutnya`, callback_data: "next" },
              { text: `\ud83c\udf10 Google Maps`, url: `${wisata.placeUrl}` },
            ],
          ],
        },
      }
    );
  });
});

bot.launch();
