<?php

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'TuViaje$2026#SecretKey!XyZ@RandomStr0ng');
define('JWT_TTL',    (int)(getenv('JWT_TTL') ?: 3600));
define('JWT_ALG',    getenv('JWT_ALG')    ?: 'HS256');
