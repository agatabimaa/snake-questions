const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const outDir = path.join(__dirname, '..', 'public', 'audio', 'voices');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const VOICE_LINES = [
  // Turns
  { id: 'turn_1', text: 'Ayo, giliran kamu!' },
  { id: 'turn_2', text: 'Giliran kamu nih, kocok dadunya!' },
  { id: 'turn_3', text: 'Yuk giliran kamu melangkah!' },

  // Dice numbers
  { id: 'dice_1', text: 'Satu! Pelan-pelan asal pasti.' },
  { id: 'dice_1_short', text: 'Satu!' },
  { id: 'dice_2', text: 'Dua! Melangkah berdua!' },
  { id: 'dice_2_short', text: 'Dua!' },
  { id: 'dice_3', text: 'Tiga! Asyik meluncur!' },
  { id: 'dice_3_short', text: 'Tiga!' },
  { id: 'dice_4', text: 'Empat! Makin dekat nih!' },
  { id: 'dice_4_short', text: 'Empat!' },
  { id: 'dice_5', text: 'Lima! Dikit lagi sampai!' },
  { id: 'dice_5_short', text: 'Lima!' },
  { id: 'dice_6', text: 'Enam! Hoki banget! Yeay!' },
  { id: 'dice_6_short', text: 'Enam! Mantap jiwa!' },

  // Ladders
  { id: 'ladder_1', text: 'Wah, naik tangga nih! Asyik banget!' },
  { id: 'ladder_2', text: 'Mantap, melesat naik ke atas!' },
  { id: 'ladder_3', text: 'Rezeki anak baik, naik tangga cinta!' },

  // Snakes
  { id: 'snake_1', text: 'Kasian, prosotan pakai ular deh! Hehehe.' },
  { id: 'snake_2', text: 'Yaaah, digigit ular manja, turun deh!' },
  { id: 'snake_3', text: 'Aduh kena ular, sabar ya sayang!' },

  // Questions & Dares
  { id: 'question_1', text: 'Saatnya deep talk berdua!' },
  { id: 'question_2', text: 'Wah, ada pertanyaan seru nih!' },
  { id: 'dare_1', text: 'Cieee, ada aksi manis nih! Lakukan ya!' },

  // Victory
  { id: 'victory_1', text: 'Horeee! Selamat kamu menang! Cinta kalian berdua luar biasa!' }
];

async function generateAll() {
  console.log(`Generating ${VOICE_LINES.length} natural human voice clips with Microsoft Neural Voice (id-ID-GadisNeural)...`);
  const tts = new MsEdgeTTS();
  await tts.setMetadata('id-ID-GadisNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  for (const item of VOICE_LINES) {
    const destPath = path.join(outDir, `${item.id}.mp3`);
    process.stdout.write(`Generating ${item.id}.mp3 (${item.text})... `);
    
    await new Promise((resolve, reject) => {
      const { audioStream } = tts.toStream(item.text);
      const writeStream = fs.createWriteStream(destPath);
      audioStream.pipe(writeStream);
      writeStream.on('finish', () => {
        console.log(`OK (${fs.statSync(destPath).size} bytes)`);
        resolve();
      });
      audioStream.on('error', (err) => {
        writeStream.destroy();
        reject(err);
      });
      writeStream.on('error', reject);
    });
    // Brief sleep between calls
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log('\nAll 25 studio-quality human voice clips successfully generated!');
}

generateAll().catch((err) => {
  console.error('Generation error:', err);
  process.exit(1);
});
