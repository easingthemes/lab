<?php
/**
 * Simple PHP Git deploy script
 *
 * Download folder from git with PHP and Svn.
 *
 * @version 1.0.0
 * @link    https://github.com/easingthemes
 */

// =========================================[ Configuration start ]===
$configAccess = true;
if (file_exists(basename(__FILE__, '.php').'-config.php')) {
	define('CONFIG_FILE', basename(__FILE__, '.php').'-config.php');
	require_once CONFIG_FILE;
} else {
	define('CONFIG_FILE', __FILE__);
}
$configAccess = false;

if (!defined('SECRET_ACCESS_TOKEN')) define('SECRET_ACCESS_TOKEN', 'PleaseChangeMe');
if (!defined('TARGET_DIR_DEFAULT')) define('TARGET_DIR_DEFAULT', './');
if (!defined('TIME_LIMIT')) define('TIME_LIMIT', 30);
if (!defined('TOKEN_PARAM')) define('TOKEN_PARAM', 'token');
if (!defined('REPO_PARAM')) define('REPO_PARAM', 'repo');
if (!defined('TARGET_DIR_PARAM')) define('TARGET_DIR_PARAM', 'target');

// ===========================================[ Configuration end ]===

// ===========================================[ Get params ]===
$token = $_GET[TOKEN_PARAM];
$repo = $_GET[REPO_PARAM];
$targetDir = isset($_GET[TARGET_DIR_PARAM]) ? $_GET[TARGET_DIR_PARAM] : TARGET_DIR_DEFAULT);

$isNotValid = !isset($token) || $token !== SECRET_ACCESS_TOKEN || $token == 'PleaseChangeMe' || !isset($repo) || !filter_var($repo, FILTER_VALIDATE_URL) || !is_dir($targetDir);

// If there's authorization error, set the correct HTTP header.
if ($isNotValid) {
	header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden', true, 403);
}
ob_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="robots" content="noindex">
	<title>Simple PHP Svn deploy script</title>
	<style>
		body { padding: 0 1em; background: #222; color: #fff; }
		h2, .error { color: #c33; }
		.prompt { color: #6be234; }
		.command { color: #729fcf; }
		.output { color: #999; }
	</style>
</head>
<body>
<?php
if ($isNotValid) {
	header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden', true, 403);
	die('<h2>ACCESS DENIED!</h2>');
}
?>
<pre>

Checking the environment ...

Running as <b><?php echo trim(shell_exec('whoami')); ?></b>.

	<?php
// Check if the required programs are available
$requiredBinaries = array('svn');

foreach ($requiredBinaries as $command) {
	$path = trim(shell_exec('which '.$command));
	if ($path == '') {
		header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
		die(sprintf('<div class="error"><b>%s</b> not available. It needs to be installed on the server for this script to work.</div>', $command));
	} else {
		$version = explode("\n", shell_exec($command.' --version'));
		printf('<b>%s</b> : %s'."\n"
			, $path
			, $version[0]
		);
	}
}
?>

Environment OK.

Deploying <?php echo $repo; ?> <?php echo "\n"; ?>
	to        <?php echo $targetDir; ?> ...

	<?php
// The commands
$commands = array();

// ========================================[ Define deployment command ]===

// Download the repository into the $targetDir
$commands[] = sprintf(
	'svn export %s %s --force'
	, $repo
	, $targetDir
);

// =======================================[ Run the command ]===
$output = '';
foreach ($commands as $command) {
	set_time_limit(TIME_LIMIT); // Reset the time limit for each command
	if (file_exists($targetDir) && is_dir($targetDir)) {
		chdir($targetDir); // Ensure that we're in the right directory
	}
	$tmp = array();
	exec($command.' 2>&1', $tmp, $return_code); // Execute the command
	// Output the result
	printf('
<span class="prompt">$</span> <span class="command">%s</span>
<div class="output">%s</div>
'
		, htmlentities(trim($command))
		, htmlentities(trim(implode("\n", $tmp)))
	);
	$output .= ob_get_contents();
	ob_flush(); // Try to output everything as it happens

	// Error handling and cleanup
	if ($return_code !== 0) {
		header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
		printf('
<div class="error">
Error encountered!
Stopping the script to prevent possible data loss.
CHECK THE DATA IN YOUR TARGET DIR!
</div>
'
		);

		$error = sprintf(
			'Deployment error on %s using %s!'
			, $_SERVER['HTTP_HOST']
			, __FILE__
		);
		error_log($error);
		break;
	}
}
?>

Done.
</pre>
</body>
</html>
