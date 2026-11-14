import { Question } from '../types/game';

// 👦 SOAL KHUSUS COWOK (Perspektif & Emosi Pria)
export const BOY_QUESTIONS: Question[] = [
  {
    id: 'b-1',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Ekspektasi & Beban',
    title: 'Kapan Terakhir Kali Lelah?',
    question: 'Kapan terakhir kali kamu merasa terbebani atau capek banget, tapi memilih menyimpannya sendiri daripada cerita ke pasangan?',
    subPrompt: 'Apa yang bikin kamu sungkan atau ragu untuk membaginya saat itu?'
  },
  {
    id: 'b-2',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Apresiasi & Validasi',
    title: 'Dihargai Sebagai Pasangan',
    question: 'Sikap, perlakuan, atau kalimat apa dari pasangan yang paling berhasil bikin kamu merasa benar-benar dihargai?',
    subPrompt: 'Apakah ada hal kecil yang sering dia lakukan dan bikin kamu bangga punya dia?'
  },
  {
    id: 'b-3',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Masa Depan & Insecurity',
    title: 'Ketakutan yang Tersimpan',
    question: 'Dalam hubungan kita dan rencana ke depan, apa ketakutan terbesarmu yang selama ini belum pernah diobrolkan?',
    subPrompt: 'Misal soal karier, kesiapan finansial, atau tanggung jawab keluarga.'
  },
  {
    id: 'b-4',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Ekspresi Kasih Sayang',
    title: 'Bahasa Kasih Sayang Pria',
    question: 'Menurut kamu, hal apa yang sering salah dipahami cewek tentang cara cowok menunjukkan rasa sayangnya?',
    subPrompt: 'Bagaimana caramu menunjukkan cinta saat kamu sedang tidak banyak bicara?'
  },
  {
    id: 'b-5',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Dukungan Emosional',
    title: 'Momen Paling Didukung',
    question: 'Kapan momen di mana kamu merasa paling dicintai, diterima apa adanya, dan didukung penuh sama pasangan?',
    subPrompt: 'Ceritakan detail apa yang dia katakan atau lakukan saat itu.'
  },
  {
    id: 'b-6',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Resolusi Konflik',
    title: 'Butuh Waktu Sendiri vs Ditemani',
    question: 'Kalau kita lagi ada selisih paham atau kamu lagi stres, kamu sebenarnya lebih butuh waktu sendiri (cooling down) dulu atau langsung ditemani?',
    subPrompt: 'Berapa lama biasanya waktu tenang yang kamu butuhkan sebelum bisa ngobrol jernih?'
  },
  {
    id: 'b-7',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Kebutuhan Tersembunyi',
    title: 'Tanpa Perlu Dijelaskan',
    question: 'Apa satu hal tentang isi kepala atau kepribadianmu yang kamu harap pasangan bisa mengerti tanpa kamu harus selalu mendiktekannya?',
    subPrompt: 'Hal yang seringkali sulit kamu utarakan dengan kata-kata.'
  },
  {
    id: 'b-8',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Tuntutan Sosial',
    title: 'Tekanan yang Jarang Terlihat',
    question: 'Apakah ada tuntutan keluarga, pertemanan, atau pekerjaan yang akhir-akhir ini bikin kamu kepikiran dan menyita energimu?',
    subPrompt: 'Bagaimana pasangan bisa hadir meringankan beban pikiran itu?'
  },
  {
    id: 'b-9',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Pujian Impian',
    title: 'Pujian yang Dirindukan',
    question: 'Apa pujian atau kata-kata pengakuan yang sebenarnya paling pengen kamu dengar dari pasangan, tapi jarang dia ucapkan?',
    subPrompt: 'Tentang usahamu, penampilanmu, atau sifatmu.'
  },
  {
    id: 'b-10',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Peran & Tanggung Jawab',
    title: 'Sosok Pelindung',
    question: 'Kapan kamu merasa bangga atau bersyukur bisa ada di samping pasangan dan bisa diandalkan olehnya?',
    subPrompt: 'Ceritakan satu situasi di mana kamu merasa "aku senang ada di sampingnya saat itu".'
  },
  {
    id: 'b-11',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Luka Masa Lalu',
    title: 'Pelajaran Masa Lalu',
    question: 'Pengalaman masa lalu apa (keluarga/mantan/kegagalan) yang paling membentuk caramu memperlakukan pasangan sekarang?',
    subPrompt: 'Apa hal yang kamu janjikan pada dirimu sendiri untuk tidak diulangi?'
  },
  {
    id: 'b-12',
    category: 'BOY',
    forWhom: 'BOY',
    tag: 'Visi Bersama',
    title: 'Rumah Impian',
    question: 'Kalau kita punya ruang/tempat tinggal bersama di masa depan, suasana seperti apa yang paling kamu impikan saat kamu pulang ke rumah?',
    subPrompt: 'Suasana tenang, obrolan hangat, atau masakan bersama?'
  }
];

// 👧 SOAL KHUSUS CEWEK (Kebutuhan Emosional & Rasa Aman)
export const GIRL_QUESTIONS: Question[] = [
  {
    id: 'g-1',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Hal Kecil Bermakna',
    title: 'Hangatnya Perhatian Kecil',
    question: 'Tindakan atau kebiasaan kecil apa dari pasangan yang sering bikin hatimu meleleh/hangat tanpa dia sadari?',
    subPrompt: 'Hal sepele yang mungkin dia anggap biasa tapi sangat berharga buat kamu.'
  },
  {
    id: 'g-2',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Rasa Aman & Cemas',
    title: 'Emosional & Reassurance',
    question: 'Kapan kamu merasa paling aman secara emosional sama pasangan, dan kapan kamu pernah merasa cemas atau overthinking?',
    subPrompt: 'Apa yang biasanya memicu perasaan tidak aman tersebut?'
  },
  {
    id: 'g-3',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Cara Mendengar',
    title: 'Solusi atau Pelukan?',
    question: 'Kalau kamu lagi sedih atau capek banget, respons seperti apa yang sebenarnya paling kamu butuhkan: solusi logis, pelukan/afeksi, atau cukup didengarkan tanpa digurui?',
    subPrompt: 'Bagaimana pasangan sebaiknya merespons saat kamu lagi bad mood?'
  },
  {
    id: 'g-4',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Perubahan & Kerinduan',
    title: 'Masa-Masa Awal',
    question: 'Apakah ada sikap atau kebiasaan pasangan dari masa awal kenal/jadian yang belakangan ini kamu rindukan?',
    subPrompt: 'Misal cara dia menatap, frekuensi chat, atau spontanitasnya.'
  },
  {
    id: 'g-5',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Kejujuran Emosi',
    title: 'Menahan Diri',
    question: 'Seberapa sering kamu merasa perlu menahan diri atau takut salah bicara saat kita lagi berbeda pendapat?',
    subPrompt: 'Apa yang bikin kamu memilih diam daripada jujur mengungkapkan perasaanmu?'
  },
  {
    id: 'g-6',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Prioritas & Waktu',
    title: 'Merasa Diprioritaskan',
    question: 'Di tengah kesibukan masing-masing, bentuk perhatian seperti apa yang paling bikin kamu merasa tetap diprioritaskan nomor satu?',
    subPrompt: 'Apakah kabar rutin, telepon sebelum tidur, atau kejutan kecil?'
  },
  {
    id: 'g-7',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Impian & Harapan',
    title: 'Mimpi Bersama',
    question: 'Apa satu impian masa kecil atau cita-cita pribadimu yang pengen banget kamu wujudkan bareng pasangan di sampingmu?',
    subPrompt: 'Bisa tempat liburan, hobi baru, atau target hidup.'
  },
  {
    id: 'g-8',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Rasa Bangga',
    title: 'Kelebihan Pasangan',
    question: 'Karakter atau sifat apa dari pasangan yang paling sering bikin kamu bangga punya dia di depan teman-teman atau keluargamu?',
    subPrompt: 'Sifat sabarnya, ketekunannya, atau rasa tanggung jawabnya?'
  },
  {
    id: 'g-9',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Jarak & Kerinduan',
    title: 'Obat Kangen Terbaik',
    question: 'Saat kita lagi berjauhan (LDR atau seharian sibuk), kata-kata atau perlakuan apa yang paling ampuh menenangkan rasa kangenmu?',
    subPrompt: 'Benda apa miliknya atau kenangan apa yang paling sering kamu ingat?'
  },
  {
    id: 'g-10',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Validasi Emosional',
    title: 'Validasi yang Terpendam',
    question: 'Kapan terakhir kali kamu merasa butuh dipuji atau divalidasi oleh pasangan, tapi kamu gengsi atau malu untuk memintanya?',
    subPrompt: 'Katakan sekarang apa yang sebenarnya ingin kamu dengar!'
  },
  {
    id: 'g-11',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Ruang Tumbuh',
    title: 'Menjadi Diri Sendiri',
    question: 'Apakah ada bagian dari dirimu yang merasa lebih bebas, lebih percaya diri, atau lebih bahagia sejak bersamanya?',
    subPrompt: 'Perubahan positif apa yang paling kamu syukuri?'
  },
  {
    id: 'g-12',
    category: 'GIRL',
    forWhom: 'GIRL',
    tag: 'Batas Toleransi',
    title: 'Hal yang Paling Melukai',
    question: 'Sikap seperti apa yang paling bisa merusak rasa percayamu atau melukai perasaanmu dalam suatu hubungan?',
    subPrompt: 'Supaya pasangan bisa saling menjaga dan tidak melangkah ke sana.'
  }
];

// 💜 DEEP TALK BERSAMA (Didiskusikan & Dijawab Bergantian)
export const DEEPTALK_QUESTIONS: Question[] = [
  {
    id: 'd-1',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Finansial & Masa Depan',
    title: 'Pandangan Mengelola Keuangan',
    question: 'Bagaimana bayangan kita tentang mengelola keuangan bersama ke depan? Siapa yang pegang apa dan bagaimana cara kita diskusi soal pengeluaran besar?',
    subPrompt: 'Apa prinsip finansial yang tidak boleh dilanggar dalam hubungan kita?'
  },
  {
    id: 'd-2',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Resolusi Konflik',
    title: 'Belajar dari Perselisihan',
    question: 'Waktu terakhir kita berantem atau berbeda pendapat, apa pelajaran terbesar yang bisa kita ambil supaya ke depannya tidak saling melukai lagi?',
    subPrompt: 'Bagian mana dari caraku merespons yang menurutmu masih perlu diperbaiki?'
  },
  {
    id: 'd-3',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Keluarga & Batasan',
    title: 'Batasan Privasi Berdua',
    question: 'Bagaimana cara kita menjaga batas privasi hubungan kita berdua dari campur tangan orang luar atau keluarga besar?',
    subPrompt: 'Hal apa saja yang harus tetap menjadi rahasia kita berdua tanpa boleh diketahui orang lain?'
  },
  {
    id: 'd-4',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Kualitas Waktu',
    title: 'Cukupkah Waktu Bersama?',
    question: 'Apakah frekuensi komunikasi dan cara kita menghabiskan waktu bersama saat ini sudah cukup membuat kita sama-sama bahagia dan terpenuhi?',
    subPrompt: 'Atau ada rutinitas baru yang ingin kita coba bersama?'
  },
  {
    id: 'd-5',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Perbaikan Hubungan',
    title: 'Target 3 Bulan ke Depan',
    question: 'Kalau ada satu hal dalam dinamika hubungan kita yang bisa kita perbaiki atau tingkatkan bersama dalam 3 bulan ke depan, hal apa itu?',
    subPrompt: 'Fokus pada solusi yang membuat kita berdua lebih nyaman.'
  },
  {
    id: 'd-6',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Luka & Pertumbuhan',
    title: 'Membentuk Cara Mencintai',
    question: 'Satu luka masa lalu atau pengalaman hidup apa yang paling membentuk caramu mencintai dan memperlakukan pasangan hari ini?',
    subPrompt: 'Ceritakan dengan jujur tanpa rasa dihakimi.'
  },
  {
    id: 'd-7',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Visi Hidup',
    title: '3-5 Tahun Mendatang',
    question: 'Dalam 3 sampai 5 tahun ke depan, gambaran kehidupan seperti apa yang paling ingin kita bangun dan nikmati bersama?',
    subPrompt: 'Karier, tempat tinggal, gaya hidup, atau petualangan bersama.'
  },
  {
    id: 'd-8',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Kejujuran Mutlak',
    title: 'Keberanian Berkata Jujur',
    question: 'Sejauh mana kita merasa nyaman untuk 100% jujur tentang ketidaknyamanan tanpa takut pasangan bakal marah, tersinggung, atau menarik diri?',
    subPrompt: 'Bagaimana kita bisa menciptakan ruang yang lebih aman untuk saling jujur?'
  },
  {
    id: 'd-9',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Bahasa Kasih',
    title: 'Love Language Check-In',
    question: 'Apakah kamu merasa Love Language utamamu (Words of Affirmation, Quality Time, Receiving Gifts, Acts of Service, Physical Touch) sudah terpenuhi dengan baik akhir-akhir ini?',
    subPrompt: 'Beri skor 1-10 dan ceritakan apa yang bisa ditingkatkan.'
  },
  {
    id: 'd-10',
    category: 'DEEPTALK',
    forWhom: 'BOTH',
    tag: 'Rasa Syukur',
    title: 'Bintang Terang di Hidupku',
    question: 'Apa momen terberat dalam hidupmu di mana kehadiran pasangan benar-benar menjadi penyelamat atau sumber ketenangan utamamu?',
    subPrompt: 'Ungkapkan rasa terima kasihmu langsung ke matanya.'
  }
];

// 🪜 TANGGA APRESIASI (Naik Petak & Afirmasi Hangat)
export const LADDER_QUESTIONS: Question[] = [
  {
    id: 'lad-1',
    category: 'LADDER_APPRECIATION',
    forWhom: 'BOTH',
    tag: 'Tangga Cinta (+Naik Petak)',
    title: '3 Sifat Terbaik',
    question: 'Sebutkan 3 sifat terbaik dari pasangan yang bikin kamu bersyukur memilih dia dibanding orang lain di dunia ini!',
    subPrompt: 'Sampaikan langsung sambil menatap matanya atau kamera.'
  },
  {
    id: 'lad-2',
    category: 'LADDER_APPRECIATION',
    forWhom: 'BOTH',
    tag: 'Tangga Cinta (+Naik Petak)',
    title: 'Momen Pertama Jatuh Cinta',
    question: 'Ceritakan kembali momen pertama kali kamu sadar kalau kamu benar-benar jatuh cinta dan ingin serius sama dia.',
    subPrompt: 'Apa yang dia kenakan atau katakan waktu itu?'
  },
  {
    id: 'lad-3',
    category: 'LADDER_APPRECIATION',
    forWhom: 'BOTH',
    tag: 'Tangga Cinta (+Naik Petak)',
    title: 'Pujian Hari Ini',
    question: 'Berikan satu pujian tulus tentang penampilan, pakaian, atau auranya hari ini yang bikin kamu kagum!',
    subPrompt: 'Jangan sungkan untuk membuatnya tersenyum malu.'
  },
  {
    id: 'lad-4',
    category: 'LADDER_APPRECIATION',
    forWhom: 'BOTH',
    tag: 'Tangga Cinta (+Naik Petak)',
    title: 'Rasa Bangga Terdalam',
    question: 'Ceritakan satu pencapaian atau perjuangan pasangan yang bikin kamu diam-diam sangat bangga melihat kegigihannya.',
    subPrompt: 'Validasi usaha keras yang sudah dia lewati.'
  },
  {
    id: 'lad-5',
    category: 'LADDER_APPRECIATION',
    forWhom: 'BOTH',
    tag: 'Tangga Cinta (+Naik Petak)',
    title: 'Perubahan Hidupku',
    question: 'Bagaimana kehadiran pasangan membuat hidupmu menjadi jauh lebih berwarna dan lebih tenang dibandingkan sebelum kenal dia?',
    subPrompt: 'Hal apa yang paling berubah dalam dirimu?'
  },
  {
    id: 'lad-6',
    category: 'LADDER_APPRECIATION',
    forWhom: 'BOTH',
    tag: 'Tangga Cinta (+Naik Petak)',
    title: 'Doa Terbaik',
    question: 'Sebutkan satu doa atau harapan tulus yang selalu kamu selipkan untuk kesehatan, kebahagiaan, dan masa depannya.',
    subPrompt: 'Katakan doa itu di hadapannya sekarang.'
  }
];

// 🐍 ULAR REFLEKSI (Turun Petak & Melunakkan Ego)
export const SNAKE_QUESTIONS: Question[] = [
  {
    id: 'snk-1',
    category: 'SNAKE_REFLECTION',
    forWhom: 'BOTH',
    tag: 'Ular Manja (-Turun Petak)',
    title: 'Kebiasaan Gemas & Harapan',
    question: 'Sebutkan satu kebiasaan kecil pasangan yang kadang bikin kamu geregetan/jengkel, lalu sampaikan versi harapanmu dengan nada manja dan senyuman.',
    subPrompt: 'Ingat, tidak boleh ada nada marah atau menyalahkan!'
  },
  {
    id: 'snk-2',
    category: 'SNAKE_REFLECTION',
    forWhom: 'BOTH',
    tag: 'Ular Manja (-Turun Petak)',
    title: 'Permintaan Maaf Sepele',
    question: 'Minta maaflah atas satu hal sepele minggu ini yang mungkin sempat bikin pasangan merasa dicuekin, diabaikan, atau salah paham.',
    subPrompt: 'Minta maaf dengan tulus dan sebutkan alasan kenapa kamu menyayanginya.'
  },
  {
    id: 'snk-3',
    category: 'SNAKE_REFLECTION',
    forWhom: 'BOTH',
    tag: 'Ular Manja (-Turun Petak)',
    title: 'Klarifikasi Prasangka',
    question: 'Ceritakan satu prasangka atau asumsi yang pernah kamu pikirkan tentang pasangan, dan klarifikasi bersama sekarang juga.',
    subPrompt: 'Apakah hal itu beneran terjadi atau cuma overthinking belaka?'
  },
  {
    id: 'snk-4',
    category: 'SNAKE_REFLECTION',
    forWhom: 'BOTH',
    tag: 'Ular Manja (-Turun Petak)',
    title: 'Ego yang Dilunakkan',
    question: 'Kapan terakhir kali kamu merasa terlalu mengedepankan gengsi atau egomu di hadapan pasangan?',
    subPrompt: 'Bagaimana perasaanmu sekarang setelah menyadari hal itu?'
  },
  {
    id: 'snk-5',
    category: 'SNAKE_REFLECTION',
    forWhom: 'BOTH',
    tag: 'Ular Manja (-Turun Petak)',
    title: 'Komunikasi yang Terhambat',
    question: 'Apakah ada perkataan pasangan yang tempo hari sempat bikin kamu tersentil tapi kamu pilih memendamnya karena takut suasana runyam?',
    subPrompt: 'Sampaikan uneg-uneg itu dengan bahasa cinta dan penuh kelembutan.'
  },
  {
    id: 'snk-6',
    category: 'SNAKE_REFLECTION',
    forWhom: 'BOTH',
    tag: 'Ular Manja (-Turun Petak)',
    title: 'Janji Memperbaiki Diri',
    question: 'Satu kekurangan atau sifat burukmu apa yang paling kamu sadari sering merepotkan pasangan, dan apa langkah nyata untuk memperbaikinya?',
    subPrompt: 'Minta bantuan pasangan untuk mengingatkanmu dengan sabar.'
  }
];

// 💌 VIRTUAL DARE / LOVE ACTION (100% Ramah LDR & Video Call)
export const VIRTUAL_DARES: Question[] = [
  {
    id: 'v-1',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Virtual Dare (Ramah LDR)',
    title: 'Galeri Foto Memori',
    question: 'Buka galeri HP kamu sekarang, cari 1 foto pasangan atau momen berdua yang paling bikin kamu kangen atau tersenyum, lalu kirim/tunjukkan dan ceritakan kisahnya!',
    subPrompt: 'Ceritakan apa yang kamu rasakan saat foto itu diambil.'
  },
  {
    id: 'v-2',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Virtual Dare (Ramah LDR)',
    title: 'Lagu untuk Hatimu',
    question: 'Putar atau kirimkan link 1 lagu yang belakangan ini paling mengingatkan kamu pada dia, lalu nyanyikan 1 bait lirik yang paling mewakili perasaanmu!',
    subPrompt: 'Biar pasangan tahu isi hatimu lewat nada.'
  },
  {
    id: 'v-3',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Virtual Dare (Ramah LDR)',
    title: 'Voice Note Rahasia',
    question: 'Kirimkan voice note 10-15 detik ke chat pasangan berisi kata-kata manis atau semangat yang boleh dia putar kapan pun saat dia lagi lelah.',
    subPrompt: 'Rekam dengan nada paling tulus dan hangat.'
  },
  {
    id: 'v-4',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Virtual Dare (Ramah LDR)',
    title: 'Tatap Layar 20 Detik',
    question: 'Tatap kamera video call atau mata pasangan selama 20 detik tanpa boleh tersenyum, tertawa, atau memalingkan pandangan!',
    subPrompt: 'Siapa yang pertama kali senyum atau salting kalah!'
  },
  {
    id: 'v-5',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Virtual Dare (Ramah LDR)',
    title: 'PAP Selfie Paling Gemas',
    question: 'Ambil dan kirim 1 foto selfie dengan ekspresi paling lucu, imut, atau gemas saat ini juga ke chat pasangan tanpa filter berlebihan!',
    subPrompt: 'Bikin pasangan tertawa gemas melihat fotomu.'
  },
  {
    id: 'v-6',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Virtual Dare (Ramah LDR)',
    title: 'Pesan Cinta Kilat',
    question: 'Ketik 3 kalimat romantis spontan di chatroom sekarang tentang hal yang paling kamu syukuri dari hubungan ini, lalu kirim seketika!',
    subPrompt: 'Tanpa perlu diedit terlalu lama, tulis apa yang terlintas pertama kali di hati.'
  },
  {
    id: 'v-7',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Virtual Dare (Ramah LDR)',
    title: 'Traktiran Virtual',
    question: 'Buat komitmen untuk memesankan kopi/minuman/makanan kesukaan pasangan via ojek online besok hari untuk menemaninya beraktivitas!',
    subPrompt: 'Tulis menunya di chat sekarang sebagai janji manis.'
  },
  {
    id: 'v-8',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Virtual Dare (Ramah LDR)',
    title: 'Ganti Wallpaper / Lockscreen',
    question: 'Pasang foto pasangan atau foto berdua sebagai wallpaper atau lockscreen HP-mu selama 24 jam ke depan, dan kirimkan bukti screenshot-nya!',
    subPrompt: 'Tunjukkan rasa banggamu memiliki dia.'
  }
];

// 🤝 OFFLINE LOVE ACTION (Khusus saat bertatap muka langsung)
export const OFFLINE_DARES: Question[] = [
  {
    id: 'off-1',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Love Action (Tatap Muka)',
    title: 'Genggam Tangan Erat',
    question: 'Genggam tangan pasangan erat-erat selama 1 putaran dadu berikutnya sambil menceritakan satu hal yang bikin kamu nyaman di dekatnya.',
    subPrompt: 'Rasakan kehangatan tangannya.'
  },
  {
    id: 'off-2',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Love Action (Tatap Muka)',
    title: 'Pelukan Hangat 30 Detik',
    question: 'Berikan pelukan hangat dan tenang kepada pasangan selama 30 detik tanpa berkata apa-apa selain bernapas bersama.',
    subPrompt: 'Lepaskan semua beban penat hari ini.'
  },
  {
    id: 'off-3',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Love Action (Tatap Muka)',
    title: 'Bisikan Rahasia',
    question: 'Dekatkan bibirmu ke telinganya dan bisikkan satu kalimat yang paling bisa bikin dia tersipu malu atau tersenyum bahagia.',
    subPrompt: 'Bisikkan dengan nada lembut.'
  },
  {
    id: 'off-4',
    category: 'VIRTUAL_DARE',
    forWhom: 'BOTH',
    tag: 'Love Action (Tatap Muka)',
    title: 'Pijatan Pundak Santai',
    question: 'Pijat pundak pasangan dengan lembut selama 1 menit untuk meredakan pegal dan penat dari rutinitasnya.',
    subPrompt: 'Tanyakan apakah tekanannya sudah pas dan nyaman.'
  }
];
