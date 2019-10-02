const fs = require('fs');

const byDate = fs
  .readFileSync('test.in', 'utf-8')
  .split(/\n/)
  .map(x => x.split(/\s+/))
  .map(x => (x[4] = (-parseFloat(x[4], 10)).toFixed(2), x))
  .sort(([dx, tx], [dy, ty]) => dx == dy ? tx.localeCompare(ty) : dx.localeCompare(dy))
  .reduce((m, [d, ...r]) => (m.has(d) ? m.get(d).push(r) : m.set(d, [r]), m), new Map());

let lastTime = null;
for (const [d, records] of byDate) {
  console.log(`; 校园卡流水 ${d}\n`)
  const breakfast = [];
  const lunch = [];
  const dinner = [];
  const groceries = [];
  const autobus = [];
  const others = [];
  for (const x of records) {
    const [time, narration, pos, money, type, balance] = x;
    const seconds = time.split(':').map(x => parseInt(x, 10)).reduce((s, v) => s * 60 + v, 0);
    if (/^青岛第.食堂/.test(narration)) {
      if (narration.endsWith('超市')) {
        groceries.push(x);
      } else if (seconds < 10 * 60 * 60) { // 6:00 - 9:00 -> breakfast
        breakfast.push(x);
      } else if (11 * 3600 <= seconds && seconds <= 14 * 3600) { // 10:00 - 14:00 -> lunch
        lunch.push(x);
      } else if (16 * 3600 + 30 * 60 <= seconds && seconds <= 20 * 3600) { // 16:30 - 20:00 -> dinner
        dinner.push(x);
      } else {
        others.push(x);
      }
    } else if (narration === '交通运输中心') {
      autobus.push(x);
    } else {
      others.push(x);
    }
  }
  if (breakfast.length > 0) {
    console.log(`${d} * "山东大学" "早饭"\n${breakfast.map(x => `  Assets:CN:SDU:Card -${x[3]} CNY\n  Expenses:Food:Breakfast ${x[3]} CNY`).join('\n')}\n`);
  }
  if (lunch.length > 0) {
    console.log(`${d} * "山东大学" "午饭"\n${lunch.map(x => `  Assets:CN:SDU:Card -${x[3]} CNY\n  Expenses:Food:Lunch ${x[3]} CNY`).join('\n')}\n`);
  }
  if (dinner.length > 0) {
    console.log(`${d} * "山东大学" "晚饭"\n${dinner.map(x => `  Assets:CN:SDU:Card -${x[3]} CNY\n  Expenses:Food:Dinner ${x[3]} CNY`).join('\n')}\n`);
  }
  groceries.forEach(x => console.log(`${d} * "山东大学" "杂货"\n  Assets:CN:SDU:Card -${x[3]} CNY\n  Expenses:Grocery ${x[3]} CNY\n`));
  autobus.forEach(x => console.log(`${d} * "山东大学" "校车"\n  Assets:CN:SDU:Card -${x[3]} CNY\n  Expenses:Transportation:Bus ${x[3]} CNY\n`));
  others.forEach(x => console.log(`${d} * "山东大学" "其他"\n  Assets:CN:SDU:Card -${x[3]} CNY\n  Expenses:Uncategorized ${x[3]} CNY\n`));
  
}