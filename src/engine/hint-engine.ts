import type { CommonMistake } from '@/content/curriculum.types';

export function checkCommonMistakes(code: string, mistakes: CommonMistake[]): string | null {
  for (const mistake of mistakes) {
    if (code.includes(mistake.pattern)) {
      return mistake.message;
    }
  }
  return null;
}

const ERROR_PATTERNS: Array<[RegExp, string]> = [
  // TypeScript compile errors
  [/Cannot find name '(.+?)'/, "A variável '$1' não existe ainda. Verifique se você a criou!"],
  [/Type '(.+?)' is not assignable to type '(.+?)'/, "Tipo incorreto: você usou '$1' onde precisava de '$2'."],
  [/Property '(.+?)' does not exist on type '(.+?)'/, "A propriedade '$1' não existe em '$2'."],
  [/Object is possibly 'undefined'/, "Este valor pode não existir. Verifique antes de usar!"],
  [/Object is possibly 'null'/, "Este valor pode ser null. Verifique antes de usar!"],
  [/Expected (\d+) arguments, but got (\d+)/, "A função espera $1 argumento(s), mas recebeu $2."],
  [/Block-scoped variable '(.+?)' used before its declaration/, "Você está usando '$1' antes de criá-la!"],
  [/Cannot redeclare block-scoped variable '(.+?)'/, "A variável '$1' já foi criada. Não pode criar de novo com o mesmo nome."],
  [/Argument of type '(.+?)' is not assignable to parameter of type '(.+?)'/, "Você passou '$1' mas a função espera '$2'."],
  [/Variable '(.+?)' implicitly has an 'any' type/, "Adicione o tipo de '$1'. Ex: let $1: number"],
  [/';' expected/, "Parece que falta um ponto-e-vírgula ';' em algum lugar."],
  [/'}' expected/, "Parece que falta fechar uma chave '}'."],
  [/'\)' expected/, "Parece que falta fechar um parêntese ')'."],
  // Runtime errors
  [/(.+?) is not defined/, "'$1' não está definida. Verifique se você criou a variável/função."],
  [/(.+?) is not a function/, "'$1' não é uma função. Verifique como você a definiu."],
  [/Cannot read propert(?:y|ies) of undefined/, "Você tentou acessar uma propriedade de algo que não existe (undefined)."],
  [/Cannot read propert(?:y|ies) of null/, "Você tentou acessar uma propriedade de null."],
  [/Maximum call stack size exceeded/, "Estouro de pilha! Provavelmente uma recursão infinita."],
  [/Invalid left-hand side/, "Você não pode atribuir um valor aqui. Verifique o lado esquerdo do '='."],
  [/SyntaxError: Unexpected token '(.+?)'/, "Erro de sintaxe: '$1' inesperado. Verifique parênteses e chaves."],
  [/RangeError: (.+)/, "Erro de limite: $1"],
];

export function translateError(message: string): string {
  for (const [pattern, template] of ERROR_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      return template.replace(/\$(\d+)/g, (_, n: string) => match[parseInt(n)] ?? '');
    }
  }
  // If the message already starts with a Portuguese phrase, return as-is
  if (/^(Saída|Teste|Ops|Seu|Todos|Erro de|Estouro|A variável|A função|A propriedade|Tipo)/.test(message)) {
    return message;
  }
  return `Erro: ${message}`;
}

export function starsFromHints(hintsUsed: number): number {
  return Math.max(1, 5 - hintsUsed);
}
