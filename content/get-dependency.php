<?php

// === configuration ===

// Minimal interval between mail notifies about mirrors problems

define('NOTIFY_MININTERVAL',		1800 /* 30 min */);
define('MIRRORCHECK_MININTERVAL',	 600 /* 10 min */);

// === program ===

session_id('true');
session_name('global');
session_start();
$time = time();

error_log(serialize($_SESSION));

$mirrors_file = FALSE;
switch ($_GET["file"])
{
	case "ra-packages":
		$mirrors_file = "packages/ra-mirrors.txt";
		break;
	case "cnc-packages":
		$mirrors_file = "packages/cnc-mirrors.txt";
		break;
	case "d2k-packages":
		$mirrors_file = "packages/d2k-mirrors.txt";
		break;
	case "d2k-complete-packages":
		$mirrors_file = "packages/d2k-complete-mirrors.txt";
		break;
	case "d2k-103-packages":
		$mirrors_file = "packages/d2k-103-mirrors.txt";
		break;
	case "ts-packages":
		$mirrors_file = "packages/ts-mirrors.txt";
		break;
	case "osx-deps-v2":
		$mirrors_file = "releases/mac/osx-dependencies-mirrors.txt";
		break;
	case "osx-deps-v3":
		$mirrors_file = "releases/mac/osx-dependencies-mirrors-v3.txt";
		break;
	case "osx-deps-v4":
		$mirrors_file = "releases/mac/osx-dependencies-mirrors-v4.txt";
		break;
	case "freetype":
		$mirrors_file = "releases/windows/freetype-mirrors.txt";
		break;
	case "cg":
		$mirrors_file = "releases/windows/cg-mirrors.txt";
		break;
	case "sdl":
		$mirrors_file = "releases/windows/sdl-mirrors.txt";
		break;
	case "openal":
		$mirrors_file = "releases/windows/openal-mirrors.txt";
		break;
	case "dmclglcd":
		$mirrors_file = "releases/windows/dmclglcd-mirrors.txt";
		break;
	default:
		break;
}

if ($mirrors_file !== FALSE)
{
	$errors		= array();

	// Getting mirrors

	$mirrors 	= file_get_contents($mirrors_file);
	$mirrors_array 	= explode("\n", $mirrors);

	// Choosing the mirror

	$ctx_goodhttp = stream_context_create(array( 
		'http' => array( 
				'timeout' => 1 
			) 
		) 
	);

	$success = FALSE;
	shuffle($mirrors_array);
	foreach ($mirrors_array as $mirror)
	{
		if($mirror == "")
			continue;

		// Is the mirror recently checked?
		$time_check_last = isset($_SESSION['last']['time']['check'][$mirror]) ? 
					 $_SESSION['last']['time']['check'][$mirror]  :
					 0;
		
		if ($time > $time_check_last + MIRRORCHECK_MININTERVAL)
		{
			// Checking the mirror
			$success = @file_get_contents($mirror, false, $ctx_goodhttp, -1, 1) !== FALSE;
			if($success === FALSE)
				$errors[] = "Unable to download ".$mirror.".";	// Remembering the error

			$_SESSION['last']['time']['check'][$mirror] 	= $time;
			$_SESSION['last']['status'][$mirror]		= $success;
		}
		else
		{
			$success = $_SESSION['last']['status'][$mirror];
		}

		if($success !== FALSE)	// We've found good mirror, no need to continue the search
			break;
	}

	// Sending a notification email about found failures

/* To which email address?

	if(count($errors)>0) {
		$time_notify_last = $_SESSION['last']['time']['notify'];
		if($time > $time_notify_last + NOTIFY_MININTERVAL) {
			mail("mirror-notify@open-ra.org", "Bad mirror(s)",
				join("\n", $errors));
			$_SESSION['last']['time']['notify'] = $time;
		}
	}
*/
}

// Result

if (isset($mirror))
	header('Location: '. $mirror);		// Redirecting to the mirror, if found
else
	header('Status: 404 Not Found');	// Otherwise



?>
