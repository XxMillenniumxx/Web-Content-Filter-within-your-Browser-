"use strict";
/* jshint esversion: 6, strict: global, loopfunc: true, laxbreak: true */
/* globals chrome, getSettings */
// licensed under the MPL 2.0 by (github.com/serv-inc)

/**
 * @fileoverview looks through all received text to find words, adds up
 * score, shows blocking page
 */


class Settings {
  /** initializes from managed, local storage. on first load from preset.json */
  constructor() {
    let _self = this;
    this._settings = {};
    this._managed = [];
    this._initialized = false;
    this._loaded = false;
    this._saved = true;
    this._listeners = {};
    let storagePolyfill = ((chrome.storage && chrome.storage.managed)
                           || { get: (a, b) => b({}) });
    storagePolyfill.get(null, result => {
      if ( typeof(result) !== "undefined" ) {
        for (let el in result) {
          if ( result.hasOwnProperty(el) ) {
            this._managed.push(el);
            this._addToSettings(el, result[el]);
          }
        }
      }
      chrome.storage.local.get(null, result => {
        for (let el in result) {
          if ( el === "_initialized" ) {
            this._initialized = true;
            continue;
          }
          if ( result.hasOwnProperty(el) && ! this.isManaged(el) ) {
            this._addToSettings(el, result[el]);
          }
        }
        if ( ! this._initialized ) {
          this._loadFileSettings();
        } else {
          this.finish();
        }
      });
    });
    // if a managed option becomes unmanaged, use the managed setting as local
    chrome.storage.onChanged.addListener((changes, area) => {
      for (let el in changes) {
        if ( changes.hasOwnProperty(el) ) {
          if ( area === "managed" ) {
            if ( ! _self.isManaged(el) ) { // create
              _self._managed.push(el);
            } else { // update or delete
              if ( ! changes[el].hasOwnProperty('newValue') ) { // got deleted, use as local
                _self._managed.splice(_self._managed.indexOf(el));
              }
            }
          }
          _self._addToSettings(el, changes[el].newValue);
          if ( el in _self._listeners ) {
            _self._listeners[el].forEach(el => el(changes, area));
          }
        }
      }
    });
  }


  get whitelistRegExp() {
    return RegExp(this.whitelist);
  }


  _addToSettings(el, val) {
    this._settings[el] = val;
    this._addGetSet(el, !this.isManaged(el));
  }


  // could also trigger a save of that value via set
  _addGetSet(el, setter=false) {
    if ( setter ) {
      Object.defineProperty(this, el,
                            { get: () => { return this._settings[el]; },
                              set: (x) => {
                                this._settings[el] = x;
                                this._saved = false;
                              },
                              configurable: true });
    } else {
      Object.defineProperty(this, el,
                            { get: () => { return this._settings[el]; },
                              configurable: true });
    }
  }


  addOnChangedListener(val, listener) {
    if ( val in this._listeners ) {
      this._listeners[val].push(listener);
    } else {
      this._listeners[val] = [listener];
    }
  }


  finish() {
    this._loaded = true;
    this.save();
  }


  isManaged(el) {
    return this._managed.includes(el);
  }


  save() {
    let out = {"_initialized": true};
    for (let el in this._settings) {
      if ( ! this.isManaged(el) && typeof(el) !== "undefined") {
        out[el] = this._settings[el];
      }
    }
    chrome.storage.local.set(out);
    this._saved = true;
  }


  _loadFileSettings() {
	console.log("_loadFileSettings Запущен")
    fetch(chrome.runtime.getURL('preset.json'))
      .then((response) => {
        return response.json();
      })
      .then((parsed) => {
        for (let el in parsed) {
		  console.log(el)
          if (parsed.hasOwnProperty(el) && !this.isManaged(el)) {
            this._addToSettings(el, parsed[el]);
          }
        }
        this.finish();
      })
      .catch((error) => {
        console.error('Error loading preset.json:', error);
      });
  }
}

function getSettings() { return $set; }


let $set = new Settings();


async function getSettingsAsync() {
  return new Promise(async (resolve, reject) => {
    if ($set && $set._loaded) {
      resolve($set);
    } else {
      // Ожидаем загрузки данных до 10 секунд (или другой подходящей длительности)
      const timeout = 10000; // 10 секунд
      const startTime = Date.now();

      const waitForLoad = async () => {
        if ($set && $set._loaded) {
          resolve($set);
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for data to load'));
        } else {
          setTimeout(waitForLoad, 10); // Повторяем проверку каждые 100 миллисекунд
        }
      };

      waitForLoad();

      // Если $set не создан, создаем его и ждем загрузки
      if (!$set) {
        $set = new Settings();
        await $set.load(); // Дожидаемся загрузки
      }
    }
  });
}

export { Settings,  getSettingsAsync };

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  if (message === 'getSettings') {
    let responseSent = false; // Флаг, чтобы отслеживать отправку ответа

    try {
      const settings = await getSettingsAsync();
	  //console.log("Изначальный $set", JSON.stringify($set, null, 2)); //Выводит конструктор
      // Здесь вы можете подготовить данные для ответа
      if (!responseSent) {
        sendResponse(settings._settings);
        responseSent = true; // Устанавливаем флаг, что ответ был отправлен
      }
    } catch (error) {
      console.error('Ошибка при получении данных из фоновой страницы:', error);

      // Проверяем, был ли уже отправлен ответ
      if (!responseSent) {
        sendResponse({ error: 'Failed to get settings' });
        responseSent = true; // Устанавливаем флаг, что ответ был отправлен
      }
    }
  }
  return true;
});





/** (КЭШ) add URLS, and check whether added */
class BlockCache {
  constructor() {
    this._cache = [];
  }

  add(url) {
    if ( this.allow(url) ) {
      this._cache.push(url);
    }
  }

  allow(url) {
    return ! this._cache.includes(url);
  }
}



let blockCache = new BlockCache();


const URL_RE = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/;

const BLOCKPAGE_URL = 'blockpage.html';
const NO_SCAN = /extension:/;

function splitWordsSmart(inputString) {
    // Split words based on specific patterns:
    // 1. A lowercase letter followed by an uppercase letter (e.g., "wordAnotherWord")
    // 2. An uppercase letter followed by a lowercase letter (e.g., "Wordword")
    // Exclude sequences of uppercase letters (to preserve acronyms like JSON)
    var words = inputString.split(/(?<=[a-zа-я])(?=[A-ZА-Я])|(?<=[A-ZА-Я])(?=[A-ZА-Я][a-zа-я])/);
    // Filter out any empty words and trim spaces
    words = words.filter(function(word) {
        return word.trim() !== '';
    });
    return words.join(' ');
}

chrome.runtime.onMessage.addListener(async function (pageText, sender) {
  console.log(getSettings())
  if (!getSettings().whitelistRegExp.test(sender.url) && !NO_SCAN.test(sender.url)) {
	console.log("pageText",pageText)
	scan(pageText, sender)
	console.log("кол-во символов", pageText.replace(/\s/g, '').length)
    if (pageText.replace(/\s/g, '').length > 99) {
		console.log("splitWordsSmart", splitWordsSmart(pageText))
		chrome.i18n.detectLanguage(splitWordsSmart(pageText), (result) => {
			const detectedLanguage = result.languages[0].language;
			const confidencePercentage = result.languages[0].percentage;
			console.log("chrome.i18n.detectLanguage",detectedLanguage,confidencePercentage);
			if (detectedLanguage === 'ru' || detectedLanguage === 'en') {
				console.log("ru or en")
			} else if (confidencePercentage <= 51) {
				console.log("undefined language")
			} else {
				console.log("Blocked for non-Russian and non-English language:", sender.url);
				setBlockPage(sender, ['non-Russian and non-English language site']);
			}
		});
	} else {
		console.log("undefined language");
		}
  } else {
    console.log("Whitelisted or extension URL, skipping scan for:", sender.url);
	console.log(!getSettings().whitelistRegExp.test(sender.url), !NO_SCAN.test(sender.url))
  }
});

// Функция setBlockPage с передачей сообщения после загрузки страницы
function setBlockPage(sender, phraseArray = [''], limit = "???") {
  if (NO_SCAN.test(sender.url)) {
    return;
  }

  if (blockCache.allow(sender.url)) {
    blockCache.add(sender.url);
  }

  var blockpage = chrome.runtime.getURL(BLOCKPAGE_URL);
  chrome.tabs.update(sender.tab.id, { 'url': blockpage }, () => {
    // Событие "load" срабатывает после полной загрузки страницы
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === sender.tab.id && changeInfo.status === "complete") {
		console.log("Данные отправлены на blockPage")
        // Отправляем сообщение на страницу блокировки после загрузки
        const message = { type: 'get-phraseArray-limit', data: { phraseArray, limit } };
        chrome.tabs.sendMessage(sender.tab.id, message);

        // Удаляем обработчик события после его выполнения, чтобы избежать повторных вызовов
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });
}






function isValid(urlString) {
  return typeof urlString === "string" && URL_RE.test(urlString);
}



async function scan(pageText, sender) {
  const blockvals = getSettings().blockvals;
  const limit = getSettings().limit;
  const matches = [];
  let score = 0; // Инициализируем счет

  console.log("scan запущен");

  for (const blockval of blockvals) {
    const singlescore = await _do_score(pageText, blockval, matches);
    score += singlescore; // Увеличиваем счет

    // Проверяем, превысил ли счет лимит
    if (score > limit) {
      setBlockPage(sender, matches, `>= ${score}`);
      console.log("Счет превысил лимит, сайт будет заблокирован");
      // Выводим счет и совпадения
      console.log("Site score:", score);
      console.log("Site matches:", matches);
      return; // Прерываем сканирование
    }
  }

  // Если сканирование завершилось без превышения лимита, сайт не блокируется
  console.log("Сканирование завершено, сайт не заблокирован");
}


async function _do_score(pageText, blockObject, all_matches) {
  const tmp = pageText.match(RegExp(blockObject.value, "gi"));
  const matches = new Set();
  if (tmp !== null) {
    tmp.forEach((el) => { matches.add(el.toLowerCase()); });
  }
  matches.forEach((el) => all_matches.push(el));
  return matches.size * blockObject.name;
}
