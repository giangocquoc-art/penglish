const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'apps', 'web', 'src', 'data', 'shadowing', 'generatedShadowingCatalog.ts');
let text = fs.readFileSync(file, 'utf8');

const videos = {
  'shadow-a1-greeting-friend': ['Greeting People in English - Beginner Conversation', 'https://www.youtube.com/watch?v=0H7C1dK0l3Q'],
  'shadow-a1-order-water-coffee': ['Ordering Drinks in English - Cafe Conversation', 'https://www.youtube.com/watch?v=bgfdqVmVjfk'],
  'shadow-a1-school-talk': ['School Conversation for Beginners', 'https://www.youtube.com/watch?v=AS5nhKzaOqo'],
  'shadow-a1-daily-routine': ['Daily Routine in English', 'https://www.youtube.com/watch?v=qD1pnquN_DM'],
  'shadow-a2-asking-directions': ['Asking for Directions in English', 'https://www.youtube.com/watch?v=DPYJQSA-x50'],
  'shadow-a2-shopping-conversation': ['Shopping Conversation in English', 'https://www.youtube.com/watch?v=Qp3VhdWJ40Y'],
  'shadow-a2-simple-travel-plan': ['Travel English Conversation Practice', 'https://www.youtube.com/watch?v=R0r51JQXcO8'],
  'shadow-a2-describing-hobbies': ['Talking About Hobbies in English', 'https://www.youtube.com/watch?v=tgVtVoxzwDI'],
  'shadow-b1-study-habit': ['How to Talk About Study Habits in English', 'https://www.youtube.com/watch?v=3i1lNJPY-4Q'],
  'shadow-b1-part-time-interview': ['Job Interview English Practice', 'https://www.youtube.com/watch?v=HG68Ymazo18'],
  'shadow-b1-teamwork-discussion': ['Teamwork Discussion English Phrases', 'https://www.youtube.com/watch?v=J9wMBy_9nWc'],
  'shadow-b2-learning-strategy': ['Learning Strategies in English', 'https://www.youtube.com/watch?v=9nL1i4QBrxM'],
  'shadow-b2-digital-habits-opinion': ['Talking About Digital Habits in English', 'https://www.youtube.com/watch?v=kzWg2Qd1X1I'],
  'shadow-b2-career-goals': ['Career Goals English Conversation', 'https://www.youtube.com/watch?v=YjT4gSxTEGk'],
};

for (const [id, [title, url]] of Object.entries(videos)) {
  const marker = `makeItem({ id: '${id}',`;
  const index = text.indexOf(marker);
  if (index === -1) throw new Error(`Missing ${id}`);
  const lineEnd = text.indexOf(' lines: [', index);
  if (lineEnd === -1) throw new Error(`Missing lines marker for ${id}`);
  const before = text.slice(index, lineEnd);
  if (before.includes('referenceVideoUrl:')) continue;
  const insert = ` referenceVideoTitle: '${title}', referenceVideoUrl: '${url}',`;
  text = text.slice(0, lineEnd) + insert + text.slice(lineEnd);
}

fs.writeFileSync(file, text, 'utf8');
console.log(`Added curated reference video URLs to ${Object.keys(videos).length} Shadowing catalog items.`);
