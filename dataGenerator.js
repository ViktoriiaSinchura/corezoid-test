// dataGenerator.js

/**
 * Генерує випадковий обʼєкт даних на основі наданої JSON-схеми.
 * @param {Object} schema - JSON-схема для генерації даних.
 * @returns {Object} - Згенерований обʼєкт даних.
 */
function generateData(schema) {
    /**
     * Розв'язує $ref у схемі.
     * @param {string} ref - $ref рядок.
     * @returns {Object} - Розв'язана схема.
     */
    function resolveRef(ref) {
      if (ref.startsWith("#/")) {
        const parts = ref.slice(2).split('/');
        let current = schema;
        for (let part of parts) {
          if (current[part] === undefined) {
            throw new Error(`Не вдалося розв'язати посилання: ${ref}`);
          }
          current = current[part];
        }
        return current;
      } else {
        throw new Error(`Підтримуються лише внутрішні $ref, починаючи з "#/". Отримано: ${ref}`);
      }
    }
  
    /**
     * Генерує випадкове ціле число між min та max (включно).
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    function getRandomInt(min = 0, max = 1000) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    /**
     * Генерує випадковий рядок заданої довжини.
     * @param {number} length 
     * @returns {string}
     */
    function getRandomString(length = 10) {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for(let i = 0; i < length; i++) {
        result += chars.charAt(getRandomInt(0, chars.length - 1));
      }
      return result;
    }
  
    /**
     * Генерує рядок, що відповідає певному шаблону.
     * Проста реалізація, специфічна для наданого шаблону.
     * @param {string} pattern 
     * @returns {string}
     */
    function generateStringFromPattern(pattern) {
      // Для конкретного шаблону в схемі, генеруємо фіксований формат
      // "https://{subdomain}.corezoid.com/api/1/json/public/{digits}/{alphanum}"
      const subdomains = ['api', 'service', 'data', 'auth'];
      const subdomain = subdomains[getRandomInt(0, subdomains.length - 1)];
      const digits = getRandomInt(1000, 9999);
      const alphanum = getRandomString(8);
      return `https://${subdomain}.corezoid.com/api/1/json/public/${digits}/${alphanum}`;
    }
  
    /**
     * Генерує випадкове булеве значення.
     * @returns {boolean}
     */
    function getRandomBoolean() {
      return Math.random() < 0.5;
    }
  
    /**
     * Генерує випадкове значення на основі схеми.
     * @param {Object} currentSchema 
     * @returns {*} - Згенероване значення.
     */
    function generateValue(currentSchema) {
      if (!currentSchema) {
        throw new Error("Схема для генерації значення є undefined");
      }
  
      if ('$ref' in currentSchema) {
        const refSchema = resolveRef(currentSchema['$ref']);
        return generateValue(refSchema);
      }
  
      if ('anyOf' in currentSchema) {
        const options = currentSchema['anyOf'];
        if (!Array.isArray(options) || options.length === 0) {
          throw new Error("'anyOf' має бути непорожнім масивом");
        }
        const chosenSchema = options[getRandomInt(0, options.length - 1)];
        return generateValue(chosenSchema);
      }
  
      if ('enum' in currentSchema) {
        const enumValues = currentSchema['enum'];
        if (!Array.isArray(enumValues) || enumValues.length === 0) {
          throw new Error("'enum' має бути непорожнім масивом");
        }
        return enumValues[getRandomInt(0, enumValues.length - 1)];
      }
  
      switch (currentSchema.type) {
        case 'string':
          if ('pattern' in currentSchema) {
            return generateStringFromPattern(currentSchema.pattern);
          }
          return getRandomString(getRandomInt(5, 15));
        case 'integer':
          const min = currentSchema.minimum !== undefined ? currentSchema.minimum : 0;
          const max = currentSchema.maximum !== undefined ? currentSchema.maximum : min + 1000;
          return getRandomInt(min, max);
        case 'boolean':
          return getRandomBoolean();
        case 'null':
          return null;
        case 'array':
          const length = getRandomInt(0, 5);
          const itemsSchema = currentSchema.items;
          if (!itemsSchema) {
            throw new Error("Схема для 'items' відсутня в масиві");
          }
          const arr = [];
          for(let i = 0; i < length; i++) {
            arr.push(generateValue(itemsSchema));
          }
          return arr;
        case 'object':
          const obj = {};
          const props = currentSchema.properties || {};
          const required = currentSchema.required || [];
          for (let key in props) {
            if (required.includes(key) || getRandomBoolean()) {
              obj[key] = generateValue(props[key]);
            }
          }
          return obj;
        default:
          return null;
      }
    }
  
    return generateValue(schema);
  }
  
  // Експорт функції для тестування
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = generateData;
  }
  