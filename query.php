<?php
include 'functions.php';
$mysqli = new mysqli(HOST, USER, PASS, DB);
$mysqli->set_charset('utf8');
if ($mysqli->connect_error) {
	die('Ошибка подключения(' . $mysqli->connect_errno . ')' . $mysqli->connect_error);
}


if (!empty($_POST['ID']) && empty($_POST['JSON'])){
	$id = $_POST['ID'];
	$sql2 = "SELECT
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
	$result = $mysqli->query($sql2);
	$arrRes = $result->fetch_all(MYSQLI_ASSOC);
	$arrRes = json_encode($arrRes, true);
	echo $arrRes;
}
else if(empty($_POST['JSON'])){
	$sql = "SELECT * FROM `sites` WHERE PID>0";
	$result = $mysqli->query($sql);
	$arrRes = $result->fetch_all(MYSQLI_ASSOC);
	$arrRes = json_encode($arrRes, true);
	echo $arrRes;
}

if (!empty($_POST['JSON'])){

	$json = json_decode($_POST['JSON']);
	$action = $json->action;
	$inputName = $json->name;
	$inputId = $json->id_input;
	$inputValue = $json->value;
	$inputType = $json->type;

	if($action === 'save') {
		if ($inputName !== 'TYPE') {
			$sqlUpdate = "UPDATE `data` SET `data`.$inputName = '$inputValue' WHERE `data`.id_data = $inputId";
		}
		else $sqlUpdate = "UPDATE `type` SET `type`.TYPE_NAME = '$inputValue' WHERE `type`.id_type = $inputId";
	}
	if($action === 'add') {
		$inputSite = $json->site;
		$sqlUpdate = "INSERT INTO `data` (`data`.VALUE, ID, `data`.id_type, FIELD) VALUES ('Значение', $inputSite, $inputId, 'Название')";
	}
	if($action === 'remove') {
		$sqlUpdate = "DELETE FROM `data` WHERE `data`.id_data = $inputId";
	}
	if($action === 'createTypeRow') {
		$inputSite = $json->site;
		$mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
		$sqlUpdate = "INSERT INTO `type` (`type`.TYPE_NAME) VALUES ('Название')";
		$mysqli->query($sqlUpdate);
		$mysqli->commit();
		$sqlUpdate = "INSERT INTO `data` (`data`.VALUE, ID, `data`.id_type, FIELD) VALUES ('Значение', $inputSite, LAST_INSERT_ID(), 'Название')";
		$mysqli->query($sqlUpdate);
		$mysqli->close();
	}
	if ($mysqli->query($sqlUpdate) === TRUE) {
		echo "Record updated successfully";
	} else {
		echo "Error updating record: " . $mysqli->error;
	}
}


