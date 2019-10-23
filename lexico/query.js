const fs = require('fs');
const jsdom = require('jsdom');
const axios = require('axios').default;
const { inspect } = require('util');


const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15';

function innerHtmlOrNull(el) {
  return el === null ? null : el.innerHTML.trim();
}

async function fetch(word) {
  const url = `https://www.lexico.com/en/definition/${word}`;
  const response = await axios.get(url, { headers: { 'User-Agent': userAgent } });

  const dom = new jsdom.JSDOM(response.data, {
    contentType: 'text/html',
    pretendToBeVisual: true,
    resources: 'usable',
    url,
    userAgent,
  });
  
  const window = dom.window;
  const document = window.document;
  
  const result = [...document.querySelectorAll('.entryWrapper > section.gramb')].map(block => {
    const partOfSpeech = block.firstChild.firstChild.innerHTML;

    const meanings = [...block.querySelectorAll('ul.semb > li > div.trg')].map(item => {
      const subMeanings = [...item.querySelectorAll('ol.subSenses > li.subSense')].map(sub => {
        let registerNode = sub.querySelector('span.sense-registers');
        return {
          register: registerNode ? registerNode.innerHTML.trim() : null,
          meaning: sub.querySelector('span.ind').innerHTML.trim(),
        }
      });
      return {
        meaning: item.querySelector('span.ind').innerHTML.trim(),
        note: innerHtmlOrNull(item.querySelector('span.grammatical_note')),
        subMeanings,
      };
    });

    return {
      partOfSpeech,
      register: innerHtmlOrNull(block.querySelector('span.sense-registers')),
      meanings
    };
  });

  const lines = [];
  if (result.length === 1) {
    const explanation = result[0];
    const register = explanation.register === null ? '' : ` *${explanation.register}*`
    lines.push(`* ${word} **${explanation.partOfSpeech}**${register}`);
    explanation.meanings.forEach((meaning, i) => {
      const note = meaning.note === null ? '' : `*[${meaning.note}]* `;
      lines.push(`  ${i + 1}. ${note}${meaning.meaning}`);
      meaning.subMeanings.forEach((sub, j) => {
        const register = sub.register === null ? '' : `*${sub.register}* `
        lines.push(`    ${j + 1}. ${register}${sub.meaning}`);
      });
    });
  } else {
    lines.push(`* ${word}`);
    result.forEach(explanation => {
      const register = explanation.register === null ? '' : ` *${explanation.register}*`
      lines.push(`  * **${explanation.partOfSpeech}**${register}`);
      explanation.meanings.forEach((meaning, i) => {
        const note = meaning.note === null ? '' : `*[${meaning.note}]* `;
        lines.push(`    ${i + 1}. ${note}${meaning.meaning}`);
        meaning.subMeanings.forEach((sub, j) => {
          const register = sub.register === null ? '' : `*${sub.register}* `
          lines.push(`      ${j + 1}. ${register}${sub.meaning}`);
        });
      });
    });
  }
  console.log(lines.join('\n'));
}

async function sleep() {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 3000);
  });
}

async function main() {
  const failedWords = [];
  const words = fs.readFileSync('words.txt', 'utf-8').split('\n');
  for (const word of words) {
    try {
      await fetch(word);
    } catch (e) {
      console.log(e);
      failedWords.push(word);
    }
    await sleep();
  }
  console.log('These words failed:');
  failedWords.forEach(x => console.log(`  * ${x}`));
}

main();