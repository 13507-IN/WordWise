import { Prisma, SkillType } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

type SectionSeed = {
  code: string;
  name: string;
  skill: SkillType;
  durationMinutes?: number;
  preparationMinutes?: number;
};

type LevelSeed = {
  code: string;
  name: string;
  sortOrder: number;
  overview: string;
  officialSourceUrl: string;
  formatVersion: string;
  sections: SectionSeed[];
  questions: {
    skill: SkillType;
    prompt: string;
    context?: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
};

const jlptSource = "https://www.jlpt.jp/e/guideline/testsections.html";
const deleSource = (level: string) =>
  `https://examenes.cervantes.es/es/dele/examenes/${level.toLowerCase()}`;

const exams: {
  code: string;
  name: string;
  language: string;
  description: string;
  officialUrl: string;
  levels: LevelSeed[];
}[] = [
  {
    code: "JLPT",
    name: "Japanese Language Proficiency Test",
    language: "Japanese",
    description:
      "Japanese proficiency preparation organized around vocabulary, grammar, reading and listening at the selected JLPT level.",
    officialUrl: jlptSource,
    levels: [
      {
        code: "N5",
        name: "JLPT N5",
        sortOrder: 1,
        overview: "The foundational JLPT level. Build confidence with basic Japanese, familiar expressions and short everyday texts.",
        officialSourceUrl: jlptSource,
        formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "vocabulary", name: "Language Knowledge: Vocabulary", skill: SkillType.VOCABULARY, durationMinutes: 20 },
          { code: "grammar-reading", name: "Language Knowledge: Grammar and Reading", skill: SkillType.GRAMMAR, durationMinutes: 40 },
          { code: "listening", name: "Listening", skill: SkillType.LISTENING, durationMinutes: 30 },
        ],
        questions: [
          { skill: SkillType.VOCABULARY, prompt: "「山」の意味はどれですか。", options: ["mountain", "river", "station"], answer: 0, explanation: "山（やま）は「mountain」です。" },
          { skill: SkillType.GRAMMAR, prompt: "文を完成してください。私は毎朝、水を＿＿。", options: ["飲みます", "食べます", "見ます"], answer: 0, explanation: "飲む is used for drinking. The polite present form is 飲みます." },
        ],
      },
      {
        code: "N4",
        name: "JLPT N4",
        sortOrder: 2,
        overview: "Strengthen basic Japanese and understand familiar conversations and passages at a measured pace.",
        officialSourceUrl: jlptSource,
        formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "vocabulary", name: "Language Knowledge: Vocabulary", skill: SkillType.VOCABULARY, durationMinutes: 25 },
          { code: "grammar-reading", name: "Language Knowledge: Grammar and Reading", skill: SkillType.GRAMMAR, durationMinutes: 55 },
          { code: "listening", name: "Listening", skill: SkillType.LISTENING, durationMinutes: 35 },
        ],
        questions: [
          { skill: SkillType.VOCABULARY, prompt: "「週末は友だちと映画を見に行きました。」いつ映画を見ましたか。", options: ["on the weekend", "this morning", "next week"], answer: 0, explanation: "週末（しゅうまつ） means the weekend." },
          { skill: SkillType.GRAMMAR, prompt: "文を完成してください。駅で友だちに＿＿。", options: ["会いました", "会いますか", "会うので"], answer: 0, explanation: "The sentence describes a completed past event, so 会いました is appropriate." },
        ],
      },
      {
        code: "N3",
        name: "JLPT N3",
        sortOrder: 3,
        overview: "Connect foundational Japanese with independent reading and listening in everyday situations.",
        officialSourceUrl: jlptSource,
        formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "vocabulary", name: "Language Knowledge: Vocabulary", skill: SkillType.VOCABULARY, durationMinutes: 30 },
          { code: "grammar-reading", name: "Language Knowledge: Grammar and Reading", skill: SkillType.GRAMMAR, durationMinutes: 70 },
          { code: "listening", name: "Listening", skill: SkillType.LISTENING, durationMinutes: 40 },
        ],
        questions: [
          { skill: SkillType.GRAMMAR, prompt: "雨が降っていた＿＿、試合は予定どおり行われた。", options: ["のに", "ので", "から"], answer: 0, explanation: "のに marks a contrast: although it was raining, the match went ahead." },
          { skill: SkillType.VOCABULARY, prompt: "「彼は新しい会社で製品の開発を担当している。」開発に近い意味はどれですか。", options: ["creating and improving", "selling at a shop", "writing a review"], answer: 0, explanation: "開発 means development: creating or improving a product or system." },
        ],
      },
      {
        code: "N2",
        name: "JLPT N2",
        sortOrder: 4,
        overview: "Practice reading and listening to a broad range of topics, including clear formal and public language.",
        officialSourceUrl: jlptSource,
        formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "language-knowledge-reading", name: "Language Knowledge and Reading", skill: SkillType.READING, durationMinutes: 105 },
          { code: "listening", name: "Listening", skill: SkillType.LISTENING, durationMinutes: 50 },
        ],
        questions: [
          { skill: SkillType.GRAMMAR, prompt: "十分に検討した＿＿、計画を変更することにした。", options: ["うえで", "ばかりに", "ところを"], answer: 0, explanation: "うえで indicates that a decision was made after first considering the matter." },
          { skill: SkillType.READING, prompt: "「申込者が定員を超えた場合、抽選によって参加者を決定します。」参加者はどう決まりますか。", options: ["by a lottery", "in order of arrival", "by an interview"], answer: 0, explanation: "抽選 means a lottery or drawing lots." },
        ],
      },
      {
        code: "N1",
        name: "JLPT N1",
        sortOrder: 5,
        overview: "Refine advanced comprehension across complex written and spoken Japanese, including abstract arguments and nuance.",
        officialSourceUrl: jlptSource,
        formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "language-knowledge-reading", name: "Language Knowledge and Reading", skill: SkillType.READING, durationMinutes: 110 },
          { code: "listening", name: "Listening", skill: SkillType.LISTENING, durationMinutes: 55 },
        ],
        questions: [
          { skill: SkillType.GRAMMAR, prompt: "新制度は、現場の実情を踏まえた＿＿、運用の見直しが必要だ。", options: ["うえで", "のみならず", "にひきかえ"], answer: 0, explanation: "うえで fits the meaning of taking the actual circumstances into account before reviewing implementation." },
          { skill: SkillType.READING, prompt: "「数値の改善だけを成果とみなすのではなく、その変化が誰にどのような影響を与えたかを検証すべきだ。」筆者が重視することは何ですか。", options: ["examining the effects of the change", "publishing more numerical targets", "avoiding changes to existing measures"], answer: 0, explanation: "The sentence argues for evaluating who was affected and how, not just the numerical change." },
        ],
      },
    ],
  },
  {
    code: "DELE",
    name: "Diplomas de Español como Lengua Extranjera",
    language: "Spanish",
    description:
      "Spanish certification practice across reading, listening, writing and speaking, using level-specific original prompts.",
    officialUrl: "https://examenes.cervantes.es/es/dele",
    levels: [
      {
        code: "A1", name: "DELE A1", sortOrder: 1,
        overview: "Use familiar everyday expressions and introduce yourself in simple interactions.",
        officialSourceUrl: deleSource("a1"), formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "reading", name: "Reading comprehension", skill: SkillType.READING, durationMinutes: 45 },
          { code: "listening", name: "Listening comprehension", skill: SkillType.LISTENING, durationMinutes: 25 },
          { code: "writing", name: "Written expression and interaction", skill: SkillType.WRITING, durationMinutes: 25 },
          { code: "speaking", name: "Oral expression and interaction", skill: SkillType.SPEAKING, durationMinutes: 10, preparationMinutes: 10 },
        ],
        questions: [
          { skill: SkillType.VOCABULARY, prompt: "¿Cómo se dice “Good morning” en español?", options: ["Buenos días", "Buenas noches", "Hasta luego"], answer: 0, explanation: "Buenos días is a common morning greeting." },
          { skill: SkillType.READING, prompt: "Lee: «La biblioteca abre de lunes a viernes, de nueve a seis». ¿Cuándo abre la biblioteca?", options: ["de lunes a viernes", "solo los sábados", "todos los días por la noche"], answer: 0, explanation: "The notice says the library opens Monday through Friday." },
        ],
      },
      {
        code: "A2", name: "DELE A2", sortOrder: 2,
        overview: "Communicate in routine situations and describe immediate needs and familiar topics.",
        officialSourceUrl: deleSource("a2"), formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "reading", name: "Reading comprehension", skill: SkillType.READING, durationMinutes: 60 },
          { code: "listening", name: "Listening comprehension", skill: SkillType.LISTENING, durationMinutes: 40 },
          { code: "writing", name: "Written expression and interaction", skill: SkillType.WRITING, durationMinutes: 45 },
          { code: "speaking", name: "Oral expression and interaction", skill: SkillType.SPEAKING, durationMinutes: 12, preparationMinutes: 12 },
        ],
        questions: [
          { skill: SkillType.GRAMMAR, prompt: "Ayer nosotros ___ al museo del centro.", options: ["fuimos", "vamos", "iremos"], answer: 0, explanation: "Ayer places the action in the past; fuimos is the preterite form of ir for nosotros." },
          { skill: SkillType.READING, prompt: "Lee: «Se alquila habitación exterior. Hay metro a dos minutos y el precio incluye agua». ¿Qué está incluido?", options: ["water", "electricity", "breakfast"], answer: 0, explanation: "The notice explicitly says the price includes water." },
        ],
      },
      {
        code: "B1", name: "DELE B1", sortOrder: 3,
        overview: "Handle familiar situations while connecting experiences, plans and opinions in clear language.",
        officialSourceUrl: deleSource("b1"), formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "reading", name: "Reading comprehension", skill: SkillType.READING, durationMinutes: 70 },
          { code: "listening", name: "Listening comprehension", skill: SkillType.LISTENING, durationMinutes: 40 },
          { code: "writing", name: "Written expression and interaction", skill: SkillType.WRITING, durationMinutes: 60 },
          { code: "speaking", name: "Oral expression and interaction", skill: SkillType.SPEAKING, durationMinutes: 15, preparationMinutes: 15 },
        ],
        questions: [
          { skill: SkillType.GRAMMAR, prompt: "Si tuviera más tiempo, ___ por el norte de España.", options: ["viajaría", "viajaba", "viajé"], answer: 0, explanation: "A hypothetical condition with si tuviera is commonly followed by the conditional: viajaría." },
          { skill: SkillType.READING, prompt: "Lee: «El ayuntamiento amplía el horario de autobuses durante el festival para reducir el uso del coche». ¿Por qué amplía el servicio?", options: ["to reduce car use", "to shorten the festival", "to close the city centre"], answer: 0, explanation: "The stated goal is reducing car use during the festival." },
        ],
      },
      {
        code: "B2", name: "DELE B2", sortOrder: 4,
        overview: "Understand complex texts and sustain detailed discussions with clear, spontaneous communication.",
        officialSourceUrl: deleSource("b2"), formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "reading", name: "Reading comprehension", skill: SkillType.READING, durationMinutes: 70 },
          { code: "listening", name: "Listening comprehension", skill: SkillType.LISTENING, durationMinutes: 40 },
          { code: "writing", name: "Written expression and interaction", skill: SkillType.WRITING, durationMinutes: 80 },
          { code: "speaking", name: "Oral expression and interaction", skill: SkillType.SPEAKING, durationMinutes: 20, preparationMinutes: 20 },
        ],
        questions: [
          { skill: SkillType.GRAMMAR, prompt: "Aunque ___ cansado, terminó el informe antes de salir.", options: ["estaba", "estuvo", "estaría"], answer: 0, explanation: "Estaba describes the ongoing state that contrasts with completing the report." },
          { skill: SkillType.READING, prompt: "Lee: «El informe no cuestiona la digitalización, sino que advierte que su éxito depende de que los servicios presenciales sigan disponibles». ¿Cuál es la postura?", options: ["digital services should complement in-person services", "digitalization should be abandoned", "in-person services are no longer useful"], answer: 0, explanation: "The text supports digitalization while emphasizing continued access to in-person services." },
        ],
      },
      {
        code: "C1", name: "DELE C1", sortOrder: 5,
        overview: "Use Spanish flexibly for demanding academic, professional and social purposes, with control of complex discourse.",
        officialSourceUrl: deleSource("c1"), formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "reading-language", name: "Reading comprehension and use of language", skill: SkillType.READING, durationMinutes: 90 },
          { code: "listening-language", name: "Listening comprehension and use of language", skill: SkillType.LISTENING, durationMinutes: 50 },
          { code: "writing", name: "Written expression, interaction and mediation", skill: SkillType.WRITING, durationMinutes: 80 },
          { code: "speaking", name: "Oral expression, interaction and mediation", skill: SkillType.SPEAKING, durationMinutes: 20, preparationMinutes: 20 },
        ],
        questions: [
          { skill: SkillType.GRAMMAR, prompt: "La medida, por novedosa que ___, debe evaluarse con datos a largo plazo.", options: ["sea", "es", "fue"], answer: 0, explanation: "The concessive construction por ... que takes the subjunctive when the quality is presented as non-limiting." },
          { skill: SkillType.READING, prompt: "Lee: «La reforma no fracasó por falta de recursos, sino porque sus objetivos se definieron sin consultar a quienes debían aplicarla». ¿Qué explica el texto?", options: ["a mismatch between policy design and practitioners", "a shortage of public funding", "a lack of measurable outcomes"], answer: 0, explanation: "The passage attributes the problem to not consulting the people responsible for implementation." },
        ],
      },
      {
        code: "C2", name: "DELE C2", sortOrder: 6,
        overview: "Demonstrate precise, nuanced command of Spanish in integrated comprehension and production tasks.",
        officialSourceUrl: deleSource("c2"), formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "integrated-comprehension", name: "Use of language, reading and listening", skill: SkillType.INTEGRATED, durationMinutes: 105 },
          { code: "integrated-writing", name: "Integrated reading and written expression", skill: SkillType.WRITING, durationMinutes: 150 },
          { code: "integrated-speaking", name: "Integrated oral expression and interaction", skill: SkillType.SPEAKING, durationMinutes: 20, preparationMinutes: 30 },
        ],
        questions: [
          { skill: SkillType.GRAMMAR, prompt: "No es que la propuesta carezca de mérito; ___, su aplicación exige precisar los criterios de evaluación.", options: ["con todo", "a duras penas", "de golpe"], answer: 0, explanation: "Con todo introduces a contrast similar to “nevertheless” in this context." },
          { skill: SkillType.READING, prompt: "Lee: «La autora no propone sustituir la experiencia por indicadores, sino emplearlos para hacer visibles aspectos que el juicio intuitivo tiende a pasar por alto». ¿Qué relación plantea?", options: ["indicators should supplement judgment", "indicators should replace all experience", "intuition is more reliable than evidence"], answer: 0, explanation: "The passage frames indicators as a complement that can reveal overlooked aspects." },
        ],
      },
    ],
  },
  {
    code: "DALF",
    name: "Diplôme Approfondi de Langue Française",
    language: "French",
    description:
      "Advanced French preparation focused on comprehension, structured writing, argumentation and oral production.",
    officialUrl: "https://www.france-education-international.fr/diplome/dalf",
    levels: [
      {
        code: "C1", name: "DALF C1", sortOrder: 1,
        overview: "Understand long, demanding texts and express ideas fluently in academic and professional contexts.",
        officialSourceUrl: "https://www.france-education-international.fr/diplome/dalf/c1",
        formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "listening", name: "Compréhension de l’oral", skill: SkillType.LISTENING, durationMinutes: 40 },
          { code: "reading", name: "Compréhension des écrits", skill: SkillType.READING, durationMinutes: 50 },
          { code: "writing", name: "Production écrite", skill: SkillType.WRITING, durationMinutes: 150 },
          { code: "speaking", name: "Production orale", skill: SkillType.SPEAKING, durationMinutes: 30, preparationMinutes: 60 },
        ],
        questions: [
          { skill: SkillType.READING, prompt: "Dans un texte argumentatif, quelle fonction remplit le connecteur « néanmoins » ?", options: ["introduire une concession", "annoncer une conséquence", "ajouter un exemple"], answer: 0, explanation: "Néanmoins introduces a contrast or concession, close to “nevertheless”." },
          { skill: SkillType.WRITING, prompt: "Quelle organisation convient le mieux à une synthèse de documents ?", options: ["regrouper les idées par thèmes et confronter les points de vue", "résumer chaque document séparément sans lien", "énumérer les citations dans leur ordre d’apparition"], answer: 0, explanation: "A synthesis groups and compares ideas across sources rather than treating each document in isolation." },
        ],
      },
      {
        code: "C2", name: "DALF C2", sortOrder: 2,
        overview: "Synthesize complex information and communicate with precision across integrated written and oral tasks.",
        officialSourceUrl: "https://www.france-education-international.fr/diplome/dalf/c2",
        formatVersion: "Seed configuration; confirm details with the linked official source.",
        sections: [
          { code: "integrated-writing", name: "Compréhension et production écrites", skill: SkillType.INTEGRATED, durationMinutes: 210 },
          { code: "integrated-speaking", name: "Compréhension et production orales", skill: SkillType.INTEGRATED, durationMinutes: 30, preparationMinutes: 60 },
        ],
        questions: [
          { skill: SkillType.READING, prompt: "Dans une synthèse de sources contradictoires, quelle démarche est la plus rigoureuse ?", options: ["distinguer les constats partagés des interprétations divergentes", "retenir uniquement la source la plus longue", "effacer les désaccords pour produire une thèse unique"], answer: 0, explanation: "A rigorous synthesis preserves both common ground and meaningful differences between sources." },
          { skill: SkillType.SPEAKING, prompt: "Pour défendre une position nuancée à l’oral, quelle stratégie est la plus efficace ?", options: ["formuler une thèse, examiner une objection et y répondre", "enchaîner des exemples sans annoncer de position", "répéter la conclusion après chaque argument"], answer: 0, explanation: "A clear position supported by argument, counterargument and response demonstrates structured reasoning." },
        ],
      },
    ],
  },
];

async function main() {
  for (const examData of exams) {
    const { levels: seededLevels, ...examFields } = examData;
    const exam = await prisma.exam.upsert({
      where: { code: examData.code },
      update: {
        ...examFields,
      },
      create: examFields,
    });

    for (const levelData of seededLevels) {
      const level = await prisma.examLevel.upsert({
        where: { examId_code: { examId: exam.id, code: levelData.code } },
        update: {
          name: levelData.name,
          sortOrder: levelData.sortOrder,
          overview: levelData.overview,
          officialSourceUrl: levelData.officialSourceUrl,
          formatVersion: levelData.formatVersion,
          structure: levelData.sections as unknown as Prisma.InputJsonValue,
        },
        create: {
          examId: exam.id,
          code: levelData.code,
          name: levelData.name,
          sortOrder: levelData.sortOrder,
          overview: levelData.overview,
          officialSourceUrl: levelData.officialSourceUrl,
          formatVersion: levelData.formatVersion,
          structure: levelData.sections as unknown as Prisma.InputJsonValue,
        },
      });

      for (const [sortOrder, section] of levelData.sections.entries()) {
        await prisma.examSection.upsert({
          where: { examLevelId_code: { examLevelId: level.id, code: section.code } },
          update: { ...section, sortOrder },
          create: { ...section, examLevelId: level.id, sortOrder },
        });
      }

      const skillGroups = [...new Set(levelData.questions.map((question) => question.skill))];
      let firstLessonId: string | undefined;
      for (const [sortOrder, skill] of skillGroups.entries()) {
        const learningModule = await prisma.learningModule.upsert({
          where: { examLevelId_title: { examLevelId: level.id, title: `${level.name} ${skill.toLowerCase()}` } },
          update: { examId: exam.id, skill, sortOrder },
          create: {
            examId: exam.id,
            examLevelId: level.id,
            title: `${level.name} ${skill.toLowerCase()}`,
            skill,
            sortOrder,
          },
        });
        const lesson = await prisma.lesson.upsert({
          where: { slug: `${examData.code.toLowerCase()}-${levelData.code.toLowerCase()}-${skill.toLowerCase()}-starter` },
          update: {
            moduleId: learningModule.id,
            title: `${skill[0]}${skill.slice(1).toLowerCase()} checkpoint`,
            summary: `A short original ${level.name} practice set.`,
          },
          create: {
            moduleId: learningModule.id,
            slug: `${examData.code.toLowerCase()}-${levelData.code.toLowerCase()}-${skill.toLowerCase()}-starter`,
            title: `${skill[0]}${skill.slice(1).toLowerCase()} checkpoint`,
            summary: `A short original ${level.name} practice set.`,
            body: {
              sections: [
                {
                  heading: "Practice with a purpose",
                  text: `Use this original sample to check how you approach ${skill.toLowerCase()} tasks at ${level.name}.`,
                },
              ],
            },
            estimatedMinutes: 8,
            learningObjectives: [`Review ${skill.toLowerCase()} at ${level.name}`],
            published: true,
          },
        });
        firstLessonId ??= lesson.id;
      }

      const questions = [];
      for (const [index, item] of levelData.questions.entries()) {
        const slug = `${examData.code.toLowerCase()}-${levelData.code.toLowerCase()}-${index + 1}`;
        const question = await prisma.question.upsert({
          where: { slug },
          update: {},
          create: {
              slug,
              examLevelId: level.id,
              lessonId: firstLessonId,
              skill: item.skill,
              type: "SINGLE_CHOICE",
              prompt: { text: item.prompt, ...(item.context ? { context: item.context } : {}) },
              explanation: item.explanation,
              difficulty: levelData.sortOrder,
              sourceLabel: "LinguaCamp original sample",
              isOfficial: false,
              options: {
                create: item.options.map((text, optionIndex) => ({
                  label: String.fromCharCode(65 + optionIndex),
                  content: { text },
                  sortOrder: optionIndex,
                  isCorrect: optionIndex === item.answer,
                })),
              },
          },
        });
        questions.push(question);
      }

      const mockSlug = `${examData.code.toLowerCase()}-${levelData.code.toLowerCase()}-starter-checkpoint`;
      const mock = await prisma.mockExam.upsert({
        where: { slug: mockSlug },
        update: {
          examLevelId: level.id,
          title: `${level.name} starter checkpoint`,
          mode: "SECTION",
          durationMinutes: Math.max(5, questions.length * 2),
        },
        create: {
          slug: mockSlug,
          examLevelId: level.id,
          title: `${level.name} starter checkpoint`,
          mode: "SECTION",
          durationMinutes: Math.max(5, questions.length * 2),
          isSample: true,
        },
      });
      for (const [sortOrder, question] of questions.entries()) {
        await prisma.mockExamQuestion.upsert({
          where: { mockExamId_questionId: { mockExamId: mock.id, questionId: question.id } },
          update: { sortOrder },
          create: { mockExamId: mock.id, questionId: question.id, sortOrder },
        });
      }
    }
  }

  console.info(`Seeded ${exams.length} exams and ${exams.reduce((count, exam) => count + exam.levels.length, 0)} exam levels.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
