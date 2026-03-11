<?php
require_once(__DIR__ . '/Env.php');
loadEnv(__DIR__ . '/../.env');

header('Content-Type: application/javascript; charset=utf-8');

$mapboxToken = getenv('MAPBOX_ACCESS_TOKEN') ?: '';

echo 'window.APP_CONFIG = window.APP_CONFIG || {};' . "\n";
echo 'window.APP_CONFIG.mapboxAccessToken = ' . json_encode($mapboxToken, JSON_UNESCAPED_SLASHES) . ';' . "\n";
