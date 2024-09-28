// generate.js

const fs = require('fs');
const path = require('path');
const generateData = require('./dataGenerator');

/**
 * Виводить інструкцію використання скрипта.
 */
function printUsage() {
  console.log("Використання: node generate.js <шлях_до_схеми.json>");
}

/**
 * Головна функція скрипта.
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    printUsage();
    process.exit(1);
  }

  const schemaPath = args[0];

  // Перевірка існування файлу
  if (!fs.existsSync(schemaPath)) {
    console.error(`Файл не знайдено: ${schemaPath}`);
    process.exit(1);
  }

  // Зчитування файлу
  let schemaContent;
  try {
    schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  } catch (err) {
    console.error(`Помилка зчитування файлу: ${err.message}`);
    process.exit(1);
  }

  // Парсинг JSON
  let schema;
  try {
    schema = JSON.parse(schemaContent);
  } catch (err) {
    console.error(`Помилка парсингу JSON: ${err.message}`);
    process.exit(1);
  }

  // Генерація даних
  let data;
  try {
    data = generateData(schema);
  } catch (err) {
    console.error(`Помилка генерації даних: ${err.message}`);
    process.exit(1);
  }

  // Виведення результату
  console.log(JSON.stringify(data, null, 2));
}

// Запуск головної функції
if (require.main === module) {
  main();
}
