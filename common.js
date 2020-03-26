document.addEventListener('DOMContentLoaded', function () {

	let url = 'query.php',
		itemChange = document.querySelectorAll('.items__elem'),
		blockItems = document.querySelector('.items'),
		blockItemsLi = document.querySelectorAll('.items>li'),
		subitemChange = document.querySelectorAll('.subitem li:not(.btn-add-site)'),
		fieldSearch = document.querySelector('.search'),
		promptList = document.querySelector('.prompt__list'),
		promptBlock = document.querySelector('.prompt'),
		copyedBlock = document.querySelector('.copyed__block'),
		strGET = window.location.search.replace('?', '');

	function modeEdit() {
		return strGET === 'admin';
	}

	if (!modeEdit()) {
		new ClipboardJS('.copy-icon'); //Покдлючаем копирование по кнопке
		new ClipboardJS('.results__value'); //Покдлючаем копирование по полю с паролем
	}
	if (modeEdit) {
		let observer = new MutationObserver(() => {
			let itemChange = document.querySelectorAll('.items__elem');

			itemChange.forEach(function (el) {
				openMenu(el);
			});
		});
		observer.observe(blockItems, {
			childList: true
		});

		function getStrAddSite(id) {
			let strAddSite = '<ul class="subitem" data-id="' + id + '"><li class="btn-add-site">Добавить сайт <span class="add-site">+</span></li></ul>';
			return strAddSite;
		}

		blockItemsLi.forEach(function (el) {
			let classEl = el.lastChild;
			if (!classEl.classList.contains('subitem')) {
				let subitemId = el.firstElementChild.firstElementChild.getAttribute("data-id"),
					str = getStrAddSite(subitemId);
				el.insertAdjacentHTML('beforeend', str);
			}
		});
	}

	/***********Открыть/закрыть подменю*********/
	function openMenu(el) {
		el.addEventListener('click', function () {
			if (el.classList.contains('active')) {
				el.classList.remove('active');
				el.nextElementSibling.classList.remove('open');
			} else {
				itemChange.forEach(function (el) {
					if (el.classList.contains('active')) {
						el.classList.remove('active');
						el.nextElementSibling.classList.remove('open');
					}
				});
				el.classList.add('active');
				el.nextElementSibling.classList.add('open');
			}
		});
	}

	itemChange.forEach(function (el) {
		openMenu(el);
	});

	/*********Прячем выпадающую подсказку с сайтами при потере фокуса с поля поиска**************/
	fieldSearch.addEventListener('blur', function () {
		setTimeout(function () {
			promptBlock.classList.remove('open');
		}, 200);
	});

	/********* Удаление класса change с подменю при использовнии поиска*************/
	function removeChangeSubItem() {
		subitemChange.forEach(function (item) {
			if (item.classList.contains('change')) {
				item.classList.remove('change');
			}
		});
	}

	/*********Удаляем существующий список сайтов**********/
	function removeListPrompt() {
		let promptItem = document.querySelectorAll('.prompt__item');
		promptItem.forEach(function (item) {
			item.remove();
		});
	}

	function outputPrompt(elem) {
		/**********Реализация выдачи подсказок с сайтами,  при использовании поиска********/
		fieldSearch.addEventListener('input', function () {
			let searchValue = this.value,
				numberPrompt = 0,
				count = 0;

			removeListPrompt();

			//Создаем новый список сайтов
			for (let key of elem) {
				let elLi = document.createElement('li');

				if (key.NAME.match(searchValue) && count < 5) { //count ограничивает количество подсказок
					elLi.className = 'prompt__item';
					elLi.setAttribute('data-id', key.ID);
					elLi.innerHTML = key.NAME;
					promptList.append(elLi);
					count++;
				}
			}
			let promptItem = document.querySelectorAll('.prompt__item');
			//Скрываем блок подсказок если поле пустое или если нет совпадений (подходящих сайтов)
			if (searchValue === '' || !promptItem.length) promptBlock.classList.remove('open');
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
					e.preventDefault();
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
					let elementId = item.getAttribute('data-id');
					document.getElementById(elementId).click();
				});
			});
		});
	}

	fetch(url, {cache: "no-cache"})
		.then(response => response.json())
		.then(elem => {
			outputPrompt(elem);
		})
		.catch(error => alert(error));


	let resultBlock = document.querySelector('.results__block');


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
		div.setAttribute('data-name', type);
		div.setAttribute('data-id', id);
		resultBlock.appendChild(div);

		h3.className = 'subtitle';
		h3.innerHTML = type;
		document.querySelector('.block__value[data-name="' + type + '"][data-id="' + id + '"]').appendChild(h3);
	}

	function createField(elId, type, fieldName, fieldVal, typeId) {
		if (!modeEdit()) {
			let str = '<div class="results__field" data-id="' + elId + '">\n' +
				'<span class="name">' + fieldName + ':' + '</span>\n' +
				'    <input type="text" class="results__value" data-clipboard-action="copy" id="field-' + elId + '" data-clipboard-target="#field-' + elId + '"\n' +
				'    data-id="' + elId + '" value="' + fieldVal + '"/>\n' +
				'    <span class="copy-icon" data-clipboard-action="copy" data-clipboard-target="#field-' + elId + '">\n' +
				'        <i class="ico-copy">\n' +
				'        <svg width="18" height="18">\n' +
				'        <use xlink:href="/img/map.svg#copy"/>\n' +
				'        </svg>\n' +
				'        </i>\n' +
				'        </span>\n' +
				'</div>',
				block = document.querySelector('.block__value[data-name="' + type + '"][data-id="' + typeId + '"]');
			block.insertAdjacentHTML("beforeend", str);
		} else {
			let str = '<div class="results__field" data-id="' + elId + '">\n' +
				'<input type="text" class="name" data-name="FIELD" data-id="' + elId + '" value="' + fieldName + '"/>\n' +
				'    <input type="text" class="results__value" data-clipboard-action="copy" data-clipboard-target="#field-' + elId + '"\n' +
				'    data-id="' + elId + '" data-name="VALUE" value="' + fieldVal + '"/>\n' +
				'<span class="delete-icon"></span>\n' +
				'</div>',
				block = document.querySelector('.block__value[data-name="' + type + '"][data-id="' + typeId + '"]');
			block.insertAdjacentHTML("beforeend", str);
		}
	}

	function changePrompt() {
		let promptItemSelect = document.querySelector('.prompt__item.active'),
			promptItemValId = promptItemSelect.getAttribute('data-id'),
			bodyText = 'ID=' + promptItemValId;

		sendData(bodyText);
	}

	fieldSearch.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') {
			changePrompt();
		}
	});


	/********* Выводим результаты с паролями *************/
	function removeValue() {
		let resultBlockValue = document.querySelectorAll('.block__value');

		resultBlockValue.forEach(function (el) {
			el.remove();
		});
	}

	/************Добавление блока со значениями (редактирование)************/
	function addBlockValue() {
		let str = `<div class="add-block">Добавить блок</div>`;

		if (document.querySelector('.results__block .block__value')) {
			let rbBlockValue = document.querySelectorAll('.block__value');
			if (document.querySelector('.results__block > .add-block')) {
				document.querySelector('.results__block > .add-block').remove();
			}
			rbBlockValue.forEach(function (item, index) {
				if (rbBlockValue.length === (index + 1)) item.insertAdjacentHTML("afterEnd", str);
			});

		} else {
			document.querySelector('.results__block').insertAdjacentHTML("beforeEnd", str);
		}
	}

	/************Добавление поля со значениями (редактирование)************/
	function addFieldValue(check = false) {
		document.querySelectorAll('.block__value').forEach(function (el) {
			if (check) {
				let child = el.childNodes;
				[].forEach.call(child, function (elem) {
					if (elem.className === 'add-field') elem.remove();
				});
			}
			let plus = document.createElement('div');

			plus.className = 'add-field';
			plus.innerText = '+';
			el.append(plus);
		});
	}


	/************Вывод результатов************/
	function outputResults(elem) {
		valueTitle.innerText = elem["ONE"][0].NAME;
		valueTitle.setAttribute('href', elem["ONE"][0].LINK);
		valueTitle.setAttribute('data-id', elem["ONE"][0].ID);
		for (let k of elem["TWO"]) {
			let blockVal = document.querySelector('.block__value[data-name="' + k.TYPE_NAME + '"][data-id="' + k.id_type + '"]');
			if (!blockVal) {
				createValueBlock(k.TYPE_NAME, k.id_type);
				createField(k.id_data, k.TYPE_NAME, k.FIELD, k.VALUE, k.id_type);
			} else {
				createField(k.id_data, k.TYPE_NAME, k.FIELD, k.VALUE, k.id_type);
			}
		}
	}

	let valueTitle = document.querySelector('a.title');

	function sendData(data) {

		removeValue();

		fetch(url, {
			cache: "no-cache",
			method: 'POST',
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
			body: data
		})
			.then(response => response.json())
			.then(elem => {
				if (elem['ONE'].length) {
					outputResults(elem);
				} else valueTitle.innerText = 'Нет данных';

				if (modeEdit()) {
					addFieldValue();
					addBlockValue();
				}
			})
			.catch(error => alert(error));
	}

	blockItems.addEventListener('click', function (e) {
		let target = e.target;

		if (target.className === 'subitem-element') {
			if (document.querySelector('.add-block')) {
				document.querySelector('.add-block').remove();
			}
			let subitemId = target.id,
				bodytext = "ID=" + subitemId;

			fieldSearch.value = '';
			if (!target.classList.contains('change')) {
				subitemChange.forEach(function (el) {
					if (el.classList.contains('change')) {
						el.classList.remove('change');
					}
				});
				target.classList.add('change');
			}
			sendData(bodytext);
		}
	});

	subitemChange[0].click();

	function updateInput(data) {
		fetch(url, {
			cache: "no-cache",
			method: 'POST',
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
			body: data
		})
			.then(response => response.json())
			.then(elem => {
				let arData = JSON.parse(data.replace('JSON=', ''));
				elem = elem[0];
				switch (arData.action) {
					case "add":
						createField(elem.id_data, elem.TYPE_NAME, elem.FIELD, elem.VALUE, elem.id_type);
						addFieldValue(true);
						break;
					case "createTypeRow":
						createValueBlock(elem.TYPE_NAME, elem.id_type);
						createField(elem.id_data, elem.TYPE_NAME, elem.FIELD, elem.VALUE, elem.id_type);
						addFieldValue(true);
						addBlockValue();
						break;
					case "addSite":
						addSite(elem.PID, elem.ID, elem.NAME);
						break;
					case "addSection":
						addSection(elem.ID, elem.NAME);
						break;
					default:
						return false;
				}
			})
			.catch(error => alert(error));
	}

	/********************Добавление раздела********************/
	function addSection(id, name) {
		let section = document.querySelector('.items'),
			str = '<li > <div class="items__elem"> <input type="text" class="input-site" data-id="' + id + '" value="' + name + '"><span>' +
				'<i class="ico-arrow">' +
				'<svg width="12" height="12">' +
				'<use xlink:href="/img/map.svg#arrow-down"></use>' +
				'</svg>' +
				'</i>' +
				'</span>' +
				'</div>' +

				'<ul class="subitem" data-id="' + id + '">' +
				'<li class="btn-add-site">Добавить сайт <span class="add-site">+</span></li>' +
				'</ul>' +
				'</li>';

		section.insertAdjacentHTML('beforeend', str);
	}

	/********************Добавление сайта********************/
	function addSite(pid, id, name) {
		let section = document.querySelector('.subitem[data-id="' + pid + '"]').lastElementChild,
			str = '<li class="subitem-element" id="' + id + '"> <input type="text" class="input-site" data-id="' + id + '" value="' + name + '"><span class="delete-icon"></span></li>';

		section.insertAdjacentHTML('beforebegin', str);
	}

	/********************удаление сайта********************/
	function removeSite(id) {
		document.getElementById(id).remove();
		subitemChange[0].click();
	}

	/*****************Сохранение/добавление полей*******************/
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
				updateInput('JSON=' + JSON.stringify(arData));
			}
			if (target.className === 'delete-icon') {
				arData.id_input = target.parentElement.getAttribute('data-id');
				arData.action = 'remove';
				removeInput('JSON=' + JSON.stringify(arData));
				let parentBlock = target.closest('.results__field');
				if (parentBlock.closest('.block__value').childElementCount === 3) parentBlock.closest('.block__value').remove();
				else parentBlock.remove();
			}
			if (target.className === 'add-block') {
				arData.action = 'createTypeRow';
				arData.site = siteId;
				updateInput('JSON=' + JSON.stringify(arData));
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
				if (target.classList.contains('subtitle')) {
					target.closest('.block__value').setAttribute('data-name', target.value);
				}
				target.setAttribute('value', target.value);
				saveInput('JSON=' + JSON.stringify(arData));
			}
		};

		let siteBlock = document.querySelector('.side-bar__block');

		siteBlock.addEventListener('change', function (e) {
			let target = e.target,
				targetClass = target.className;
			if (targetClass === 'input-site') {
				let arData = {};
				arData.action = 'saveGroup';
				arData.value = target.value;
				arData.id_input = target.getAttribute('data-id');
				saveInput('JSON=' + JSON.stringify(arData));
			}
		});
		/***************Действия над сайтами**********************/
		siteBlock.addEventListener('click', function (e) {
			let target = e.target,
				targetClass = target.className;
			let arData = {};
			switch (targetClass) {
				case "btn-add-site":
					arData.action = 'addSite';
					arData.id_input = target.closest('.subitem').getAttribute('data-id');
					updateInput('JSON=' + JSON.stringify(arData));
					break;
				case "delete-icon":
					arData.action = 'removeSite';
					arData.id_input = target.previousElementSibling.getAttribute('data-id');
					removeInput('JSON=' + JSON.stringify(arData));
					removeSite(arData.id_input);
					break;
				case "add-section":
					arData.action = 'addSection';
					updateInput('JSON=' + JSON.stringify(arData));
					break;

				default:
					return false;
			}
		});
	}

	function saveInput(data, id = '') {
		fetch(url, {
			cache: "no-cache",
			method: 'POST',
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
			body: data
		}).then(successResponse => {

			if (successResponse.status !== 200) {
				alert(successResponse.status + ': ' + successResponse.statusText);
			}
		})
			.catch(error => alert(error));
	}

	function removeInput(data) {
		fetch(url, {
			cache: "no-cache",
			method: 'POST',
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
			body: data
		}).catch(error => alert(error));
	}
});