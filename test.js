const { Telegraf, Markup } = require("telegraf");

const TOKEN = "MASUKKAN TOKEN BOT TELEGRAM DISINI";

const bot = new Telegraf(TOKEN);

const axios = require("axios");

const fs = require("fs");

const helpMessage = `Simple API Bot\n\n
  /getCoffee - Test Google Map
  /fortune - mendapatkan fortune cookie\n
  /cat - mendapatkan foto kucing acak\n
  /cat <text> - mendapatkan fot0 kucing dengan teks\n
  /dogbreeds - mendapatkan list jenis anjing\n
  /dogs <breeds> - mendapatkan gambar dari jenis anjing\n
  /rekomendasi - Dapatkan rekomendasi destinasi Wisata`;

bot.start((ctx) => {
  ctx.reply("Hello");
});
bot.help((ctx) => {
  ctx.reply(helpMessage);
});
bot.command("rekomendasi", async (ctx) => {
  ctx.reply(`Tolong berikan informasi Lokasi Anda`);
});

let position = [];
bot.on("message", async (ctx, next) => {
  if (ctx.message.location) {
    const { latitude, longitude } = ctx.message.location;
    position.push({ latitude, longitude });
    ctx.reply(`Latitude: ${latitude}\nLongitude: ${longitude}`);

    const maxResult = 1;
    const pageSize = 1;

    for (let start = 0; start < maxResult; start += pageSize) {
      const params = {
        engine: "google_maps",
        q: "Wisata",
        ll: `@${latitude},${longitude},13z`,
        type: "search",
        start,
        num: pageSize,
      };

      const callback = function (data) {
        const filteredData = data.local_results.map(({ title, rating, reviews, thumbnail }) => ({
          title,
          rating: rating ?? "Tidak tersedia",
          reviews: reviews ?? "Tidak Tersedia",
          thumbnail:
            thumbnail ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png",
        }));

        // Sort Data
        filteredData.sort((a, b) => b.reviews - a.reviews);

        for (let i = 0; i < filteredData.length; i++) {
          const destination = filteredData[i];
          if (destination.thumbnail) {
            // check if thumbnail exists
            const photoUrl = destination.thumbnail;
            const caption = `${destination.title}\n \u2B50 Rating: ${destination.rating}\n \uDCC8 Reviews: ${destination.reviews}`;
            ctx.replyWithPhoto(photoUrl, {
              caption: caption,
              thumb: {
                url: photoUrl,
                width: 100,
                height: 100,
              },
              reply_markup: {
                inline_keyboard: [[{ text: "Lihat Foto", callback_data: "lihatfoto" }]],
              },
            });
            // ctx.reply(caption);
          }
        }
      };
      await search.json(params, callback);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  await next();
});

// bot.action('lihatfoto', ctx => {
//   ctx.answerCbQuery()
// })

bot.command("fortune", (ctx) => {
  axios
    .get("http://yerkee.com/api/fortune")
    .then((res) => {
      ctx.reply(res.data.fortune);
    })
    .catch((e) => {
      ctx.reply(e);
    });
});

bot.command("cat", async (ctx) => {
  let input = ctx.message.text;
  let inputArray = input.split(" ");
  if (inputArray.length == 1) {
    try {
      let res = await axios.get("https://aws.random.cat/meow");
      ctx.replyWithPhoto(res.data.file);
      console.log(res.data.file);
    } catch (err) {
      console.log(err);
    }
  } else {
    inputArray.shift();
    input = inputArray.join(" ");
    ctx.replyWithPhoto(`https://cataas.com/cat/says/${input}`);
  }
});

bot.command("dogbreeds", (ctx) => {
  let rawdata = fs.readFileSync("./dogbreed.json", "utf8");
  let data = JSON.parse(rawdata);
  let message = "Jenis Anjing : \n";

  data.forEach((item) => {
    message += `- ${item}\n`;
  });
  ctx.reply(message);
});

bot.command("dogs", (ctx) => {
  let input = ctx.message.text.split(" ");
  if (input.length !== 2) {
    ctx.reply("Masukkan Jenis Anjing pada argumen kedua");
    return;
  }
  let breedInput = input[1];
  let rawData = fs.readFileSync("./dogbreed.json", "utf8");
  let data = JSON.parse(rawData);

  if (data.includes(breedInput)) {
    axios
      .get(`https://dog.ceo/api/breed/${breedInput}/images/random`)
      .then((res) => {
        ctx.replyWithPhoto(res.data.message);
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    let suggestions = data.filter((item) => {
      return item.startsWith(breedInput);
    });
    let message = "Mungkin maksud Anda ini : \n";
    suggestions.forEach((item) => {
      message += `- ${item}\n`;
    });
    if (suggestions.length == 0) {
      ctx.reply(`Nampaknya jenis anjing ${breedInput} ini tidak dapat ditemukan`);
    } else {
      ctx.reply(message);
    }
  }
});
bot.launch();
