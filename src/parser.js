import Parser from 'math-expression-evaluator';

export default function parse(input) {
  try {
    return Parser.lex(input).toPostfix().postfixEval()
  } catch (error) {
    return null;
  }
}
