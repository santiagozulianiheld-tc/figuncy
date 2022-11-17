# Figuncy

Te avisa si hay figuritas en el sitio ZonaKids con una notificación del File System.

Puedes agregar la configuracion SMTP de tu mail para notificarte via email.

[PROXIMAMENTE] Notificaciones por Telegram.

Ademas puedes forzar que se abra una pestaña de tu browser por defecto con la pagina para realizar la compra.

El tiempo esperado para volver a chequear por stock es de 30 segundos por default, pero puede ser configurado a gusto.

* Instalá Node.js
* Instalá las dependencias con `npm install`
* Corre `node index.js`. Otra opcion es correrlo con `npm start` o `npm start --` si se desea correr con algun argumento (por ejemplo, `npm start -- --help`)

# Argumentos
* `--help`                 
* `--host <host>`          (SMTP host para el envio de emails)
* `--port <port>`          (SMTP port para el envio de emails)
* `--username <username>`  (SMTP username para el envio de emails)
* `--password <password>`  (SMTP password para el envio de emails)
* `--sendto <sendto>`      (Emails destinatarios separados por coma)
* `--force`                (Si se desea forzar que se abra una pestaña del browser cuando se encuentre stock)
* `--seconds <seconds>`    (Segundos esperados hasta volver a revisar el stock nuevamente)