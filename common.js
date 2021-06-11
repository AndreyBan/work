document.addEventListener('DOMContentLoaded', () => {

    let url = 'query.php',
        itemChange = document.querySelectorAll('.items__elem'),
        subitemChange = document.querySelectorAll('.subitem li:not(.btn-add-site)'),
        fieldSearch = document.querySelector('.search'),
        promptBlock = document.querySelector('.prompt'),
        strGET = location.search.replace('?', '');

    let settingMenu = document.querySelector('.menu'),
        settingWrap = document.querySelector('.settings-wrap');

    settingWrap.addEventListener('mouseover', () => {
        settingMenu.classList.add('show');
    });

    settingMenu.addEventListener('mouseout', () => {
        settingMenu.classList.remove('show');
    });

    /**
     * Определение режима редактирования
     * @returns {boolean}
     */
    function modeEdit() {
        return strGET === 'admin';
    }

    let edit = modeEdit();

    if (!edit) {
        new ClipboardJS('.copy-icon'); //Покдлючаем копирование по кнопке
        new ClipboardJS('.results__value'); //Покдлючаем копирование по полю с паролем
    }

    /**
     *
     * @param id
     * @returns {string}
     */
    function getStrAddSite(id) {
        return '<ul class="subitem" data-id="' + id + '"><li class="btn-add-site">Добавить сайт <span class="add-site">+</span></li></ul>';
    }

    if (edit) {
        let blockItemsLi = document.querySelectorAll('.items>li');

            blockItemsLi.forEach(el => {
            let classEl = el.lastChild;

            if (!classEl.classList.contains('subitem')) {
                let subitemId = el.firstElementChild.firstElementChild.getAttribute("data-id"),
                    str = getStrAddSite(subitemId);

                el.insertAdjacentHTML('beforeend', str);
            }
        });
    }

    /**
     * Открыть/закрыть подменю
     * @param el
     */
    eventHandler("click", ".items__elem", function (e, elem) {
        if (elem.classList.contains('active')) {

            elem.classList.remove('active');
            elem.nextElementSibling.classList.remove('open');

        } else {
            itemChange.forEach(el => {

                if (el.classList.contains('active')) {

                    el.classList.remove('active');
                    el.nextElementSibling.classList.remove('open');
                }
            });

            elem.classList.add('active');
            elem.nextElementSibling.classList.add('open');
        }
    })

    /**
     * Скрываем подсказки при потере фокуса с поля ввода,
     * сохранив клик по резултатам
     */
    document.addEventListener("click", e => {
        if (e.target.className !== "search" || e.target.className !== "prompt__item") {
            promptBlock.classList.remove('open')
        }
    })

    /**
     * Удаляем существующий список сайтов
     */
    function removeListPrompt() {
        let promptItem = document.querySelectorAll('.prompt__item');

        promptItem.forEach(item => item.remove());
    }

    /**
     * Реализация выдачи подсказок с сайтами, при использовании поиска
     * @param elem
     */
    function outputPrompt(elem) {

        fieldSearch.addEventListener('input', function () {
            let searchValue = this.value,
                numberPrompt = 0,
                count = 0;

            removeListPrompt();
            createListSite(elem, searchValue, count);

            let promptItem = document.querySelectorAll('.prompt__item');

            //Подставляем выбранный результат в поле ввода
            if (promptItem.length) promptItem[0].classList.add('active');

            //Скрываем блок подсказок если поле пустое или если нет совпадений (подходящих сайтов)
            if (!searchValue || !promptItem.length) promptBlock.classList.remove('open');
            else promptBlock.classList.add('open');

            changeKeyArrow(promptItem, numberPrompt);
        });
    }

    /**
     * Удаляем класс выделенной подсказки при наведении мыши
     */
    eventHandler("mouseover", ".prompt__item", function (e, el) {
        if (el) el.classList.remove('active');
    })

    /**
     * Создаем новый список сайтов
     */
    function createListSite(elem, searchValue, count) {
        let promptList = document.querySelector('.prompt__list');

        for (let key of elem) {

            let elLi = document.createElement('li');
            const {NAME, ID} = key;

            if (NAME.match(searchValue) && count < 5) { //count ограничивает количество подсказок
                elLi.className = 'prompt__item';
                elLi.setAttribute('data-id', ID);
                elLi.innerHTML = NAME;
                promptList.append(elLi);
                count++;
            }
        }
    }

    /**
     * Обработчик кликов для не созданных изначально элементов
     * @param event тип события
     * @param elements Элемент или строка из классов
     * @param callback
     */
    function eventHandler(event, elements, callback) {

        document.addEventListener(event, function (e) {

            if (typeof elements === "object") {

                let className = "." + elements.className.replaceAll(' ', '.');
                e.target.matches(className) || e.target.closest(className) ? callback(e, e.target) : false;

            } else {
                let arrClasses = elements.replaceAll(' ', '').split(',');

                arrClasses.forEach(el => {
                    if (e.target.matches(el)) {

                        callback(e, e.target)

                    } else if (e.target.closest(el)) {

                        callback(e, e.target.closest(el))

                    } else return false;
                })
            }
        })
    }

    //Выбор результата при клике
    eventHandler("click", '.prompt__item', (e, el) => {
        document.getElementById(el.getAttribute('data-id')).click();
        removeChangeSubItem();
    })

    /**
     * Удаление класса change с подменю при использовнии поиска
     */
    function removeChangeSubItem() {
        subitemChange.forEach(item => {
            if (item.classList.contains('change')) item.classList.remove('change');
        });
    }

    /**
     * Выбор из предложенных результатов  с помощью кнопок up и down
     *
     * @param numberPrompt
     * @param promptItem
     */
    function changeKeyArrow(promptItem, numberPrompt) {

        fieldSearch.addEventListener('keydown', e => {

            let promptItemSelect = document.querySelector('.prompt__item.active');

            if (e.key === "Enter") {
                fieldSearch.value = promptItemSelect.innerText;
                promptBlock.classList.remove('open');
                removeChangeSubItem();
            }

            if (e.code === 'ArrowDown' && numberPrompt + 1 < promptItem.length) {
                numberPrompt++;
                promptItem.forEach((item, i) => {

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
                promptItem.forEach((item, i) => {
                    if (i === numberPrompt) {
                        promptItem[numberPrompt + 1].classList.remove('active');
                        item.classList.add('active');
                    }
                });
            }
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
        let copyBlock = document.querySelector('.copyed__block');

        if (!copyBlock.classList.contains('visible')) copyBlock.classList.add('visible');

        setTimeout(() => {
            copyBlock.classList.remove('visible');
        }, 1000);

    }

    if (!edit) {
        resultBlock.onclick = e => {
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

    /**
     * Создание блока с полями (данными о сайте)
     * @param type {string}
     * @param id {string | number}
     */
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

    /**
     * Создание поля
     * @param elId
     * @param type
     * @param fieldName
     * @param fieldVal
     * @param typeId
     */
    function createField(elId, type, fieldName, fieldVal, typeId) {
        if (!edit) {
            let str = '<div class="results__field" data-id="' + elId + '">\n' +
                '<span class="name" title="' + fieldName + '">' + fieldName + ':' + '</span>\n' +
                '    <input type="text" class="results__value" data-clipboard-action="copy" id="field-' + elId + '" data-clipboard-target="#field-' + elId + '"\n' +
                '    data-id="' + elId + '" value="' + fieldVal + '"/>\n' +
                '    <span class="copy-icon" data-clipboard-action="copy" data-clipboard-target="#field-' + elId + '">\n' +
                '        <i class="ico-copy">\n' +
                '        <svg width="18" height="18">\n' +
                '        <use xlink:href="./img/map.svg#copy"/>\n' +
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

    /**
     * Вывод инфы при выборе сайта из подсказок живого поиска
     */
    function changePrompt() {
        let promptItemSelect = document.querySelector('.prompt__item.active'),
            promptItemValId = promptItemSelect.getAttribute('data-id'),
            bodyText = 'ID=' + promptItemValId;

        sendData(bodyText);
    }

    eventHandler("keydown", fieldSearch, e => e.key === 'Enter' ? changePrompt() : false);


    /********* Выводим результаты с паролями *************/
    function removeValue() {
        let resultBlockValue = document.querySelectorAll('.block__value');

        resultBlockValue.forEach(el => el.remove());
    }

    /************Добавление блока со значениями (редактирование)************/
    function addBlockValue() {
        let str = `<div class="add-block">Добавить блок</div>`;

        if (document.querySelector('.results__block .block__value')) {
            let rbBlockValue = document.querySelectorAll('.block__value'),
                resAddBlock = document.querySelector('.results__block > .add-block');

            if (resAddBlock) resAddBlock.remove();

            rbBlockValue.forEach((item, index) => {
                if (rbBlockValue.length === (index + 1)) item.insertAdjacentHTML("afterEnd", str);
            });

        } else {
            document.querySelector('.results__block').insertAdjacentHTML("beforeEnd", str);
        }
    }

    /************Добавление поля со значениями (редактирование)************/
    function addFieldValue(check = false) {
        document.querySelectorAll('.block__value').forEach(el => {
            if (check) {

                [...el.childNodes].forEach(elem => elem.className === 'add-field' ? elem.remove() : false);
            }

            let plus = document.createElement('div');

            plus.className = 'add-field';
            plus.innerText = '+';
            el.append(plus);
        });
    }


    /************Вывод результатов************/

    function outputResults({ONE, TWO}) {

        const {NAME, LINK, ID} = ONE[0];

        let valueTitle = document.querySelector('a.title');

        if (edit) {
            let inputLink = document.querySelector('.input-link');

            inputLink.value = LINK;
            inputLink.setAttribute('data-id', ID);
        }

        valueTitle.innerText = NAME;
        valueTitle.setAttribute('href', LINK);
        valueTitle.setAttribute('data-id', ID);

        for (let k of TWO) {
            const {TYPE_NAME, id_type, id_data, FIELD, VALUE} = k;

            let blockVal = document.querySelector('.block__value[data-name="' + TYPE_NAME + '"][data-id="' + id_type + '"]');

            if (!blockVal) {
                createValueBlock(TYPE_NAME, id_type);
                createField(id_data, TYPE_NAME, FIELD, VALUE, id_type);
            } else {
                createField(id_data, TYPE_NAME, FIELD, VALUE, id_type);
            }
        }
    }

    /**
     * Отправка данных
     * @param data
     */
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
                if (elem['ONE'].length) outputResults(elem);

                if (edit) {
                    addFieldValue();
                    addBlockValue();
                }
            })
            .catch(error => alert(error));
    }

    /**
     * Отправка id при клике по сайту, для отображения инфы выбранного сайта
     */
    eventHandler("click", ".subitem-element", (e, elem) => {

        let addBlock = document.querySelector('.add-block');

        if (addBlock) addBlock.remove();

        let subItemId = elem.id,
            bodyText = "ID=" + subItemId;

        fieldSearch.value = '';

        if (!elem.classList.contains('change')) {
            document.querySelectorAll('.subitem li:not(.btn-add-site)')
                .forEach(el => el.classList.contains('change') ? el.classList.remove('change') : false);

            elem.classList.add('change');
        }

        sendData(bodyText);
    })

    if (subitemChange[0]) subitemChange[0].click();

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
                const {
                    id_data,
                    id_type,
                    TYPE_NAME,
                    FIELD,
                    VALUE,
                    NAME,
                    ID,
                    PID
                } = elem[0];

                switch (arData.action) {
                    case "add":
                        createField(id_data, TYPE_NAME, FIELD, VALUE, id_type);
                        addFieldValue(true);
                        break;
                    case "createTypeRow":
                        createValueBlock(TYPE_NAME, id_type);
                        createField(id_data, TYPE_NAME, FIELD, VALUE, id_type);
                        addFieldValue(true);
                        addBlockValue();
                        break;
                    case "addSite":
                        addSite(PID, ID, NAME);
                        break;
                    case "addSection":
                        addSection(ID, NAME);
                        break;
                    default:
                        return false;
                }
            })
            .catch(error => alert(error));
    }

    /********************Добавление раздела********************/
    function addSection(id, name) {
        let section = document.querySelector('.items');
        if (section) {

            let str = '<li> <div class="items__elem"> <input type="text" class="input-site" data-id="' + id + '" value="' + name + '"><span class="arrow">' +
                '<i class="ico-arrow">' +
                '<svg width="12" height="12">' +
                '<use xlink:href="./img/map.svg#arrow-down"></use>' +
                '</svg>' +
                '</i>' +
                '</span><span class="delete-icon delete-icon-section"></span>' +
                '</div>' +

                '<ul class="subitem" data-id="' + id + '">' +
                '<li class="btn-add-site">Добавить сайт <span class="add-site">+</span></li>' +
                '</ul>' +
                '</li>';

            section.insertAdjacentHTML('beforeend', str);
        } else {
            let str = '<ul class="items"><li> <div class="items__elem"> <input type="text" class="input-site" data-id="' + id + '" value="' + name + '"><span class="arrow">' +
                '<i class="ico-arrow">' +
                '<svg width="12" height="12">' +
                '<use xlink:href="./img/map.svg#arrow-down"></use>' +
                '</svg>' +
                '</i>' +
                '</span><span class="delete-icon delete-icon-section"></span>' +
                '</div>' +
                '<ul class="subitem" data-id="' + id + '">' +
                '<li class="btn-add-site">Добавить сайт <span class="add-site">+</span></li>' +
                '</ul>' +
                '</li></ul>';
            document.querySelector('.add-section').insertAdjacentHTML('beforebegin', str);
        }
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
        if (!document.querySelector('.subitem-element')) document.querySelector('.title').innerHTML = 'Нет данных';
        if (subitemChange[0]) subitemChange[0].click();
    }

    function removeSection(id) {
        document.querySelector('.input-site[data-id="' + id + '"]').closest('li').remove();
        if (!document.querySelector('.subitem-element')) document.querySelector('.title').innerHTML = 'Нет данных';

        if (subitemChange[0]) subitemChange[0].click();
    }

    /*****************Сохранение/добавление полей*******************/
    if (edit) {
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
                changeInput('JSON=' + JSON.stringify(arData));
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

        resultBlock.onchange = e => {
            let target = e.target;

            if (target.tagName === 'INPUT') {
                textCopy();

                let arData = {};

                arData.action = 'save';
                arData.id_input = target.getAttribute('data-id');
                arData.value = target.value;
                arData.name = target.getAttribute('data-name');

                if (arData.name !== 'LINK') {
                    arData.type = target.closest('.block__value').getAttribute('data-name');
                } else {
                    document.querySelector('.results__block .title').setAttribute('href', arData.value);
                }

                if (target.classList.contains('subtitle')) {
                    target.closest('.block__value').setAttribute('data-name', target.value);
                }

                target.setAttribute('value', target.value);
                changeInput('JSON=' + JSON.stringify(arData));
            }
        };

        let siteBlock = document.querySelector('.side-bar__block');

        siteBlock.addEventListener('change', e => {
            let target = e.target,
                targetClass = target.className;

            if (targetClass === 'input-site') {
                let arData = {};

                arData.action = 'saveGroup';
                arData.value = target.value;
                arData.id_input = target.getAttribute('data-id');
                changeInput('JSON=' + JSON.stringify(arData));

                let title = document.querySelector('.results__block .title');

                title.textContent = arData.value;
            }
        });
        /***************Действия над сайтами**********************/
        siteBlock.addEventListener('click', e => {
            let target = e.target,
                targetClass = target.className,
                arData = {};

            switch (targetClass) {
                case "btn-add-site":
                    arData.action = 'addSite';
                    arData.id_input = target.closest('.subitem').getAttribute('data-id');
                    updateInput('JSON=' + JSON.stringify(arData));
                    break;
                case "delete-icon":
                    arData.action = 'removeSite';
                    arData.id_input = target.previousElementSibling.getAttribute('data-id');
                    changeInput('JSON=' + JSON.stringify(arData));
                    removeSite(arData.id_input);
                    break;
                case "delete-icon delete-icon-section":
                    arData.action = 'removeSection';
                    arData.id_input = target.previousElementSibling.previousElementSibling.getAttribute('data-id');
                    changeInput('JSON=' + JSON.stringify(arData));
                    removeSection(arData.id_input);
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

    /**
     * Отправка данных при изменении input-ов
     * @param data
     */
    function changeInput(data) {
        fetch(url, {
            cache: "no-cache",
            method: 'POST',
            headers: {'Content-type': 'application/x-www-form-urlencoded'},
            body: data
        }).catch(error => alert(error));
    }
});
