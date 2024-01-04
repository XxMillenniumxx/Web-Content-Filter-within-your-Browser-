"use strict";
/* jshint esversion: 6, strict: global */
/* globals chrome */
// licensed under the MPL 2.0 by (github.com/serv-inc)
import { Settings, getSettingsAsync } from './background.js';
let initError = false;



//function saveOptions(e) {
//  e.preventDefault();
//  if (initError) {
//    console.error("did not save erroneous options");
//    return;
//  }
//
//  chrome.runtime.sendMessage('getSettings', (response) => {
//    if (response) {
//      let settingsData = response;
//	  console.log('Приняты данные настроек: ', settingsData);
//	  const $set = new Settings();
//	  for (let key in settingsData) {
//        if (settingsData.hasOwnProperty(key)) {
//          $set._settings[key] = settingsData[key];
//          $set._addGetSet(key, !$set.isManaged(key));
//        }
//      }
//      console.log("Извлечённые данные из фоновой страницы saveOptions:", $set);
//
//      if (!$set.isManaged("limit")) {
//        $set.limit = getSmart(document.querySelector("#limit"));
//      }
//      if (!$set.isManaged("whitelist")) {
//        $set.whitelist = getSmart(document.querySelector("#whitelist"));
//      }
//      if (!$set.isManaged("blockpage")) {
//        $set.blockpage = getSmart(document.querySelector("#blockpage"));
//      }
//      if (!$set.isManaged("blockvals")) {
//        let blockvals = [];
//        [2,3,5,10,20,25,30,40,50,60,70,80,90,100,120,130,150].forEach(function(id){
//          blockvals.push({
//            name: id,
//            value: document.querySelector("#p" + id).value
//          });
//        });
//        $set.blockvals = blockvals;
//      }
//
//      $set.save();
//      window.close();
//    } else {
//      console.log("Не удалось получить данные из фоновой страницы");
//    }
//	return true
//  });
//}

//async function saveOptions(e) {
//  e.preventDefault();
//  if (initError) {
//    console.error("did not save erroneous options");
//    return;
//  }
//
//  try {
//    const response = await new Promise((resolve, reject) => {
//      chrome.runtime.sendMessage('getSettings', (response) => {
//        if (chrome.runtime.lastError) {
//          reject(chrome.runtime.lastError);
//        } else {
//          resolve(response);
//        }
//      });
//    });
//
//    if (response) {
//      const settingsData = response;
//      console.log('Приняты данные настроек: ', settingsData);
//      const $set = new Settings();
//
//      for (const key in settingsData) {
//        if (settingsData.hasOwnProperty(key)) {
//          $set._settings[key] = settingsData[key];
//          $set._addGetSet(key, !$set.isManaged(key));
//        }
//      }
//
//      console.log("Извлечённые данные из фоновой страницы saveOptions:", $set);
//
//      if (!$set.isManaged("limit")) {
//        $set.limit = getSmart(document.querySelector("#limit"));
//      }
//      if (!$set.isManaged("whitelist")) {
//        $set.whitelist = getSmart(document.querySelector("#whitelist"));
//      }
//      if (!$set.isManaged("blockpage")) {
//        $set.blockpage = getSmart(document.querySelector("#blockpage"));
//      }
//      if (!$set.isManaged("blockvals")) {
//        let blockvals = [];
//        [2,3,5,10,20,25,30,40,50,60,70,80,90,100,120,130,150].forEach(function(id){
//          blockvals.push({
//            name: id,
//            value: document.querySelector("#p" + id).value
//          });
//        });
//        $set.blockvals = blockvals;
//      }
//
//      $set.save();
//      window.close();
//    } else {
//      console.log("Не удалось получить данные из фоновой страницы");
//    }
//  } catch (error) {
//    console.error('Ошибка при получении данных из фоновой страницы:', error);
//  }
//}


async function saveOptions(e) {
  e.preventDefault();
  if (initError) {
    console.error("did not save erroneous options");
    return;
  }

  try {
    // Дождитесь, пока объект $set будет доступен
    const $set = await getSettingsAsync();

    if ($set) {
      console.log('Приняты данные настроек: ', $set._settings);

      if (!$set.isManaged("limit")) {
        $set.limit = getSmart(document.querySelector("#limit"));
      }
      if (!$set.isManaged("whitelist")) {
        $set.whitelist = getSmart(document.querySelector("#whitelist"));
      }
      if (!$set.isManaged("blockpage")) {
        $set.blockpage = getSmart(document.querySelector("#blockpage"));
      }
      if (!$set.isManaged("blockvals")) {
        let blockvals = [];
        [2,3,5,10,20,25,30,40,50,60,70,80,90,100,120,130,150].forEach(function(id){
          blockvals.push({
            name: id,
            value: document.querySelector("#p" + id).value
          });
        });
        $set.blockvals = blockvals;
      }

      $set.save();
      window.close();
    } else {
      console.log("Не удалось получить данные из фоновой страницы");
    }
  } catch (error) {
    console.error('Ошибка при получении данных из фоновой страницы:', error);
  }
}



//function restoreOptions() {
//  if (!chrome) {
//    console.error("error on option initialization");
//    initError = true;
//    return;
//  }
//  initError = false;
//  console.log("restoreOptions начало")
//  chrome.runtime.sendMessage('getSettings', (response) => {
//    let settingsData = response;
//	console.log('Приняты данные настроек: ', settingsData);
//	const $set = new Settings();
//	
//	for (let key in settingsData) {
//      if (settingsData.hasOwnProperty(key)) {
//        $set._settings[key] = settingsData[key];
//        $set._addGetSet(key, !$set.isManaged(key));
//      }
//    }
//
//    console.log("Извлечённые данные из фоновой страницы:", $set);
//    document.querySelector("#limit").value = $set.limit;
//    _disableIfManaged($set, "limit");
//    document.querySelector("#whitelist").value = $set.whitelist;
//    _disableIfManaged($set, "whitelist");
//    document.querySelector("#blockpage").value = $set.blockpage;
//    _disableIfManaged($set, "blockpage");
//    $set.blockvals.forEach(function(el) {
//      document.querySelector("#p" + el.name).value = el.value;
//      _disableIfManaged($set, "blockvals", "p" + el.name);
//    });
//
//    // Перемещаем код, зависящий от данных, внутрь колбэка
//    console.log("restoreOptions конец")
//	return true
//  });
//}

//async function restoreOptions() {
//  try {
//    if (!chrome) {
//      console.error("error on option initialization");
//      initError = true;
//      return;
//    }
//
//    initError = false;
//    console.log("restoreOptions начало");
//
//    const response = await new Promise((resolve, reject) => {
//      chrome.runtime.sendMessage('getSettings', async (response) => {
//        if (chrome.runtime.lastError) {
//          reject(chrome.runtime.lastError);
//        } else {
//          resolve(response);
//        }
//      });
//    });
//
//    if (response) {
//      const settingsData = response;
//      console.log('Приняты данные настроек: ', settingsData);
//      const $set = new Settings();
//
//      for (const key in settingsData) {
//        if (settingsData.hasOwnProperty(key)) {
//          $set._settings[key] = settingsData[key];
//          $set._addGetSet(key, !$set.isManaged(key));
//        }
//      }
//
//      console.log("Извлечённые данные из фоновой страницы:", $set);
//      document.querySelector("#limit").value = $set.limit;
//      _disableIfManaged($set, "limit");
//      document.querySelector("#whitelist").value = $set.whitelist;
//      _disableIfManaged($set, "whitelist");
//      document.querySelector("#blockpage").value = $set.blockpage;
//      _disableIfManaged($set, "blockpage");
//      $set.blockvals.forEach(function (el) {
//        document.querySelector("#p" + el.name).value = el.value;
//        _disableIfManaged($set, "blockvals", "p" + el.name);
//      });
//
//      // Перемещаем код, зависящий от данных, внутрь колбэка
//      console.log("restoreOptions конец");
//    }
//  } catch (error) {
//    console.error('Ошибка при получении данных из фоновой страницы:', error);
//  }
//}
async function restoreOptions() {
  try {
    if (!chrome) {
      console.error("error on option initialization");
      initError = true;
      return;
    }

    initError = false;
    console.log("restoreOptions начало");

    // Дождитесь, пока объект $set будет доступен
    const $set = await getSettingsAsync();

    if ($set) {
      console.log('Приняты данные настроек: ', $set._settings);

      document.querySelector("#limit").value = $set.limit;
      _disableIfManaged($set, "limit");
      document.querySelector("#whitelist").value = $set.whitelist;
      _disableIfManaged($set, "whitelist");
      document.querySelector("#blockpage").value = $set.blockpage;
      _disableIfManaged($set, "blockpage");
      $set.blockvals.forEach(function (el) {
        document.querySelector("#p" + el.name).value = el.value;
        _disableIfManaged($set, "blockvals", "p" + el.name);
      });

      // Перемещаем код, зависящий от данных, внутрь колбэка
      console.log("restoreOptions конец");
    }
  } catch (error) {
    console.error('Ошибка при получении данных из фоновой страницы:', error);
  }
}




// can break if sth defined "undefined"
function getSmart(domElement) {
  if ( domElement.value !== "" ) {
    return domElement.value;
  } else {
    return undefined;
  }
}

/** sets element to readonly if in managedStorage */
function _disableIfManaged($set, element, place=null) {
  place = place || element;
  console.log("Код проходит до сюда",element)
  if ( $set.isManaged(element) ) {
	
	console.log($set.isManaged(element))
    document.querySelector("#" + place).disabled = true; // readOnly
  }
}

//function exportOptions() {
//  chrome.runtime.sendMessage('getSettings', (response) => {
//    if (response) {
//      let settingsData = response;
//	  console.log('Приняты данные настроек: ', settingsData);
//	  const $set = new Settings();
//	  for (let key in settingsData) {
//        if (settingsData.hasOwnProperty(key)) {
//          $set._settings[key] = settingsData[key];
//          $set._addGetSet(key, !$set.isManaged(key));
//        }
//      }
//      console.log("Извлечённые данные из фоновой страницы saveOptions:", $set);
//	  let jsonString = JSON.stringify($set, null, 2);
//
//      let blob = new Blob([jsonString], { type: "application/json" });
//      let url = URL.createObjectURL(blob);
//      let a = document.createElement("a");
//      a.href = url;
//      a.download = "settings.json";
//      document.body.appendChild(a);
//      a.click();
//      document.body.removeChild(a);
//      URL.revokeObjectURL(url);
//	}
//  });
//}

//async function exportOptions() {
//  try {
//    const response = await new Promise((resolve, reject) => {
//      chrome.runtime.sendMessage('getSettings', (response) => {
//        if (chrome.runtime.lastError) {
//          reject(chrome.runtime.lastError);
//        } else {
//          resolve(response);
//        }
//      });
//    });
//
//    if (response) {
//      const settingsData = response;
//      console.log('Приняты данные настроек: ', settingsData);
//      const $set = new Settings();
//
//      for (const key in settingsData) {
//        if (settingsData.hasOwnProperty(key)) {
//          $set._settings[key] = settingsData[key];
//          $set._addGetSet(key, !$set.isManaged(key));
//        }
//      }
//
//      console.log("Извлечённые данные из фоновой страницы exportOptions:", $set);
//
//      const jsonString = JSON.stringify($set, null, 2);
//
//      const blob = new Blob([jsonString], { type: "application/json" });
//      const url = URL.createObjectURL(blob);
//      const a = document.createElement("a");
//      a.href = url;
//      a.download = "settings.json";
//      document.body.appendChild(a);
//      a.click();
//      document.body.removeChild(a);
//      URL.revokeObjectURL(url);
//    }
//  } catch (error) {
//    console.error('Ошибка при получении данных из фоновой страницы:', error);
//  }
//}

async function exportOptions() {
  try {
    // Дождитесь, пока объект $set будет доступен
    const $set = await getSettingsAsync();

    if ($set) {
      console.log('Приняты данные настроек: ', $set._settings);

      const jsonString = JSON.stringify($set, null, 2);

      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "settings.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Ошибка при получении данных из фоновой страницы:', error);
  }
}




function handleFileSelect(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedSettings = JSON.parse(e.target.result);
        console.log('Imported Settings:', importedSettings);
        applyImportedSettings(importedSettings);
        alert('Settings imported successfully!');
        // После успешного импорта, можно закрыть окно настроек
        //setTimeout(() => {
        //  window.close();
        //}, 200); // 2000 миллисекунд (2 секунды)
      } catch (error) {
        console.error('Error importing settings:', error);
        alert('Error importing settings. Please make sure the file is a valid JSON.');
      }
    };
    reader.readAsText(file);
  }
}


//async function applyImportedSettings(importedSettings) {
//  try {
//    const response = await new Promise((resolve, reject) => {
//      chrome.runtime.sendMessage('getSettings', (response) => {
//        if (chrome.runtime.lastError) {
//          reject(chrome.runtime.lastError);
//        } else {
//          resolve(response);
//        }
//      });
//    });
//
//    if (response) {
//      let settingsData = response;
//      console.log('Приняты данные настроек: ', settingsData);
//      const $set = new Settings();
//
//      for (let key in settingsData) {
//        if (settingsData.hasOwnProperty(key)) {
//          $set._settings[key] = settingsData[key];
//          $set._addGetSet(key, !$set.isManaged(key));
//        }
//      }
//
//      console.log("Извлечённые данные из фоновой страницы saveOptions:", $set);
//
//      // Обновляем каждый параметр
//      for (const key in importedSettings._settings) {
//        if (importedSettings._settings.hasOwnProperty(key)) {
//          console.log(key, importedSettings._settings[key]);
//          $set[key] = importedSettings._settings[key];
//        }
//      }
//
//      console.log("Финальный сет после импорта", $set);
//
//      // Сохраняем обновленные настройки
//      $set.save();
//      console.log("После сохранения", $set);
//	  window.close();
//    }
//  } catch (error) {
//    console.error('Ошибка при получении данных из фоновой страницы:', error);
//  }
//}

async function applyImportedSettings(importedSettings) {
  try {
    // Дождитесь, пока объект $set будет доступен
    const $set = await getSettingsAsync();

    if ($set) {
      let settingsData = $set._settings; // Используйте уже загруженные настройки
      console.log('Приняты данные настроек: ', settingsData);

      // Обновляем каждый параметр
      for (const key in importedSettings._settings) {
        if (importedSettings._settings.hasOwnProperty(key)) {
          console.log(key, importedSettings._settings[key]);
          $set[key] = importedSettings._settings[key];
        }
      }

      console.log("Финальный сет после импорта", $set);

      // Сохраняем обновленные настройки
      $set.save();
      console.log("После сохранения", $set);
      window.close();
    }
  } catch (error) {
    console.error('Ошибка при получении данных из фоновой страницы:', error);
  }
}




document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("exportButton").addEventListener("click", exportOptions);
});




document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);



document.getElementById('importButton').addEventListener('click', function (event) {
  // Предотвращаем действие по умолчанию, которое приводит к закрытию окна
  event.preventDefault();

  // Откройте окно выбора файла
  document.getElementById('importInput').click();
});

// Добавьте обработчик события для выбора файла
document.getElementById('importInput').addEventListener('change', handleFileSelect);





