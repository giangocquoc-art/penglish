import assert from 'node:assert/strict';
import { isNearCorrectSpeechAnswer } from '../apps/web/src/features/foundation48/foundation48SpeechMatcher';

assert.equal(
  isNearCorrectSpeechAnswer('I am a student and I study English every morning', 'I am student and I study English every morning'),
  true,
  'Dropping an article may pass when the rest of the spoken answer matches.',
);
assert.equal(
  isNearCorrectSpeechAnswer('I am a student and I study English every morning', 'I am a person and I study English every morning'),
  false,
  'Replacing a content word must not be scored as a correct spoken answer.',
);
assert.equal(
  isNearCorrectSpeechAnswer('I do not like cold coffee in the morning', 'I do like cold coffee in the morning'),
  false,
  'Changing the meaning by dropping negation must not pass.',
);
assert.equal(
  isNearCorrectSpeechAnswer('You can use the blue card to open the classroom door', 'You use the blue card to open the classroom door'),
  false,
  'Dropping a modal verb must not pass.',
);
assert.equal(
  isNearCorrectSpeechAnswer('You can open the blue door', 'You open can the blue door'),
  false,
  'Reordering target words must not pass as a correct spoken answer.',
);
assert.equal(
  isNearCorrectSpeechAnswer('They don’t live here.', 'They do not live here.'),
  true,
  'A recognized expanded negative must match the equivalent contracted model.',
);
assert.equal(
  isNearCorrectSpeechAnswer('They do not live here.', "They don't live here."),
  true,
  'A recognized contraction must match the equivalent expanded negative model.',
);
assert.equal(
  isNearCorrectSpeechAnswer('She cannot swim.', "She can't swim."),
  true,
  'Cannot and can’t must normalize to the same negative form.',
);
assert.equal(
  isNearCorrectSpeechAnswer('They don’t live here.', 'They do live here.'),
  false,
  'Contraction normalization must continue to reject a changed negative meaning.',
);
assert.equal(isNearCorrectSpeechAnswer('A short target', ''), false, 'An empty transcript must not pass.');

console.log('Foundation48 speech matcher passed (contraction equivalence, article tolerance, content words, word order, negation, modal verbs, empty transcripts).');
