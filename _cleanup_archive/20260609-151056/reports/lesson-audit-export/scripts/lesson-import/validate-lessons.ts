import { schemaSmokeFixture } from '../../apps/web/src/data/lessons/fixtures/schemaSmokeFixture';
import {
  formatLessonValidationIssues,
  validateLessons,
} from '../../apps/web/src/data/lessons/validateLessons';

const result = validateLessons(schemaSmokeFixture);

if (!result.success) {
  console.error('P-English lesson validation failed.');
  console.error(formatLessonValidationIssues(result.issues));
  process.exit(1);
}

console.log(`P-English lesson validation passed for ${result.lessons.length} fixture lesson(s).`);
