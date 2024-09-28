// dataGenerator.test.js

const generateData = require('./dataGenerator');
const fs = require('fs');
const path = require('path');

// Читання схеми з файлу для тестів
const schemaPath = path.join(__dirname, 'schema.json');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
const schema = JSON.parse(schemaContent);

// Проста функція для перевірки умов
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// Модульні тести
function runTests() {
  console.log("Запуск тестів...");

  let data;
  try {
    data = generateData(schema);
  } catch (err) {
    console.error(`Помилка генерації даних: ${err.message}`);
    process.exit(1);
  }

  // Тест обов'язкових полів
  const requiredFields = ["id", "title", "description", "startDate", "endDate", "attendees"];
  requiredFields.forEach(field => {
    assert(field in data, `Відсутнє обов'язкове поле: ${field}`);
  });

  // Тест типу поля 'id'
  assert(
    typeof data.id === 'string' || typeof data.id === 'number',
    `Поле 'id' повинно бути string або integer, отримано ${typeof data.id}`
  );

  // Тест типів полів 'title' та 'description'
  assert(typeof data.title === 'string', `Поле 'title' повинно бути string`);
  assert(typeof data.description === 'string', `Поле 'description' повинно бути string`);

  // Тест типів полів 'startDate' та 'endDate'
  assert(Number.isInteger(data.startDate), `Поле 'startDate' повинно бути integer`);
  assert(Number.isInteger(data.endDate), `Поле 'endDate' повинно бути integer`);

  // Тест поля 'attendees'
  assert(Array.isArray(data.attendees), `Поле 'attendees' повинно бути масивом`);
  data.attendees.forEach((attendee, index) => {
    assert(typeof attendee === 'object', `Учасник за індексом ${index} повинен бути об'єктом`);
    assert('userId' in attendee, `Учасник за індексом ${index} відсутнє поле 'userId'`);
    assert('access' in attendee, `Учасник за індексом ${index} відсутнє поле 'access'`);
    assert(Number.isInteger(attendee.userId), `Учасник 'userId' повинен бути integer`);
    const accessOptions = ["view", "modify", "sign", "execute"];
    assert(accessOptions.includes(attendee.access), `Учасник 'access' має недійсне значення: ${attendee.access}`);
    if ('formAccess' in attendee) {
      const formAccessOptions = ["view", "execute", "execute_view"];
      assert(formAccessOptions.includes(attendee.formAccess), `Учасник 'formAccess' має недійсне значення: ${attendee.formAccess}`);
    }
  });

  // Тест необов'язкових полів, якщо вони присутні
  if ('parentId' in data) {
    const parentIdType = typeof data.parentId;
    assert(
      parentIdType === 'string' || parentIdType === 'number' || data.parentId === null,
      `Поле 'parentId' має недійсний тип: ${parentIdType}`
    );
  }

  if ('locationId' in data) {
    const locationIdType = typeof data.locationId;
    assert(
      locationIdType === 'number' || data.locationId === null,
      `Поле 'locationId' має недійсний тип: ${locationIdType}`
    );
  }

  if ('process' in data) {
    if (data.process !== null) {
      assert(typeof data.process === 'string', `Поле 'process' повинно бути string або null`);
      const pattern = /^https:\/\/[a-z]+\.corezoid\.com\/api\/1\/json\/public\/\d+\/[0-9a-zA-Z]+$/;
      assert(pattern.test(data.process), `Поле 'process' не відповідає необхідному шаблону`);
    }
  }

  if ('readOnly' in data) {
    assert(typeof data.readOnly === 'boolean', `Поле 'readOnly' повинно бути boolean`);
  }

  if ('priorProbability' in data) {
    if (data.priorProbability !== null) {
      assert(Number.isInteger(data.priorProbability), `Поле 'priorProbability' повинно бути integer або null`);
      assert(data.priorProbability >= 0 && data.priorProbability <= 100, `Поле 'priorProbability' повинно бути між 0 та 100`);
    }
  }

  if ('channelId' in data) {
    if (data.channelId !== null) {
      assert(Number.isInteger(data.channelId), `Поле 'channelId' повинно бути integer або null`);
    }
  }

  if ('externalId' in data) {
    if (data.externalId !== null) {
      assert(typeof data.externalId === 'string', `Поле 'externalId' повинно бути string або null`);
    }
  }

  if ('tags' in data) {
    assert(Array.isArray(data.tags), `Поле 'tags' повинно бути масивом`);
  }

  if ('form' in data) {
    assert(typeof data.form === 'object', `Поле 'form' повинно бути об'єктом`);
    assert('id' in data.form, `Поле 'form' відсутнє 'id'`);
    assert(Number.isInteger(data.form.id), `Поле 'form.id' повинно бути integer`);
    if ('viewModel' in data.form) {
      assert(typeof data.form.viewModel === 'object', `Поле 'form.viewModel' повинно бути об'єктом`);
    }
  }

  if ('formValue' in data) {
    assert(typeof data.formValue === 'object', `Поле 'formValue' повинно бути об'єктом`);
  }

  console.log("Усі тести пройдено успішно!");
}

// Запуск тестів
runTests();
