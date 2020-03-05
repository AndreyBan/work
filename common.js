
document.addEventListener('DOMContentLoaded', function () {

// if (!modeEdit()) {
	new ClipboardJS('.copy-icon'); //Покдлючаем копирование по кнопке
	new ClipboardJS('.results__value'); //Покдлючаем копирование по полю с паролем
// }
	let url = 'query.php',
		itemChange = document.querySelectorAll('.items__elem'),
		subitemChange = document.querySelectorAll('.subitem li'),
		fieldSearch = document.querySelector('.search'),
		promptList = document.querySelector('.prompt__list'),
		promptBlock = document.querySelector('.prompt'),
		copyedBlock = document.querySelector('.copyed__block'),
		strGET = window.location.search.replace('?', '');


	function modeEdit() {
		return strGET === 'admin';
	}

	/********Делаем открытие подменю************/

	itemChange.forEach(function (item) {

		item.onclick = function () {
			if (item.classList.contains('active')) {
				item.classList.remove('active');
				item.nextElementSibling.classList.remove('open');
			} else {
				itemChange.forEach(function (el) {
					if (el.classList.contains('active')) {
						el.classList.remove('active');
						el.nextElementSibling.classList.remove('open');
					}
				});
				item.classList.add('active');
				item.nextElementSibling.classList.add('open');
			}
		};
	});


	/*********Прячем выпадающую подсказку с сайтами при потере фокуса с поля поиска**************/
	fieldSearch.addEventListener('blur', function () {
		setTimeout(function () {
			promptBlock.classList.remove('open');
		}, 200);
	});


	fetch(url, {cache: "no-cache"})
		.then(response => response.json())
		.then(elem => {

			/**********Реализация выдачи подсказок с сайтами,  при использовании поиска********/
			fieldSearch.addEventListener('input', function () {
				let promptItem = document.querySelectorAll('.prompt__item'),
					searchValue = this.value,
					arrResult = [],
					numberPrompt = 0,
					count = 0;

				//Удаляем существующий список сайтов
				promptItem.forEach(function (item) {
					item.remove();
				});
				//Создаем новый список сайтов
				for (let key of elem) {
					let elLi = document.createElement('li');

					if (key.NAME.match(searchValue) && count < 5) { //count ограничивает количество подсказок
						arrResult.push(key.NAME);
						elLi.className = 'prompt__item';
						elLi.setAttribute('data-id', key.ID);
						elLi.innerHTML = key.NAME;
						promptList.append(elLi);
						count++;
					}
				}
				promptItem = document.querySelectorAll('.prompt__item');
				//Скрываем блок подсказок если поле пустое или если нет совпадений (подходящих сайтов)
				if (searchValue === '' || !promptItem.length)
					promptBlock.classList.remove('open');
				else promptBlock.classList.add('open');


				// Выбор из предложенных результатов  с помощью кнопок up и down
				fieldSearch.addEventListener('keydown', function (e) {

					let promptItemSelect = document.querySelector('.prompt__item.active');

					if (e.key === "Enter") {
						fieldSearch.value = promptItemSelect.innerText;
						promptBlock.classList.remove('open');
						removeChangeSubItem();
					}
					if (e.code === 'ArrowDown' && numberPrompt + 1 < promptItem.length) {
						numberPrompt++;
						promptItem.forEach(function (item, i) {
							if (i === numberPrompt) {
								if (promptItemSelect) {
									promptItem[numberPrompt - 1].classList.remove('active');
								}
								item.classList.add('active');
							}
						});
					} else if (e.code === 'ArrowUp' && numberPrompt - 1 >= 0) {
						numberPrompt--;
						promptItem.forEach(function (item, i) {
							if (i === numberPrompt) {
								promptItem[numberPrompt + 1].classList.remove('active');
								item.classList.add('active');
							}
						});
					}
				});
				// Удаляем класс выделенной подсказки при навдении мыши
				promptBlock.addEventListener('mouseover', function () {
					numberPrompt = -1;

					let promptItemSelect = document.querySelector('.prompt__item.active');

					if (promptItemSelect) promptItemSelect.classList.remove('active');
				});
				// Подставляем выбранный результат в поле ввода
				promptItem.forEach(function (item,) {
					promptItem[0].classList.add('active');
					item.addEventListener('click', function () {
						fieldSearch.value = this.innerText;
						removeChangeSubItem();
					});
				});
			});

			/********* Удаление класса change с подменю при использовнии поиска*************/
			function removeChangeSubItem() {
				subitemChange.forEach(function (item) {
					if (item.classList.contains('change')) {
						item.classList.remove('change');
					}
				});
			}
		})
		.catch(error => alert(error));

	let resultBlock = document.querySelector('.results__block');
	// fieldSite = document.getElementById('popup-site'),
	// popupBlockFirst = document.querySelector('.popup__block:first-child'),
	// siteNamePopUp = document.querySelector('.site-name');

	/********** Показываем всплывашку с надписью скопировано при клике по значку копирования или полю*********/
	function textCopy() {
		if (!copyedBlock.classList.contains('visible')) copyedBlock.classList.add('visible');
		setTimeout(function () {
			copyedBlock.classList.remove('visible');
		}, 1000);
	}

	if (!modeEdit()) {
		resultBlock.onclick = function (e) {
			let target = e.target;
			if (target.className === 'results__value' || target.className === 'copy-icon') {

				textCopy();

			} else if (target.className === 'subtitle') {
				let targetParent = target.parentNode;
				if (targetParent.classList.contains('hide')) targetParent.classList.remove('hide');
				else targetParent.classList.add('hide');
			}

		};
	}

	// fieldSite.addEventListener('change', function () {
	// 	if (fieldSite.value === 'new') {
	// 		popupBlockFirst.style.width = '49%';
	// 		siteNamePopUp.style.display = 'inline-block';
	// 	} else {
	// 		popupBlockFirst.style.width = '100%';
	// 		siteNamePopUp.style.display = 'none';
	// 	}
	// });


	function createValueBlock(type, id) {
		let div = document.createElement('div');
		let h3;
		if (!modeEdit()) h3 = document.createElement('h3');
		else {
			h3 = document.createElement('input');
			h3.setAttribute('value', type);
			h3.setAttribute('data-id', id);
			h3.setAttribute('data-name', 'TYPE');
		}

		div.className = 'block__value';
		// div.id = 'result-' + type;
		div.setAttribute('data-name', type);
		div.setAttribute('data-id', id);
		resultBlock.appendChild(div);

		h3.className = 'subtitle';
		h3.innerHTML = type;
		// document.getElementById('result-' + type).appendChild(h3);
		document.querySelector('.block__value[data-name="' + type +'"]').appendChild(h3);
	}

	function createField(elId, type, fieldName, fieldVal) {
		if (!modeEdit()) {
			let str = '<div class="results__field" data-id="' + elId + '">\n' +
				'<span class="name">' + fieldName + ':' + '</span>\n' +
				'    <input type="text" class="results__value" data-clipboard-action="copy" id="field-' + elId +'" data-clipboard-target="#field-' + elId + '"\n' +
				'    data-id="' + elId + '" value="' + fieldVal + '"/>\n' +
				'    <span class="copy-icon" data-clipboard-action="copy" data-clipboard-target="#field-' + elId + '">\n' +
				'        <i class="ico-copy">\n' +
				'        <svg width="18" height="18">\n' +
				'        <use xlink:href="/img/map.svg#copy"/>\n' +
				'        </svg>\n' +
				'        </i>\n' +
				'        </span>\n' +
				'</div>',
				block = document.querySelector('.block__value[data-name="' + type +'"]');
			block.insertAdjacentHTML("beforeend", str);
		} else {
			let str = '<div class="results__field" data-id="' + elId + '">\n' +
				'<input type="text" class="name" data-name="FIELD" data-id="' + elId + '" value="' + fieldName + '"/>\n' +
				'    <input type="text" class="results__value"\n' +
				'    data-id="' + elId + '" data-name="VALUE" value="' + fieldVal + '"/>\n' +
				'</div>',
				block = document.querySelector('.block__value[data-name="' + type +'"]');
			block.insertAdjacentHTML("beforeend", str);
		}
	}

	fieldSearch.onkeydown = function (e) {
		if (e.key === 'Enter') {

			let promptItemSelect = document.querySelector('.prompt__item.active'),
				promptItemValId = promptItemSelect.getAttribute('data-id'),
				bodyText = 'ID=' + promptItemValId;

			sendData(bodyText);
		}
	};

	/********* Выводим результаты с паролями *************/
	function removeValue() {
		let resultBlockValue = document.querySelectorAll('.block__value');

		resultBlockValue.forEach(function (el) {
			el.remove();
		});
	}

	let valueTitle = document.querySelector('a.title');

	function sendData(data) {
		let xhr = new XMLHttpRequest();

		removeValue();
		xhr.open('POST', 'query.php', true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onload = function (e) {
			if (xhr.status !== 200) {
				alert(xhr.status + ': ' + xhr.statusText);
			} else {
				let elem = JSON.parse(xhr.responseText);

				if (elem.length) {
					valueTitle.innerText = elem[0].NAME;
					valueTitle.setAttribute('href', elem[0].LINK);
					valueTitle.setAttribute('data-id', elem[0].ID);
					for (let k of elem) {
						let blockVal = document.querySelector('.block__value[data-name="' + k.TYPE_NAME +'"]');
						if (!blockVal) {
							createValueBlock(k.TYPE_NAME, k.id_type);
							createField(k.id_data, k.TYPE_NAME, k.FIELD, k.VALUE);
						} else {
							createField(k.id_data, k.TYPE_NAME, k.FIELD, k.VALUE);
						}
					}
				}
				else valueTitle.innerText = 'Нет данных';

				if (modeEdit()) {
					document.querySelectorAll('.block__value').forEach(function (el) {
						let plus = document.createElement('div');

						plus.className = 'add-field';
						plus.innerText = '+';
						el.append(plus);
					});

					document.querySelectorAll('.results__field').forEach(function (el) {
						let deleteIcon = document.createElement('span');

						deleteIcon.className = 'delete-icon';
						el.append(deleteIcon);
					});

					let str = `<div class="add-block">Добавить блок</div>`;

					if (document.querySelector('.results__block .block__value')) {
						let rbBlockValue = document.querySelectorAll('.results__block .block__value');
						rbBlockValue.forEach(function (item, index) {
							if(rbBlockValue.length === (index + 1)) item.insertAdjacentHTML("beforeend", str);
						});
					} else {
						document.querySelector('.results__block').insertAdjacentHTML("beforeend", str);
					}

				}
			}
		};
		xhr.send(data);
	}


	subitemChange.forEach(function (item) {
		item.addEventListener('click', function () {
			if (document.querySelector('.add-block')) {
				document.querySelector('.add-block').remove();
			}
			let subitemId = this.id,
				bodytext = "ID=" + subitemId;

			fieldSearch.value = '';
			if (!item.classList.contains('change')) {
				subitemChange.forEach(function (el) {
					if (el.classList.contains('change')) {
						el.classList.remove('change');
					}
				});
				item.classList.add('change');
			}
			sendData(bodytext);
		});
	});
	subitemChange[0].click();


	/*****************Сохранение полей*******************/
	if (modeEdit()) {
		resultBlock.onclick = function (e) {
			let target = e.target,
				 siteId = target.closest('.results__block')
				.firstElementChild
				.getAttribute('data-id'),
				arData = {};

			if (target.className === 'add-field') {
				arData.type = target.closest('.block__value')
					.firstElementChild
					.getAttribute('data-id');
				arData.site = siteId;
				arData.action = 'add';
				arData.id_input = target.parentElement.getAttribute('data-id');
				saveInput('JSON=' + JSON.stringify(arData), siteId);
			}
			if (target.className === 'delete-icon') {
				arData.id_input = target.parentElement.getAttribute('data-id');
				arData.action = 'remove';
				saveInput('JSON=' + JSON.stringify(arData), siteId);
			}
			if (target.className === 'add-block') {
				arData.action = 'createTypeRow';
				arData.site = siteId;
				saveInput('JSON=' + JSON.stringify(arData), siteId);
			}
		};

		resultBlock.onchange = function (e) {
			let target = e.target;

			if (target.tagName === 'INPUT') {
				textCopy();
				let arData = {};
				arData.action = 'save';
				arData.id_input = target.getAttribute('data-id');
				arData.value = target.value;
				arData.type = target.closest('.block__value').getAttribute('data-name');
				arData.name = target.getAttribute('data-name');

				saveInput('JSON=' + JSON.stringify(arData));
			}
		};
	}

	function saveInput(data, id = '') {
		let xhr = new XMLHttpRequest();

		xhr.open('POST', 'query.php', true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onload = function (e) {
			if (xhr.status !== 200) {
				alert(xhr.status + ': ' + xhr.statusText);
			} else {
				if (id !== '') sendData("ID=" + id);
			}

		};
		xhr.send(data);
	}

});