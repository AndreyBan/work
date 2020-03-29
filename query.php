<?php
include 'functions.php';
$mysqli = new mysqli(HOST, USER, PASS, DB);
$mysqli->set_charset('utf8');
if ($mysqli->connect_error) {
	die('Ошибка подключения(' . $mysqli->connect_errno . ')' . $mysqli->connect_error);
}
function getQueryForDelete($name, $attr, $arr, $mysqli){
	$str = $name .'.'.$attr.' IN';
	$total = count($arr);
	$counter = 0;
	foreach ($arr as $i => $item) {
		$counter++;
		if ($counter == 1) $str = $str . " (" . $item . ",";
		elseif ($counter !== $total) $str = $str . $item . ",";
		if ($counter == $total) $str = $str . $item . ")";
	}
	$sqlUpdate = "DELETE FROM `$name` WHERE $str";
	$mysqli->query($sqlUpdate);
}

function deleteSites($mysqli)
{
	$sql = "SELECT `data`.id_type FROM `data`";
	$resData = $mysqli->query($sql);
	$arResData = $resData->fetch_all(MYSQLI_ASSOC);
	$sql = "SELECT `type`.id_type FROM `type`";
	$resType = $mysqli->query($sql);
	$arResType = $resType->fetch_all(MYSQLI_ASSOC);
	$arValueType = [];
	$arValueData = [];

	foreach ($arResType as $arItem) {
		$arValueType[] = $arItem["id_type"];
	}
	foreach ($arResData as $arItem) {
		$arValueData[] = $arItem["id_type"];
	}
	$arRes = array_diff($arValueType, $arValueData);
	getQueryForDelete('type', 'id_type', $arRes, $mysqli);
}


if (!empty($_POST['ID']) && empty($_POST['JSON'])) {
	$id = $_POST['ID'];
	$sql = "SELECT
	 `sites`.NAME,
	 `sites`.ID,
	 `sites`.LINK
 FROM `sites` WHERE `sites`.ID = $id";
	$result = $mysqli->query($sql);
	$arrRes["ONE"] = $result->fetch_all(MYSQLI_ASSOC);
	$sql = "SELECT
	 `sites`.NAME,
	 `sites`.ID,
	 `sites`.LINK,
	 `data`.id_data,
	 `data`.VALUE,
	 `data`.id_type,
	 `data`.FIELD,
	 `type`.TYPE_NAME
 FROM `sites` INNER JOIN `data` ON `sites`.ID = `data`.ID
 INNER JOIN `type` ON `data`.id_type = `type`.id_type WHERE `sites`.ID = $id";
	$result = $mysqli->query($sql);
	$arrRes["TWO"] = $result->fetch_all(MYSQLI_ASSOC);
	$arrRes = json_encode($arrRes, true);
	echo $arrRes;
} else if (empty($_POST['JSON'])) {
	$sql = "SELECT * FROM `sites` WHERE PID>0";
	$result = $mysqli->query($sql);
	$arrRes = $result->fetch_all(MYSQLI_ASSOC);
	$arrRes = json_encode($arrRes, true);
	echo $arrRes;
}

if (!empty($_POST['JSON'])) {

	$json = json_decode($_POST['JSON']);
	$action = '';
	$inputName = '';
	$inputId = '';
	$inputValue = '';
	$inputType = '';
	if (!empty($json->action)) $action = $json->action;
	if (!empty($json->name)) $inputName = $json->name;
	if (!empty($json->id_input)) $inputId = $json->id_input;
	if (!empty($json->value)) $inputValue = $json->value;
	if (!empty($json->type)) $inputType = $json->type;
	switch ($action) {

		case "save":
			if ($inputName == 'TYPE') {
				$sqlUpdate = "UPDATE `type` SET `type`.TYPE_NAME = '$inputValue' WHERE `type`.id_type = $inputId";

			}
			elseif ($inputName == 'LINK'){
				$sqlUpdate = "UPDATE `sites` SET `sites`.LINK = '$inputValue' WHERE `sites`.ID = $inputId";
			}
			else $sqlUpdate = "UPDATE `data` SET `data`.$inputName = '$inputValue' WHERE `data`.id_data = $inputId";
			$mysqli->query($sqlUpdate);
			break;

		case "add":
			$inputSite = $json->site;
			$mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
			$sqlUpdate = "INSERT INTO `data` (`data`.VALUE, ID, `data`.id_type, FIELD) VALUES ('Значение', $inputSite, $inputId, 'Название')";
			$mysqli->query($sqlUpdate);
			$mysqli->commit();
			$sqlUpdate = "SELECT `data`.id_data,
 				`data`.VALUE,
 				`data`.FIELD,
 				`type`.id_type,
 				`type`.TYPE_NAME
 		FROM `data` INNER JOIN `type` ON `data`.id_type = `type`.id_type WHERE `data`.id_data = LAST_INSERT_ID()";
			$result = $mysqli->query($sqlUpdate);
			$arrRes = $result->fetch_all(MYSQLI_ASSOC);
			$arrRes = json_encode($arrRes, true);
			$mysqli->close();
			echo $arrRes;
			break;

		case "remove":
			$sqlUpdate = "DELETE FROM `data` WHERE `data`.id_data = $inputId";
			$mysqli->query($sqlUpdate);
			deleteSites($mysqli);
			break;

		case "createTypeRow":
			$inputSite = $json->site;
			$mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
			$sqlUpdate = "INSERT INTO `type` (`type`.TYPE_NAME) VALUES ('Название')";
			$mysqli->query($sqlUpdate);
			$mysqli->commit();
			$sqlUpdate = "INSERT INTO `data` (`data`.VALUE, ID, `data`.id_type, FIELD) VALUES ('Значение', $inputSite, LAST_INSERT_ID(), 'Название')";
			$mysqli->query($sqlUpdate);
			$mysqli->commit();
			$sqlUpdate = "SELECT `data`.id_data,
 				`data`.VALUE,
 				`data`.FIELD,
 				`type`.id_type,
 				`type`.TYPE_NAME
 		FROM `data` INNER JOIN `type` ON `data`.id_type = `type`.id_type WHERE `data`.id_data = LAST_INSERT_ID()";
			$result = $mysqli->query($sqlUpdate);
			$arrRes = $result->fetch_all(MYSQLI_ASSOC);
			$arrRes = json_encode($arrRes, true);
			$mysqli->close();
			echo $arrRes;
			break;

		case "saveGroup":
			$sqlUpdate = "UPDATE `sites` SET `sites`.NAME = '$inputValue' WHERE `sites`.ID = $inputId";
			$mysqli->query($sqlUpdate);
			break;

		case "addSite":
			$mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
			$sqlUpdate = "INSERT INTO `sites`  (`sites`.PID, `sites`.NAME ) VALUES ($inputId, 'Новый сайт')";
			$mysqli->query($sqlUpdate);
			$mysqli->commit();
			$sqlUpdate = "SELECT `sites`.ID, `sites`.PID, `sites`.NAME FROM `sites` WHERE  `sites`.ID=LAST_INSERT_ID()";
			$result = $mysqli->query($sqlUpdate);
			$arrRes = $result->fetch_all(MYSQLI_ASSOC);
			$arrRes = json_encode($arrRes, true);
			$mysqli->close();
			echo $arrRes;
			break;

		case "removeSite":
			$sqlUpdate = "DELETE FROM `data` WHERE `data`.ID = $inputId";
			$mysqli->query($sqlUpdate);
			$sql = "DELETE FROM `sites` WHERE `sites`.ID = $inputId";
			$mysqli->query($sql);
			deleteSites($mysqli);
			break;

		case "removeSection":
			$sql = "SELECT `sites`.ID FROM `sites` WHERE `sites`.PID = $inputId";
			$result = $mysqli->query($sql);
			$arResId = $result->fetch_all(MYSQLI_ASSOC);
			$arrRes = [];

			foreach ($arResId as $value){
				$arrRes[] = $value["ID"];
			}
			getQueryForDelete('data', 'ID', $arrRes, $mysqli);

			deleteSites($mysqli);
			$sql2 = "DELETE FROM `sites` WHERE `sites`.PID = $inputId OR `sites`.ID = $inputId";
			$mysqli->query($sql2);
			$mysqli->close();
			break;

		case "addSection":
			$mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
			$sqlUpdate = "INSERT INTO `sites` ( `sites`.NAME ) VALUES ('Новый раздел')";
			$mysqli->query($sqlUpdate);
			$mysqli->commit();
			$sqlUpdate = "SELECT `sites`.ID, `sites`.NAME FROM `sites` WHERE  `sites`.ID=LAST_INSERT_ID()";
			$result = $mysqli->query($sqlUpdate);
			$arrRes = $result->fetch_all(MYSQLI_ASSOC);
			$arrRes = json_encode($arrRes, true);
			$mysqli->close();
			echo $arrRes;
			break;
	}
}