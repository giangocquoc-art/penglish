const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const normalizerPath = path.join(__dirname, '..', 'apps', 'web', 'src', 'lib', 'p-english', 'speechTextNormalizer.ts');
const source = fs.readFileSync(normalizerPath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: normalizerPath,
}).outputText;

const sandbox = { exports: {}, module: { exports: {} } };
sandbox.module.exports = sandbox.exports;
vm.runInNewContext(compiled, sandbox, { filename: normalizerPath });

const { normalizeSpeechTextForComparison, areSpeechTextsEquivalent } = sandbox.module.exports;

const equivalenceCases = [
  ['six', '6'],
  ['twenty one', '21'],
  ['Unit one', 'Unit 1'],
  ['I get up at six', 'I get up at 6'],
  ['Lesson twenty-one', 'lesson 21'],
  ['This is my first lesson', 'this is my 1 lesson'],
  ["I'm in unit two", "I'm in unit 2"],
  ["dont stop at thirty", "don't stop at 30"],
  ["I can't see forty five", "I cant see 45"],
  ['one hundred', '100'],
];

const normalizationCases = [
  ['What’s unit twenty two?', "what's unit 22"],
  ['I get-up at six.', 'i get up at 6'],
  ['Lesson 3rd', 'lesson 3'],
];

const failures = [];
for (const [left, right] of equivalenceCases) {
  if (!areSpeechTextsEquivalent(left, right)) {
    failures.push(`${left} should equal ${right}; got ${normalizeSpeechTextForComparison(left)} !== ${normalizeSpeechTextForComparison(right)}`);
  }
}

for (const [input, expected] of normalizationCases) {
  const actual = normalizeSpeechTextForComparison(input);
  if (actual !== expected) failures.push(`${input} normalized to ${actual}; expected ${expected}`);
}

if (failures.length) {
  console.error('[zoo-z4-9-normalizer-smoke-test] FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[zoo-z4-9-normalizer-smoke-test] PASS');
console.log(`Checked ${equivalenceCases.length + normalizationCases.length} normalization cases.`);
