<?php
header("Content-Type: text/html; charset=UTF8");
$modEdit = false;
if(isset($_GET["admin"])) $modEdit = true;
include 'functions.php';
$arrItems = call_db(HOST, USER, PASS, DB);
$arrSort = getSortArr($arrItems);
$path = '';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport"
		  content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<link rel="stylesheet" href="css/style.css?v=<?php echo time() ?>">
	<title>Менеджер паролей</title>
</head>

<body>
<header>
	<div class="container">
		<h1>Менеджер паролей</h1>
		<i class="ico-key">
			<svg width="42" height="42">
				<use xlink:href="<?php echo $path . '/img/map.svg#key' ?>"/>
			</svg>
		</i>

	</div>
	<div class="settings-wrap">
		<label for="menu">
	<i class="ico-settings">
		<svg width="30" height="30">
			<use xlink:href="<?php echo $path . '/img/map.svg#settings' ?>"/>
		</svg>
	</i>
		</label>
		<input type="checkbox" id="menu" hidden>
	<ul class="menu">
		<li>
			<?php if(!$modEdit){?>
			<a href="?admin">Режим редактирования</a>
			<?php } else{?>
				<a href="/">Выйти из редактирования</a>
			<?php } ?>
		</li>
	</ul>
	</div>
</header>

<section class="contents">
	<div class="container">
		<div class="side-bar__block">
			<input class="search" type="text" placeholder="Поиск">
			<div class="prompt">
				<div class="prompt__separate"></div>
				<ul class="prompt__list">
				</ul>
			</div>
			<?php view_cat($arrSort); ?>
			<?php if($modEdit){?>
			<div class="add-section">Добавить раздел</div>
			<?php } ?>
		</div>
		<div class="results__block">
			<a class="title" href="" target="_blank">Нет данных</a>
			<?php if($modEdit) {?>
				<div> <span>Ссылка: </span><input class="input-link" type="text" value="" data-id="" data-name="LINK"></div>
			<?php } ?>
			<div class="copyed__block">
				<?= $modEdit ? "Сохранено" : "Скопировано" ?>
			</div>
		</div>
	</div>
</section>

<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js"></script>
<script src="common.js?v=<?php echo time() ?>"></script>
</body>
</html>
