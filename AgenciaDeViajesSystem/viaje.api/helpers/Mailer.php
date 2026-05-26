<?php


 // Mailer — envío de emails en texto plano.

 // Si hay SMTP_HOST configurado en el entorno, usa un cliente SMTP custom
 // con sockets. Si no, cae al mail() nativo de PHP.

class Mailer {

    public static function send(string $to, string $subject, string $body): bool {
        try {
            if (getenv('SMTP_HOST')) {
                return self::sendSMTP($to, $subject, $body);
            }
            return self::sendNative($to, $subject, $body);
        } catch (\Throwable $e) {
            error_log('[Mailer] send fallido: ' . $e->getMessage());
            return false;
        }
    }

    public static function sendBienvenida(string $name, string $email): bool {
        return self::send(
            $email,
            '¡Bienvenido a TuViaje!',
            self::buildBienvenidaBody($name)
        );
    }

    public static function buildBienvenidaBody(string $name): string {
        $nombre = trim($name) !== '' ? $name : 'viajero';
        $appUrl = self::appUrl();
        return
            "Hola {$nombre},\n\n" .
            "¡Gracias por registrarte en TuViaje!\n\n" .
            "Tu cuenta fue creada con éxito. Ya puedes iniciar sesión y explorar\n" .
            "nuestros destinos en {$appUrl}\n\n" .
            "Si no fuiste tú quien creó esta cuenta, ignora este mensaje.\n\n" .
            "— El equipo de TuViaje\n";
    }

    public static function sendReservaConfirmacion(string $name, string $email, array $reserva): bool {
        return self::send(
            $email,
            'Reserva confirmada — TuViaje',
            self::buildReservaConfirmacionBody($name, $reserva)
        );
    }

    public static function buildReservaConfirmacionBody(string $name, array $reserva): string {
        $nombre   = trim($name) !== '' ? $name : 'viajero';
        $titulo   = $reserva['title']       ?? 'tu viaje';
        $destino  = $reserva['destination'] ?? '';
        $inicio   = self::fmtDate($reserva['start_date'] ?? null);
        $fin      = self::fmtDate($reserva['end_date']   ?? null);
        $personas = (int) ($reserva['personas'] ?? 1);
        $monto    = number_format((float) ($reserva['monto'] ?? 0), 2, ',', '.');
        $codigo   = $reserva['id'] ?? '';
        $appUrl   = self::appUrl();

        return
            "Hola {$nombre},\n\n" .
            "¡Tu reserva fue confirmada!\n\n" .
            "Detalles:\n" .
            "  Código de reserva: #{$codigo}\n" .
            "  Viaje: {$titulo}\n" .
            ($destino ? "  Destino: {$destino}\n" : '') .
            ($inicio  ? "  Salida: {$inicio}\n"  : '') .
            ($fin     ? "  Regreso: {$fin}\n"   : '') .
            "  Personas: {$personas}\n" .
            "  Total abonado: \$ {$monto}\n\n" .
            "Puedes ver tus reservas en cualquier momento desde tu perfil:\n" .
            "{$appUrl}/perfil\n\n" .
            "¡Buen viaje!\n\n" .
            "— El equipo de TuViaje\n";
    }

    public static function sendReservaCancelacion(string $name, string $email, array $reserva): bool {
        return self::send(
            $email,
            'Reserva cancelada — TuViaje',
            self::buildReservaCancelacionBody($name, $reserva)
        );
    }

    public static function buildReservaCancelacionBody(string $name, array $reserva): string {
        $nombre  = trim($name) !== '' ? $name : 'viajero';
        $titulo  = $reserva['title'] ?? 'tu viaje';
        $codigo  = $reserva['id'] ?? '';
        $monto   = number_format((float) ($reserva['monto'] ?? 0), 2, ',', '.');
        $appUrl  = self::appUrl();

        return
            "Hola {$nombre},\n\n" .
            "Confirmamos la cancelación de tu reserva #{$codigo} ({$titulo}).\n\n" .
            "Los cupos fueron liberados y, si aplica, el reintegro de \$ {$monto}\n" .
            "se procesará según el medio de pago original.\n\n" .
            "Si no solicitaste esta cancelación, contáctanos respondiendo a este mail.\n\n" .
            "Puedes explorar otros destinos en {$appUrl}\n\n" .
            "— El equipo de TuViaje\n";
    }

    public static function sendReembolsoProcesado(string $name, string $email, array $reserva): bool {
        return self::send(
            $email,
            'Reembolso procesado — TuViaje',
            self::buildReembolsoProcesadoBody($name, $reserva)
        );
    }

    public static function buildReembolsoProcesadoBody(string $name, array $reserva): string {
        $nombre   = trim($name) !== '' ? $name : 'viajero';
        $titulo   = $reserva['title']       ?? 'tu viaje';
        $codigo   = $reserva['id'] ?? '';
        $monto    = number_format((float) ($reserva['monto'] ?? 0), 2, ',', '.');
        $appUrl   = self::appUrl();

        return
            "Hola {$nombre},\n\n" .
            "Tu reembolso ha sido procesado correctamente.\n\n" .
            "Detalles del reembolso:\n" .
            "  Código de reserva: #{$codigo}\n" .
            "  Viaje: {$titulo}\n" .
            "  Monto reembolsado: \$ {$monto}\n\n" .
            "El importe se acreditará en el mismo medio de pago dentro de unos días hábiles.\n\n" .
            "Si tienes alguna pregunta, responde a este correo.\n\n" .
            "Puedes revisar tus reservas o buscar otros destinos en {$appUrl}\n\n" .
            "— El equipo de TuViaje\n";
    }

    public static function sendPasswordReset(string $name, string $email, string $token): bool {
        return self::send(
            $email,
            'Restablecer tu contraseña — TuViaje',
            self::buildPasswordResetBody($name, $token)
        );
    }

    public static function buildPasswordResetBody(string $name, string $token): string {
        $nombre = trim($name) !== '' ? $name : 'viajero';
        $appUrl = self::appUrl();
        $link   = "{$appUrl}/reset-password/{$token}";

        return
            "Hola {$nombre},\n\n" .
            "Recibimos una solicitud para restablecer tu contraseña.\n" .
            "Para crear una nueva, abre el siguiente enlace (válido por 1 hora):\n\n" .
            "{$link}\n\n" .
            "Si no fuiste tú, ignora este mensaje — tu contraseña no cambiará.\n\n" .
            "— El equipo de TuViaje\n";
    }

    private static function appUrl(): string {
        $url = getenv('APP_URL');
        return $url !== false && $url !== '' ? rtrim($url, '/') : 'http://localhost:5173';
    }

    private static function fmtDate(?string $raw): string {
        if (!$raw) return '';
        $ts = strtotime($raw);
        return $ts ? date('d/m/Y', $ts) : (string) $raw;
    }


    private static function sendNative(string $to, string $subject, string $body): bool {
        $from     = getenv('MAIL_FROM')      ?: 'no-reply@tuviaje.com';
        $fromName = getenv('MAIL_FROM_NAME') ?: 'TuViaje';

        $headers = [
            'From: '         . self::encodeHeader($fromName) . " <{$from}>",
            'Reply-To: '     . "<{$from}>",
            'MIME-Version: ' . '1.0',
            'Content-Type: ' . 'text/plain; charset=UTF-8',
        ];

        $ok = @mail($to, self::encodeHeader($subject), $body, implode("\r\n", $headers));
        if (!$ok) {
            error_log('[Mailer] mail() nativo falló para ' . $to);
        }
        return (bool) $ok;
    }

    

    private static function sendSMTP(string $to, string $subject, string $body): bool {
        $host   = (string) getenv('SMTP_HOST');
        $port   = (int)   (getenv('SMTP_PORT')   ?: 587);
        $user   = (string) getenv('SMTP_USER');
        $pass   = (string) getenv('SMTP_PASS');
        $secure = strtolower((string) (getenv('SMTP_SECURE') ?: ''));
        $from   = getenv('MAIL_FROM')      ?: 'no-reply@tuviaje.com';
        $fromName = getenv('MAIL_FROM_NAME') ?: 'TuViaje';

        $address = $secure === 'ssl' ? "ssl://{$host}" : $host;
        $sock    = @fsockopen($address, $port, $errno, $errstr, 10);
        if (!$sock) {
            error_log("[Mailer] fsockopen falló: {$errstr} ({$errno})");
            return false;
        }
        stream_set_timeout($sock, 15);

        try {
            self::readResponse($sock, 220);
            self::cmd($sock, "EHLO localhost", 250);

            if ($secure === 'tls') {
                self::cmd($sock, "STARTTLS", 220);
                if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new \Exception('STARTTLS handshake falló');
                }
                self::cmd($sock, "EHLO localhost", 250);
            }

            if ($user !== '' && $pass !== '') {
                self::cmd($sock, "AUTH LOGIN", 334);
                self::cmd($sock, base64_encode($user), 334);
                self::cmd($sock, base64_encode($pass), 235);
            }

            self::cmd($sock, "MAIL FROM:<{$from}>", 250);
            self::cmd($sock, "RCPT TO:<{$to}>", 250);
            self::cmd($sock, "DATA", 354);

            $data =
                'From: '         . self::encodeHeader($fromName) . " <{$from}>\r\n" .
                'To: '           . "<{$to}>\r\n" .
                'Subject: '      . self::encodeHeader($subject) . "\r\n" .
                'MIME-Version: ' . "1.0\r\n" .
                'Content-Type: ' . "text/plain; charset=UTF-8\r\n" .
                'Date: '         . date('r') . "\r\n" .
                "\r\n" .
                str_replace("\n.", "\n..", str_replace("\r\n", "\n", $body)) .
                "\r\n.";
            self::cmd($sock, $data, 250);

            @fwrite($sock, "QUIT\r\n");
            return true;
        } catch (\Throwable $e) {
            error_log('[Mailer] SMTP falló: ' . $e->getMessage());
            return false;
        } finally {
            @fclose($sock);
        }
    }

    private static function cmd($sock, string $command, int $expectedCode): void {
        @fwrite($sock, $command . "\r\n");
        self::readResponse($sock, $expectedCode);
    }

    private static function readResponse($sock, int $expectedCode): string {
        $response = '';
        while (($line = fgets($sock, 515)) !== false) {
            $response .= $line;
            // Última línea si el cuarto carácter es un espacio (formato SMTP)
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        $code = (int) substr($response, 0, 3);
        if ($code !== $expectedCode) {
            throw new \Exception("Esperaba código {$expectedCode}, obtuvo: " . trim($response));
        }
        return $response;
    }

    private static function encodeHeader(string $value): string {
        if (preg_match('/[^\x20-\x7e]/', $value)) {
            return '=?UTF-8?B?' . base64_encode($value) . '?=';
        }
        return $value;
    }
}
