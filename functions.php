<?php
define('HOST', 'localhost');
define('USER', 'root');
define('PASS', '');
define('DB', 'agat');

function call_db($host, $user, $pass, $database)
{
	$mysqli = new mysqli($host, $user, $pass, $database);
	$mysqli->set_charset('utf8');
	if ($mysqli->connect_error) {
		die('Ошибка подключения(' . $mysqli->connect_errno . ')' . $mysqli->connect_error);
	}
	$sql = "SELECT * FROM `sites`";
	$result = $mysqli->query($sql);
	$arrRes = $result->fetch_all(MYSQLI_ASSOC);
	return $arrRes;
}

function getSortArr($array)
{
	$arrCat = array();
	foreach ($array as $arr) {
		if (empty($arrCat[$arr['PID']])) {
			$arrCat[$arr['PID']] = array();
		}
		$arrCat[$arr['PID']][] = $arr;
	}
	return $arrCat;
}

function getFields($host, $user, $pass, $database)
{
	$mysqli = new mysqli($host, $user, $pass, $database);
	$mysqli->set_charset('utf8');
	if ($mysqli->connect_error) {
		die('Ошибка подключения(' . $mysqli->connect_errno . ')' . $mysqli->connect_error);
	}
	$sql = "SELECT
	 `sites`.ID,
	 `sites`.NAME,
	 `data`.VALUE,
	 `type`.TYPE_NAME,
	 `fields`.FIELD
 FROM `sites` INNER JOIN `data` ON `sites`.ID = `data`.ID
 INNER JOIN `type` ON `data`.id_type = `type`.id_type
 INNER JOIN `fields` ON `data`.id_field = `fields`.id_field";
	$result = $mysqli->query($sql);
	$arrRes = $result->fetch_all(MYSQLI_ASSOC);
	return $arrRes;
}

function view_cat($arr, $pid = 0)
{
	global $modEdit;
	if (empty($arr[$pid])) {
		return;
	}
	if ($pid == 0) {
		echo '<ul class="items">';
		for ($i = 0; $i < count($arr[$pid]); $i++) {
			if ($modEdit) {

				echo '<li><div class="items__elem"> <input type="text" class="input-site" data-id="' . $arr[$pid][$i]["ID"] . '" value="'
					. $arr[$pid][$i]["NAME"] . '" />'
					. '<span>
                                    <i class="ico-arrow">
                                        <svg width="12" height="12">
                                            <use xlink:href="/img/map.svg#arrow-down"/>
                                        </svg>
                                    </i>
                                </span>
                            </div>';
				view_cat($arr, $arr[$pid][$i]["ID"]);
				echo '</li>';
			}
			else{
				echo '<li><div class="items__elem">'
					. $arr[$pid][$i]["NAME"]
					. '<span>
                                    <i class="ico-arrow">
                                        <svg width="12" height="12">
                                            <use xlink:href="/img/map.svg#arrow-down"/>
                                        </svg>
                                    </i>
                                </span>
                            </div>';
				view_cat($arr, $arr[$pid][$i]["ID"]);
				echo '</li>';
			}
		}
	} else {
		echo '<ul class="subitem" data-id="'.$pid.'">';
		for ($i = 0; $i < count($arr[$pid]); $i++) {
			if ($modEdit) {
				echo '<li id="' . $arr[$pid][$i]["ID"]
					. '"> <input type="text" class="input-site" data-id="' . $arr[$pid][$i]["ID"] . '" value="'
					. $arr[$pid][$i]["NAME"] .'"/>'
					. '</li>';
			}
			else{
				echo '<li id="' . $arr[$pid][$i]["ID"]
					. '">'
					. $arr[$pid][$i]["NAME"]
					. '</li>';
			}
		}
		if ($modEdit) {
			echo '<li class="btn-add-site">Добавить сайт <span class="add-site">+</span></li>';
		}
	}
	echo '</ul>';
}

