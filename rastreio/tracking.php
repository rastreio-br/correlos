<?php
if (isset($_GET['code']) || (isset($_POST['objeto']) && $_SERVER['REQUEST_METHOD'] === 'POST')) {
    // Pega o código da requisição GET ou POST
    $code = isset($_GET['code']) ? $_GET['code'] : $_POST['objeto'];
    $code = filter_var($code, FILTER_SANITIZE_STRING);  // Sanitiza o código para segurança
    $currentTime = time();
    $filename = 'codigos.txt';

    // Função para verificar a diferença de tempo em horas
    function hoursDifference($timestamp1, $timestamp2) {
        return abs($timestamp2 - $timestamp1) / 3600;
    }

    // Define os intervalos em horas
    $hoursFortransito = 2 * 24;       // 2 dias
    $hoursForcaminho = 4 * 24;        // 4 dias
    $hoursForcidade = 6 * 24;         // 6 dias
    $hoursForrotadeentrega = 8 * 24;  // 8 dias
    $hoursForentrega = 9 * 24;       // 9 dias
    $hoursFortentativa = 13 * 24;     // 13 dias
    $hoursFordevolvido = 15 * 24;     // 15 dias

    // Lê o conteúdo do arquivo
    $fileContents = file_exists($filename) ? file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];

    // Verifica se o código já está no arquivo
    $found = false;
    foreach ($fileContents as $line) {
        list($storedCode, $storedTimestamp) = explode(',', $line);
        $storedTimestamp = (int)$storedTimestamp;  // Converter para inteiro
        if ($storedCode === $code) {
            $found = true;
            $hoursDiff = hoursDifference($storedTimestamp, $currentTime);

            // Verifica o tempo decorrido e redireciona para a página correta
            if ($hoursDiff < $hoursFortransito) {
                header("Location: /tracking/transito/?code=" . urlencode($code));
            } elseif ($hoursDiff < $hoursForcaminho) {
                header("Location: /tracking/caminho/?code=" . urlencode($code));
            } elseif ($hoursDiff < $hoursForcidade) {
                header("Location: /tracking/cidade/?code=" . urlencode($code));
            } elseif ($hoursDiff < $hoursForrotadeentrega) {
                header("Location: /tracking/rotadeentrega/?code=" . urlencode($code));
            } elseif ($hoursDiff < $hoursForentrega) {
                header("Location: /tracking/entrega/?code=" . urlencode($code));
            } elseif ($hoursDiff < $hoursFortentativa) {
                header("Location: /tracking/entrega/?code=" . urlencode($code));
            } elseif ($hoursDiff < $hoursFordevolvido) {
                header("Location: /tracking/entrega/?code=" . urlencode($code));
            } else {
                // Se o código for muito antigo, redireciona para página de expirado
                header("Location: /tracking/entrega/?code=" . urlencode($code));
            }
            exit;
        }
    }

    // Se o código não foi encontrado, adiciona ao arquivo e retorna a etapa 'preparando'
    if (!$found) {
        $file = fopen($filename, 'a');
        if ($file) {
            fwrite($file, "$code,$currentTime\n");
            fclose($file);
        } else {
            die("Erro ao abrir o arquivo para escrita.");
        }
        header("Location: /tracking/postado/?code=" . urlencode($code));
        exit;
    }
}
?>
