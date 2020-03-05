<?php
header("Content-Type: text/html; charset=UTF8");
include 'functions.php';
//include 'query.php';
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
	<title>Document</title>
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

			<?php view_cat($arrSort);
			if(isset($_GET['admin'])){?>
			<button class="edit_elements">Редактировать
				<span>
					<i class="ico-edit">
						<svg width="14" height="14">
							<use xlink:href="<?= $path . '/img/map.svg#edit' ?>"/>
						</svg>
					</i>
				</span>
			</button>
			<?php } ?>
		</div>
		<div class="results__block">
			<a class="title" href="https://agat-group.com" target="_blank">agat-group.com</a>
			<div class="copyed__block">
				<?php if(isset($_GET['admin'])){?>
					Сохранено
				<?php }
				else { ?>
				Скопировано
				<?php } ?>
			</div>
		</div>
	</div>
</section>

<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js"></script>
<script src="common.js?v=<?php echo time() ?>"></script>
</body>
</html>
