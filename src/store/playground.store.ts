import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IconName } from '@/components/ui/Icon';

export interface PlaygroundSnippet {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaygroundTemplate {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  code: string;
}

export const PLAYGROUND_TEMPLATES: PlaygroundTemplate[] = [
  {
    id: 'tpl-calculadora',
    name: 'Calculadora',
    description: 'Variaveis, tipos e condicionais',
    icon: 'abacus',
    code: `// Calculadora simples

let numero1: number = 10;
let numero2: number = 5;
let operacao: string = "+";

let resultado: number = 0;

if (operacao === "+") {
  resultado = numero1 + numero2;
} else if (operacao === "-") {
  resultado = numero1 - numero2;
} else if (operacao === "*") {
  resultado = numero1 * numero2;
} else if (operacao === "/") {
  resultado = numero1 / numero2;
}

console.log(\`\${numero1} \${operacao} \${numero2} = \${resultado}\`);
`,
  },
  {
    id: 'tpl-historia',
    name: 'Gerador de Historia',
    description: 'Arrays e template literals',
    icon: 'book',
    code: `// Gerador de Historia Aleatoria

let herois = ["Luna", "Max", "Pixel", "Nova"];
let lugares = ["floresta encantada", "cidade do futuro", "ilha misteriosa", "castelo nas nuvens"];
let objetos = ["espada magica", "mapa do tesouro", "cristal brilhante", "chave dourada"];
let acoes = ["encontrou", "descobriu", "desbloqueou", "criou"];

let heroi = herois[Math.floor(Math.random() * herois.length)];
let lugar = lugares[Math.floor(Math.random() * lugares.length)];
let objeto = objetos[Math.floor(Math.random() * objetos.length)];
let acao = acoes[Math.floor(Math.random() * acoes.length)];

console.log("=== Sua Historia ===");
console.log(\`\${heroi} estava explorando a \${lugar}.\`);
console.log(\`De repente, \${heroi} \${acao} uma \${objeto}!\`);
console.log("E assim comecou uma grande aventura...");
`,
  },
  {
    id: 'tpl-adivinhacao',
    name: 'Jogo de Adivinhacao',
    description: 'Loops e condicionais',
    icon: 'target',
    code: `// Jogo de Adivinhacao

let segredo: number = Math.floor(Math.random() * 20) + 1;
let tentativas: number[] = [5, 10, 15, 7, 12, 3];
let acertou: boolean = false;

console.log("Tentando adivinhar um numero de 1 a 20...");
console.log("");

for (let i = 0; i < tentativas.length; i++) {
  let palpite = tentativas[i];

  if (palpite === segredo) {
    console.log(\`Tentativa \${i + 1}: \${palpite} -> Acertou!\`);
    acertou = true;
    break;
  } else if (palpite < segredo) {
    console.log(\`Tentativa \${i + 1}: \${palpite} -> Muito baixo!\`);
  } else {
    console.log(\`Tentativa \${i + 1}: \${palpite} -> Muito alto!\`);
  }
}

if (!acertou) {
  console.log(\`\\nNao acertou. O numero era \${segredo}.\`);
}
`,
  },
  {
    id: 'tpl-tarefas',
    name: 'Lista de Tarefas',
    description: 'Arrays e objetos',
    icon: 'changelog',
    code: `// Lista de Tarefas

let tarefas = [
  { titulo: "Estudar TypeScript", feita: true },
  { titulo: "Fazer exercicios do CodeQuest", feita: true },
  { titulo: "Criar meu primeiro programa", feita: false },
  { titulo: "Praticar loops e arrays", feita: false },
  { titulo: "Resolver um desafio", feita: false },
];

console.log("Minhas Tarefas:");
console.log("");

for (let tarefa of tarefas) {
  let status = tarefa.feita ? "[x]" : "[ ]";
  console.log(\`\${status} \${tarefa.titulo}\`);
}

let feitas = 0;
for (let tarefa of tarefas) {
  if (tarefa.feita) feitas++;
}

console.log("");
console.log(\`Progresso: \${feitas}/\${tarefas.length} concluidas\`);
`,
  },
  {
    id: 'tpl-conversor',
    name: 'Conversor de Unidades',
    description: 'Funcoes com parametros e retorno',
    icon: 'document',
    code: `// Conversor de Unidades

function celsiusParaFahrenheit(celsius: number): number {
  return celsius * 9 / 5 + 32;
}

function kmParaMilhas(km: number): number {
  return km * 0.621371;
}

function kgParaLibras(kg: number): number {
  return kg * 2.20462;
}

console.log("Temperatura:");
console.log(\`  25 C = \${celsiusParaFahrenheit(25).toFixed(1)} F\`);
console.log(\`  0 C  = \${celsiusParaFahrenheit(0).toFixed(1)} F\`);
console.log(\`  100 C = \${celsiusParaFahrenheit(100).toFixed(1)} F\`);

console.log("");
console.log("Distancia:");
console.log(\`  10 km = \${kmParaMilhas(10).toFixed(2)} milhas\`);
console.log(\`  42 km = \${kmParaMilhas(42).toFixed(2)} milhas\`);

console.log("");
console.log("Peso:");
console.log(\`  70 kg = \${kgParaLibras(70).toFixed(1)} libras\`);
`,
  },
];

interface PlaygroundState {
  snippets: PlaygroundSnippet[];
  saveSnippet: (name: string, code: string) => string;
  updateSnippetCode: (id: string, code: string) => void;
  renameSnippet: (id: string, name: string) => void;
  deleteSnippet: (id: string) => void;
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set, get) => ({
      snippets: [],

      saveSnippet: (name: string, code: string) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const snippet: PlaygroundSnippet = { id, name, code, createdAt: now, updatedAt: now };
        set({ snippets: [...get().snippets, snippet] });
        return id;
      },

      updateSnippetCode: (id: string, code: string) => {
        set({
          snippets: get().snippets.map((s) =>
            s.id === id ? { ...s, code, updatedAt: new Date().toISOString() } : s,
          ),
        });
      },

      renameSnippet: (id: string, name: string) => {
        set({
          snippets: get().snippets.map((s) =>
            s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s,
          ),
        });
      },

      deleteSnippet: (id: string) => {
        set({ snippets: get().snippets.filter((s) => s.id !== id) });
      },
    }),
    { name: 'codequest-playground' },
  ),
);
