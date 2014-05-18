<?php
$mirrors_file = "";
switch ($_GET["file"])
{
    case "ra-packages":
        $mirrors_file = "packages/ra-mirrors.txt";
        break;
    case "cnc-packages":
        $mirrors_file = "packages/cnc-mirrors.txt";
        break;
    case "d2k-103-packages":
        $mirrors_file = "packages/d2k-103-mirrors.txt";
        break;
    case "ts-packages":
        $mirrors_file = "packages/ts-mirrors.txt";
        break;
    default:
        break;
}

if ($mirrors_file != "")
{
	$mirrors = file_get_contents($mirrors_file);
	$mirrors_array = explode("\n", $mirrors);

	$mirror = $mirrors_array[array_rand($mirrors_array, 1)];
}

if (isset($mirror))
	header('Location: '. $mirror);
else
	header('Status: 404 Not Found');
?>
