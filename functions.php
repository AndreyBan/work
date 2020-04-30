<?php
$nameDB = 'agatpasswords';
define('HOST', 'localhost');
define('USER', 'root');
define('PASS', 'root');
define('DB', $nameDB);

$mysqlnew = new mysqli(HOST, USER, PASS);
$sql = " CREATE  DATABASE IF NOT EXISTS $nameDB";
$mysqlnew->query($sql);
$mysqlnew = new mysqli(HOST, USER, PASS, DB);
$mysqlnew->set_charset('utf8');
$sql = "CREATE TABLE IF NOT EXISTS `data` (`id_data` INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY, `VALUE` VARCHAR(30) NULL, `ID` INT(255) UNSIGNED NULL,`id_type`  INT(255) UNSIGNED NULL, `FIELD` VARCHAR(60) NULL); 
CREATE TABLE IF NOT EXISTS `fields`(`id_field` INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY, `FIELD` VARCHAR(60)  NULL); 
CREATE TABLE IF NOT EXISTS `sites`(`ID` INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY,`PID` INT(255) UNSIGNED NULL DEFAULT 0, `NAME` VARCHAR(60) NULL, `LINK` CHAR(200) NULL); 
CREATE TABLE IF NOT EXISTS `type`(`id_type` INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY,`TYPE_NAME` CHAR(60) NULL DEFAULT 0);
ALTER TABLE IF NOT EXISTS `data` ADD FOREIGN KEY (`ID`) REFERENCES `sites`(`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE IF NOT EXISTS `data` ADD FOREIGN KEY (`id_type`) REFERENCES `type`(`id_type`) ON DELETE RESTRICT ON UPDATE RESTRICT;";
$mysqlnew->multi_query($sql);
$mysqlnew->close();


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
	$mysqli->close();
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
	$mysqli->close();
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
					. '<span class="arrow">
                                    <i class="ico-arrow">
                                        <svg width="12" height="12">
                                            <use xlink:href="/img/map.svg#arrow-down"/>
                                        </svg>
                                    </i>
                                </span><span class="delete-icon delete-icon-section"></span>
                            </div>';
				view_cat($arr, $arr[$pid][$i]["ID"]);
				echo '</li>';
			} else {
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
		echo '<ul class="subitem" data-id="' . $pid . '">';
		for ($i = 0; $i < count($arr[$pid]); $i++) {
			if ($modEdit) {
				echo '<li class="subitem-element" id="' . $arr[$pid][$i]["ID"]
					. '"> <input type="text" class="input-site" data-id="' . $arr[$pid][$i]["ID"] . '" value="'
					. $arr[$pid][$i]["NAME"] . '"/>'
					. '<span class="delete-icon"></span></li>';
			} else {
				echo '<li class="subitem-element" id="' . $arr[$pid][$i]["ID"]
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

