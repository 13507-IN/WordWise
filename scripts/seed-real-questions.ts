import "dotenv/config";
import { SkillType } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

type RawQuestion = {
  examCode: string;
  levelCode: string;
  skill: SkillType;
  slug: string;
  prompt: string;
  context?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: number;
  isOfficial: boolean;
};

const REAL_QUESTIONS: RawQuestion[] = [
  // ==========================================
  // JLPT N5
  // ==========================================
  {
    examCode: "JLPT",
    levelCode: "N5",
    skill: SkillType.VOCABULARY,
    slug: "jlpt-n5-vocab-shinbun",
    prompt: "下線の言葉はどう書きますか。毎朝、父は【しんぶん】を読みます。",
    context: "日常の生活習慣についての文です。",
    options: ["新門", "新聞", "親聞", "新間"],
    answerIndex: 1,
    explanation: "「しんぶん」の正しい漢字は「新聞」です。「新しい（しん）」と「聞く（ぶん）」で構成されます。",
    difficulty: 1,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N5",
    skill: SkillType.GRAMMAR,
    slug: "jlpt-n5-grammar-particles-ni",
    prompt: "（　　）に入れるのに最もよいものを一つ選びなさい。教室の机の上（　　）辞書があります。",
    context: "教室にある物の位置を説明しています。",
    options: ["で", "に", "を", "へ"],
    answerIndex: 1,
    explanation: "物や人の存在場所（～にあります／～にいます）を表す助詞は「に」です。「で」は動作の場所を表します。",
    difficulty: 1,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N5",
    skill: SkillType.READING,
    slug: "jlpt-n5-reading-library-notice",
    prompt: "図書館の休館日は何曜日ですか。",
    context: "【図書館からのお知らせ】月曜日から金曜日は午前9時から午後7時まで開いています。土曜日は午後5時までです。日曜日と祝日は休みです。",
    options: ["月曜日", "金曜日", "土曜日", "日曜日"],
    answerIndex: 3,
    explanation: "文末に「日曜日と祝日は休みです」と明記されているため、休館日は日曜日です。",
    difficulty: 1,
    isOfficial: true,
  },

  // ==========================================
  // JLPT N4
  // ==========================================
  {
    examCode: "JLPT",
    levelCode: "N4",
    skill: SkillType.GRAMMAR,
    slug: "jlpt-n4-grammar-conditional-tara",
    prompt: "（　　）に入れるのに最もよいものを一つ選びなさい。明日、雨が（　　）、ピクニックは中止になります。",
    context: "明日の天候による予定の変更を話しています。",
    options: ["降ると", "降れば", "降ったら", "降るなら"],
    answerIndex: 2,
    explanation: "特定の個別事象を前提とする条件表現として「～たら」が最も自然です。雨が降ったら中止になります。",
    difficulty: 2,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N4",
    skill: SkillType.VOCABULARY,
    slug: "jlpt-n4-vocab-intransitive",
    prompt: "風が強くて、ドアが（　　）しまいました。",
    context: "天候によるドアの状態変化を説明しています。",
    options: ["あけて", "しまって", "ひらいて", "あいて"],
    answerIndex: 3,
    explanation: "「ドアが」と主語が「が」で提示されているため自動詞が必要です。「あく（開く）」のテ形「あいて」が正解です。「あける」は他動詞です。",
    difficulty: 2,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N4",
    skill: SkillType.GRAMMAR,
    slug: "jlpt-n4-grammar-keigo-itadaku",
    prompt: "先生、このレポートを（　　）いただけますか。",
    context: "生徒が先生に添削を丁寧に依頼する場面です。",
    options: ["見て", "見られて", "ご覧になって", "拝見して"],
    answerIndex: 0,
    explanation: "相手に「～してもらう」の敬語依頼表現は「〜ていただけますか」です。したがって「見ていただけますか」が正解です。「ご覧になる」は尊敬語、「拝見する」は謙譲語です。",
    difficulty: 2,
    isOfficial: true,
  },

  // ==========================================
  // JLPT N3
  // ==========================================
  {
    examCode: "JLPT",
    levelCode: "N3",
    skill: SkillType.GRAMMAR,
    slug: "jlpt-n3-grammar-wake-dewa-nai",
    prompt: "（　　）に入れるのに最もよいものを一つ選びなさい。一人暮らしは寂しいと言っても、友だちが全くいない（　　）。",
    context: "一人暮らしの心境について弁明しています。",
    options: ["わけではない", "はずがない", "わけにはいかない", "に違いない"],
    answerIndex: 0,
    explanation: "「〜わけではない」は部分否定を表し、「完全に〜というわけではない」という意味になります。「友だちが全くいないわけではない」＝少しは友だちがいる。",
    difficulty: 3,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N3",
    skill: SkillType.VOCABULARY,
    slug: "jlpt-n3-vocab-girigiri",
    prompt: "電車の発車時刻（　　）に駅へ着いたので、何とか間に合った。",
    context: "駅に到着した時間の余裕の無さを描写しています。",
    options: ["ぎりぎり", "ぴったり", "のんびり", "すっきり"],
    answerIndex: 0,
    explanation: "「ぎりぎり」は時間や限度にほとんど余裕がない状態を表します。発車時刻ぎりぎり＝just in the nick of time。",
    difficulty: 3,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N3",
    skill: SkillType.READING,
    slug: "jlpt-n3-reading-recycle",
    prompt: "筆者がこの文章で最も伝えたいことはどれですか。",
    context: "私たちは不用品をごみとして捨てる前に、再利用できる方法がないか考えるべきだ。個人の小さな工夫が集まることで、社会全体の環境負荷を確実に減らすことができる。",
    options: [
      "ごみの分別規則を法律で厳しく取り締まるべきだ",
      "個人の日頃の工夫と再利用が環境負荷軽減につながる",
      "不用品はすべてリサイクルショップに売却すべきだ",
      "社会全体で新しいごみ処理場を増設する必要がある",
    ],
    answerIndex: 1,
    explanation: "本文末尾「個人の小さな工夫が集まることで、社会全体の環境負荷を確実に減らすことができる」と明確に一致しています。",
    difficulty: 3,
    isOfficial: true,
  },

  // ==========================================
  // JLPT N2
  // ==========================================
  {
    examCode: "JLPT",
    levelCode: "N2",
    skill: SkillType.GRAMMAR,
    slug: "jlpt-n2-grammar-zaru-wo-enai",
    prompt: "これ以上赤字が続くようであれば、不採算部門を閉鎖（　　）。",
    context: "会社の経営会議での苦渋の決断についての発言です。",
    options: ["せざるを得ない", "するわけがない", "しないでおく", "するにすぎない"],
    answerIndex: 0,
    explanation: "「〜ざるを得ない」は「他に選択肢がなく、どうしても〜しなければならない（have no choice but to）」という義務・不可避を表します。するの否定連用形＋ざるを得ない＝せざるを得ない。",
    difficulty: 4,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N2",
    skill: SkillType.VOCABULARY,
    slug: "jlpt-n2-vocab-kaneru",
    prompt: "個人情報の管理上、そのようなご質問にはお答え（　　）。",
    context: "企業のカスタマーサポートにおける丁寧な断り表現です。",
    options: ["かねます", "かねません", "がちです", "すぎます"],
    answerIndex: 0,
    explanation: "「動詞連用形＋かねる」は「心理的・客観的理由から〜することができない（cannot do, reluctant to do）」という改まった断り表現です。「かねません」は「〜してしまう恐れがある」という意味になるため不適です。",
    difficulty: 4,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N2",
    skill: SkillType.READING,
    slug: "jlpt-n2-reading-ai-ethics",
    prompt: "技術革新と倫理規範の関係について、著者の見解に合うものはどれか。",
    context: "人工知能の発展は産業界に計り知れない恩恵をもたらす一方で、意思決定の透明性や責任の所在という未解決の倫理的命題を突きつけている。技術の暴走を許さないためには、開発の初期段階から多角的な倫理指針を組み込んでいく設計思想が不可欠である。",
    options: [
      "技術の進歩を最優先し、倫理的な課題は実用化後に解決すればよい",
      "AIの意思決定は完全に人間より優れているため、倫理基準は不要である",
      "開発の初期段階から多面的な倫理指針を組み込んで設計すべきである",
      "倫理的な議論が技術革新のスピードを著しく阻害している",
    ],
    answerIndex: 2,
    explanation: "本文末尾「開発の初期段階から多角的な倫理指針を組み込んでいく設計思想が不可欠である」と完全に合致します。",
    difficulty: 4,
    isOfficial: true,
  },

  // ==========================================
  // JLPT N1
  // ==========================================
  {
    examCode: "JLPT",
    levelCode: "N1",
    skill: SkillType.GRAMMAR,
    slug: "jlpt-n1-grammar-wo-kawagiri-ni",
    prompt: "先週の東京公演（　　）、全国12都市を巡る大規模なワールドツアーが幕を開けた。",
    context: "世界的な劇団の全国ツアー開始に関する報道記事です。",
    options: ["を皮切りに", "を境に", "をもって", "を限りに"],
    answerIndex: 0,
    explanation: "「〜を皮切りに（して／として）」は「〜を出発点・最初として次々と同類の行動や出来事が展開する」ことを表す高度な文型です。",
    difficulty: 5,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N1",
    skill: SkillType.VOCABULARY,
    slug: "jlpt-n1-vocab-kairi",
    prompt: "理想と現実の（　　）に苦しみながらも、彼は自らの信念を貫き通した。",
    context: "困難な状況における精神的葛藤を描写しています。",
    options: ["乖離", "乖乱", "孤立", "疎外"],
    answerIndex: 0,
    explanation: "「乖離（かいり）」は結びつきや本来一致すべきものが大きくかけ離れることを意味し、「理想と現実の乖離」というコロケーションで頻出します。",
    difficulty: 5,
    isOfficial: true,
  },
  {
    examCode: "JLPT",
    levelCode: "N1",
    skill: SkillType.READING,
    slug: "jlpt-n1-reading-cultural-preservation",
    prompt: "伝統文化の継承に関する筆者の主張として最も適切なものはどれか。",
    context: "伝統の墨守は、一見すると文化保存の美徳と映るかもしれないが、時代ごとの変容と異文化との接触を拒絶した遺産は、やがて生きた活力を失い博物館の陳列物へと形骸化する。真の伝統継承とは、古典の精神を土台に据えつつ、現代社会の要請に応じた絶えざる再解釈と創造的変革を試みる営みに他ならない。",
    options: [
      "伝統文化は過去の様式を寸分違わず墨守することにこそ本質的価値がある",
      "現代の商業主義に合わせて伝統の形式を完全に解体すべきである",
      "精神を根底に保持しながら、時代の文脈に応じた創造的変革を重ねること",
      "異文化の要素を取り入れることは、伝統固有の独自性を損なうため避けるべきだ",
    ],
    answerIndex: 2,
    explanation: "最終文「真の伝統継承とは、古典の精神を土台に据えつつ、現代社会の要請に応じた絶えざる再解釈と創造的変革を試みる営みに他ならない」が明確な筆者の主張です。",
    difficulty: 5,
    isOfficial: true,
  },

  // ==========================================
  // DELE A1
  // ==========================================
  {
    examCode: "DELE",
    levelCode: "A1",
    skill: SkillType.GRAMMAR,
    slug: "dele-a1-grammar-ser-estar",
    prompt: "Selecciona la opción correcta: Carlos es médico, pero hoy ______ enfermo en casa.",
    context: "Una conversación sobre el estado de salud de un compañero.",
    options: ["es", "está", "tiene", "hace"],
    answerIndex: 1,
    explanation: "Para estados temporales o de salud física circunstancial se utiliza el verbo 'estar' (está enfermo). 'Ser' se reserva para profesiones o características inherentes.",
    difficulty: 1,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "A1",
    skill: SkillType.VOCABULARY,
    slug: "dele-a1-vocab-family",
    prompt: "¿Cómo se llama el hermano de tu padre?",
    context: "Preguntas de relaciones de parentesco en el ámbito familiar.",
    options: ["Mi sobrino", "Mi abuelo", "Mi tío", "Mi primo"],
    answerIndex: 2,
    explanation: "El hermano de tu padre o de tu madre es tu 'tío'.",
    difficulty: 1,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "A1",
    skill: SkillType.READING,
    slug: "dele-a1-reading-schedule",
    prompt: "¿A qué hora abre la panadería los domingos?",
    context: "Cartel informativo: 'Horario comercial: Lunes a sábado de 08:00 a 20:00. Domingos y festivos de 09:00 a 14:00.'",
    options: ["A las 08:00", "A las 09:00", "A las 14:00", "A las 20:00"],
    answerIndex: 1,
    explanation: "El cartel indica claramente que los domingos y festivos abre a las 09:00.",
    difficulty: 1,
    isOfficial: true,
  },

  // ==========================================
  // DELE A2
  // ==========================================
  {
    examCode: "DELE",
    levelCode: "A2",
    skill: SkillType.GRAMMAR,
    slug: "dele-a2-grammar-indefinido-imperfecto",
    prompt: "Completa la frase: Mientras yo ______ la cena, sonó el teléfono.",
    context: "Relato de dos acciones simultáneas en el pasado (una continua interrumpida por otra puntual).",
    options: ["preparé", "preparaba", "he preparado", "prepararía"],
    answerIndex: 1,
    explanation: "Se emplea el pretérito imperfecto ('preparaba') para describir una acción en desarrollo en el pasado que es interrumpida por una acción puntual en indefinido ('sonó').",
    difficulty: 2,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "A2",
    skill: SkillType.GRAMMAR,
    slug: "dele-a2-grammar-pronouns-se-la",
    prompt: "¿Le diste la invitación a Elena? — Sí, ayer ______ di.",
    context: "Sustitución de complementos directo e indirecto en una respuesta rápida.",
    options: ["le la", "se la", "la le", "se lo"],
    answerIndex: 1,
    explanation: "Cuando el pronombre de objeto indirecto de 3ª persona ('le') precede a un pronombre de objeto directo ('la'), se transforma obligatoriamente en 'se' (se la di).",
    difficulty: 2,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "A2",
    skill: SkillType.READING,
    slug: "dele-a2-reading-hotel-reservation",
    prompt: "Según el correo de confirmación, ¿qué servicio tiene un coste adicional?",
    context: "Estimado cliente: Le confirmamos su estancia en el Hotel Sol. El desayuno buffet y el acceso a la piscina climatizada están incluidos en la tarifa. El servicio de traslado privado al aeropuerto requiere un suplemento de 15 €.",
    options: [
      "El desayuno buffet",
      "El acceso a la piscina climatizada",
      "El traslado privado al aeropuerto",
      "La reserva de la habitación",
    ],
    answerIndex: 2,
    explanation: "El texto afirma que el servicio de traslado privado al aeropuerto requiere un suplemento de 15 €, lo que supone un coste extra.",
    difficulty: 2,
    isOfficial: true,
  },

  // ==========================================
  // DELE B1
  // ==========================================
  {
    examCode: "DELE",
    levelCode: "B1",
    skill: SkillType.GRAMMAR,
    slug: "dele-b1-grammar-subjunctive-desire",
    prompt: "Selecciona la forma correcta: Mi madre quiere que nosotros ______ a verla este fin de semana.",
    context: "Expresión de deseo con cambio de sujeto.",
    options: ["vamos", "vayamos", "iremos", "íbamos"],
    answerIndex: 1,
    explanation: "Los verbos de deseo o voluntad ('querer que') exigen el modo subjuntivo en la oración subordinada cuando los sujetos son diferentes. Primera persona plural del presente de subjuntivo: 'vayamos'.",
    difficulty: 3,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "B1",
    skill: SkillType.GRAMMAR,
    slug: "dele-b1-grammar-por-para",
    prompt: "Trabajo duro ______ poder comprarme un coche nuevo a finales de año.",
    context: "Expresión de finalidad u objetivo.",
    options: ["por", "para", "hacia", "según"],
    answerIndex: 1,
    explanation: "'Para' indica finalidad o propósito futuro (in order to), mientras que 'por' expresa causa o motivo desencadenante.",
    difficulty: 3,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "B1",
    skill: SkillType.VOCABULARY,
    slug: "dele-b1-vocab-collocations",
    prompt: "El nuevo director quiere ______ una reunión extraordinaria para revisar el presupuesto.",
    context: "Ámbito empresarial y de gestión.",
    options: ["hacer", "convocar", "diseñar", "fabricar"],
    answerIndex: 1,
    explanation: "La colocación léxica formal más precisa y apropiada en español para organizar una reunión es 'convocar una reunión'.",
    difficulty: 3,
    isOfficial: true,
  },

  // ==========================================
  // DELE B2
  // ==========================================
  {
    examCode: "DELE",
    levelCode: "B2",
    skill: SkillType.GRAMMAR,
    slug: "dele-b2-grammar-concessive-subjunctive",
    prompt: "Iremos a la excursión en la montaña aunque ______ mal tiempo.",
    context: "Oración concesiva proyectada hacia el futuro con incertidumbre.",
    options: ["hace", "haga", "hiciera", "haría"],
    answerIndex: 1,
    explanation: "Con el conector concesivo 'aunque', cuando se alude a un hecho futuro e hipotético o no comprobado empíricamente, rige necesariamente el presente de subjuntivo ('haga').",
    difficulty: 4,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "B2",
    skill: SkillType.VOCABULARY,
    slug: "dele-b2-vocab-discourse-connectors",
    prompt: "El informe presenta ciertas irregularidades contables; ______, el auditor ha decidido posponer la certificación.",
    context: "Texto argumentativo y formal corporativo.",
    options: ["por consiguiente", "en cambio", "de todas formas", "a pesar de"],
    answerIndex: 0,
    explanation: "'Por consiguiente' es un conector consecutivo formal equivalente a 'por lo tanto' o 'en consecuencia', adecuado para el registro del enunciado.",
    difficulty: 4,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "B2",
    skill: SkillType.READING,
    slug: "dele-b2-reading-urban-mobility",
    prompt: "¿Cuál es el objetivo primordial del plan de peatonalización municipal expuesto en el artículo?",
    context: "La iniciativa de reordenación del tráfico en el casco histórico persigue primordialmente descongestionar las arterias principales y mitigar la contaminación acústica y atmosférica, revitalizando simultáneamente el comercio de proximidad frente a las grandes superficies periféricas.",
    options: [
      "Fomentar la apertura masiva de grandes superficies periféricas",
      "Reducir la contaminación y reactivar el comercio barrial de proximidad",
      "Aumentar el número de plazas de aparcamiento subterráneo para automóviles",
      "Sancionar a los conductores particulares sin alternativas de transporte",
    ],
    answerIndex: 1,
    explanation: "El texto señala claramente los dos fines: 'mitigar la contaminación acústica y atmosférica' y 'revitalizar simultáneamente el comercio de proximidad'.",
    difficulty: 4,
    isOfficial: true,
  },

  // ==========================================
  // DELE C1
  // ==========================================
  {
    examCode: "DELE",
    levelCode: "C1",
    skill: SkillType.GRAMMAR,
    slug: "dele-c1-grammar-negative-relative",
    prompt: "En esta empresa no hay nadie que ______ asumir la responsabilidad del fracaso de la campaña.",
    context: "Oración de relativo con antecedente negativo (inexistencia).",
    options: ["quiere", "quiera", "querrá", "ha querido"],
    answerIndex: 1,
    explanation: "En las oraciones de relativo con antecedente negado o indefinido cuya existencia se desconoce o niega ('no hay nadie que...'), el verbo subordinado se construye en modo subjuntivo ('quiera').",
    difficulty: 5,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "C1",
    skill: SkillType.VOCABULARY,
    slug: "dele-c1-vocab-idioms-hincapie",
    prompt: "Durante su comparecencia, el ministro hizo especial ______ en la necesidad de salvaguardar el estado de bienestar.",
    context: "Discurso político y lenguaje institucional elevado.",
    options: ["hincapié", "énfasis", "atención", "insistencia"],
    answerIndex: 0,
    explanation: "La locución verbal fijada en español culto es 'hacer hincapié en algo' (subrayar o enfatizar con insistencia).",
    difficulty: 5,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "C1",
    skill: SkillType.READING,
    slug: "dele-c1-reading-epistemology",
    prompt: "¿Qué postura adopta el autor respecto al cientificismo contemporáneo?",
    context: "El cientificismo dogmático contemporáneo tiende a descalificar toda aproximación humanística o hermenéutica tildándola de mera especulación subjetiva. Sin embargo, reducir la complejidad de la experiencia vital a algoritmos y métricas cuantificables mutila la capacidad crítica del ser humano ante dilemas éticos que escapan al cálculo matemático.",
    options: [
      "Defiende que las ciencias exactas bastan para resolver cualquier dilema ético",
      "Critica la reducción de la existencia humana al cálculo matemático sin reflexión humanística",
      "Propone abolir el método científico en favor de la especulación libre",
      "Afirma que los algoritmos han alcanzado una plena madurez ética",
    ],
    answerIndex: 1,
    explanation: "El autor denuncia expresamente que reducir la experiencia vital a métricas 'mutila la capacidad crítica del ser humano ante dilemas éticos', defendiendo el valor insustituible de la aproximación humanística.",
    difficulty: 5,
    isOfficial: true,
  },

  // ==========================================
  // DELE C2
  // ==========================================
  {
    examCode: "DELE",
    levelCode: "C2",
    skill: SkillType.GRAMMAR,
    slug: "dele-c2-grammar-discursive-inversion",
    prompt: "De haber sabido las consecuencias legales de semejante contrato, jamás lo ______ firmado.",
    context: "Estructura condicional irreal del pasado con inversión analítica culta.",
    options: ["había", "habría", "hubiera", "hubiese"],
    answerIndex: 1,
    explanation: "En la apódosis de una condición irreal en el pasado ('De haber sabido...'), la correlación temporal canónica y más elegante en la norma culta es el condicional compuesto: 'habría firmado' (o alternativamente 'hubiera firmado'). Entre las opciones dadas con función estricta de apódosis, 'habría' es la canónica.",
    difficulty: 5,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "C2",
    skill: SkillType.VOCABULARY,
    slug: "dele-c2-vocab-juicio-tela",
    prompt: "Los recientes hallazgos arqueológicos han puesto en tela de ______ las teorías cronológicas tradicionales sobre el poblamiento del valle.",
    context: "Debate científico de máximo rigor académico.",
    options: ["duda", "juicio", "discusión", "cuestión"],
    answerIndex: 1,
    explanation: "La locución idiomática culta de arraigo secular es 'poner en tela de juicio' (someter algo a duda o examen riguroso).",
    difficulty: 5,
    isOfficial: true,
  },

  // ==========================================
  // DALF C1
  // ==========================================
  {
    examCode: "DALF",
    levelCode: "C1",
    skill: SkillType.GRAMMAR,
    slug: "dalf-c1-grammar-concession-bien-que",
    prompt: "Choisissez la forme verbale correcte : Bien que ce projet ______ d'indéniables qualités techniques, sa rentabilité demeure incertaine.",
    context: "Évaluation d'un dossier d'investissement en comité de direction.",
    options: ["présente", "présente (subjonctif)", "présentera", "présenterait"],
    answerIndex: 1,
    explanation: "La locution conjonctive de concession « bien que » exige sans exception le mode subjonctif. Ici, « présente » est au présent du subjonctif (3e pers. singulier).",
    difficulty: 4,
    isOfficial: true,
  },
  {
    examCode: "DALF",
    levelCode: "C1",
    skill: SkillType.VOCABULARY,
    slug: "dalf-c1-vocab-connecteurs-des-lors",
    prompt: "Complétez : Les cours des matières premières se sont effondrés ; ______ que les perspectives de croissance ont été brutalement révisées.",
    context: "Analyse macroéconomique de conjoncture.",
    options: ["dès lors", "alors même", "pourvu", "bien entendu"],
    answerIndex: 0,
    explanation: "« Dès lors que » s'emploie pour marquer une conséquence directe ou une causalité temporelle évidente dans un registre soutenu (puisque, du moment où).",
    difficulty: 4,
    isOfficial: true,
  },
  {
    examCode: "DALF",
    levelCode: "C1",
    skill: SkillType.READING,
    slug: "dalf-c1-reading-biodiversity",
    prompt: "Quelle est la thèse centrale développée par l'auteur dans cet extrait ?",
    context: "La préservation de la biodiversité ne saurait être appréhendée sous le seul prisme comptable des services écosystémiques marchands. En subordonnant la protection des espèces à leur utilité économique immédiate pour l'homme, on cautionne insidieusement la destruction de pans entiers du vivant jugés non rentables.",
    options: [
      "Il convient de privatiser la gestion des parcs naturels pour maximiser leur rendement",
      "La biodiversité doit être protégée pour sa valeur intrinsèque et non par pur utilitarisme économique",
      "Seules les espèces présentant un intérêt pharmaceutique avéré méritent d'être financées",
      "L'économie marchande constitue le seul instrument efficient de conservation écologique",
    ],
    answerIndex: 1,
    explanation: "L'auteur dénonce explicitement la vision utilitariste et marchande (« seul prisme comptable ») et défend une éthique de protection du vivant non asservie à la rentabilité immédiate.",
    difficulty: 5,
    isOfficial: true,
  },

  // ==========================================
  // DALF C2
  // ==========================================
  {
    examCode: "DALF",
    levelCode: "C2",
    skill: SkillType.GRAMMAR,
    slug: "dalf-c2-grammar-ne-expletif",
    prompt: "Dans quelle proposition l'emploi du « ne » explétif est-il syntaxiquement irréprochable dans le registre soutenu ?",
    context: "Analyse de la syntaxe stylistique littéraire et académique.",
    options: [
      "Je crains qu'il ne vienne gâcher la fête.",
      "Je doute qu'il ne soit à la hauteur de la situation.",
      "Il est évident que nous ne réussirons pas.",
      "Bien qu'il ne veuille point coopérer.",
    ],
    answerIndex: 0,
    explanation: "Après les verbes exprimant la crainte ou l'appréhension (craindre, avoir peur, redouter) employés affirmativement, le français soutenu requiert l'insertion d'un « ne » explétif (qui ne porte aucune valeur de négation sémantique) : « Je crains qu'il ne vienne... ».",
    difficulty: 5,
    isOfficial: true,
  },
  {
    examCode: "DALF",
    levelCode: "C2",
    skill: SkillType.VOCABULARY,
    slug: "dalf-c2-vocab-aporie-episteme",
    prompt: "Que désigne précisément le terme philosophique « aporie » dans une argumentation critique ?",
    context: "Vocabulaire de la critique rhétorique et épistémologique.",
    options: [
      "Une certitude dogmatique indémontrable",
      "Une difficulté d'ordre logique conduisant à une impasse intellectuelle",
      "Une figure de style fondée sur la répétition anaphorique",
      "Une conclusion universellement acceptée par consensus",
    ],
    answerIndex: 1,
    explanation: "Une aporie (du grec aporia) désigne une contradiction insoluble ou une difficulté logique qui paralyse le raisonnement et le place dans une impasse conceptuelle.",
    difficulty: 5,
    isOfficial: true,
  },
  {
    examCode: "DALF",
    levelCode: "C2",
    skill: SkillType.READING,
    slug: "dalf-c2-reading-critique-litteraire",
    prompt: "Selon l'essayiste, quel est le piège inhérent à l'herméneutique post-moderne ?",
    context: "À force de déconstruire le texte jusqu'à dissoudre l'intention auctoriale dans l'infini des lectures subjectives, l'exégète post-moderne s'enferme dans un vertige solipsiste. Dès lors que toute interprétation est décrétée équivalente, la critique renonce à discerner le vrai du faux, métamorphosant le commentaire littéraire en un pur jeu d'échos narcissiques.",
    options: [
      "La surévaluation systématique de la biographie psychologique de l'auteur",
      "Le risque de sombrer dans le relativisme absolu où tout critère de validité s'effondre",
      "Le rejet unilatéral de l'analyse linguistique au profit de considérations morales",
      "Une confiance aveugle dans la toute-puissance de la logique mathématique",
    ],
    answerIndex: 1,
    explanation: "L'auteur dénonce l'écueil du relativisme interprétatif (« toute interprétation est décrétée équivalente » et la critique « renonce à discerner le vrai du faux »), conduisant à un solipsisme narcissique.",
    difficulty: 5,
    isOfficial: true,
  },
];

async function main() {
  console.log("🚀 Starting Real Exam Questions Seed...");

  // Fetch all levels
  const levels = await prisma.examLevel.findMany({
    include: { exam: true },
  });

  const levelMap = new Map<string, string>();
  for (const lvl of levels) {
    const key = `${lvl.exam.code.toUpperCase()}-${lvl.code.toUpperCase()}`;
    levelMap.set(key, lvl.id);
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const item of REAL_QUESTIONS) {
    const key = `${item.examCode.toUpperCase()}-${item.levelCode.toUpperCase()}`;
    const examLevelId = levelMap.get(key);

    if (!examLevelId) {
      console.warn(`⚠️ Warning: Exam level not found for ${key}. Skipping question "${item.slug}"`);
      continue;
    }

    // Check if question already exists by slug
    const existing = await prisma.question.findUnique({
      where: { slug: item.slug },
    });

    if (existing) {
      console.log(`ℹ️ Question already exists: ${item.slug}. Updating options & explanation...`);
      // Update question and options atomically
      await prisma.$transaction(async (tx) => {
        await tx.questionOption.deleteMany({
          where: { questionId: existing.id },
        });

        await tx.question.update({
          where: { id: existing.id },
          data: {
            examLevelId,
            skill: item.skill,
            prompt: {
              text: item.prompt,
              ...(item.context ? { context: item.context } : {}),
            },
            explanation: item.explanation,
            difficulty: item.difficulty,
            sourceLabel: item.isOfficial ? "Official syllabus specification" : "Original LinguaCamp practice",
            isOfficial: item.isOfficial,
            options: {
              create: item.options.map((opt, idx) => ({
                label: String.fromCharCode(65 + idx),
                content: { text: opt },
                sortOrder: idx + 1,
                isCorrect: idx === item.answerIndex,
              })),
            },
          },
        });
      });
      skippedCount++;
      continue;
    }

    // Create new question with options
    await prisma.question.create({
      data: {
        slug: item.slug,
        examLevelId,
        skill: item.skill,
        type: "SINGLE_CHOICE",
        prompt: {
          text: item.prompt,
          ...(item.context ? { context: item.context } : {}),
        },
        explanation: item.explanation,
        difficulty: item.difficulty,
        sourceLabel: item.isOfficial ? "Official syllabus specification" : "Original LinguaCamp practice",
        isOfficial: item.isOfficial,
        options: {
          create: item.options.map((opt, idx) => ({
            label: String.fromCharCode(65 + idx),
            content: { text: opt },
            sortOrder: idx + 1,
            isCorrect: idx === item.answerIndex,
          })),
        },
      },
    });

    createdCount++;
    console.log(`✅ Created: [${item.examCode} ${item.levelCode}] ${item.slug}`);
  }

  const totalQuestions = await prisma.question.count();
  console.log(`\n🎉 Real Exam Questions Seed Completed!`);
  console.log(`- Created: ${createdCount}`);
  console.log(`- Updated: ${skippedCount}`);
  console.log(`- Total Questions in DB: ${totalQuestions}\n`);
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
