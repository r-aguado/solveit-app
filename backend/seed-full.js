const pool = require('./src/db');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash('password', 10);

    // ── USUARIOS ──────────────────────────────────────────────────────────
    const users = [
      // Admins
      { name: 'Rubén Aguado Perulero',    email: 'r.aguado@solveit.com',      role: 'admin',      department: 'IT' },
      { name: 'Elena Navarro Castillo',   email: 'e.navarro@solveit.com',     role: 'admin',      department: 'IT' },
      // Técnicos
      { name: 'Carlos García Romero',     email: 'c.garcia@solveit.com',      role: 'technician', department: 'IT' },
      { name: 'Laura Martínez Vega',      email: 'l.martinez@solveit.com',    role: 'technician', department: 'Sistemas' },
      { name: 'Javier Fernández Mora',    email: 'j.fernandez@solveit.com',   role: 'technician', department: 'Redes' },
      { name: 'Sofía Jiménez Ruiz',       email: 's.jimenez@solveit.com',     role: 'technician', department: 'IT' },
      { name: 'Andrés Molina Serrano',    email: 'a.molina@solveit.com',      role: 'technician', department: 'Sistemas' },
      // Usuarios
      { name: 'Pedro López Herrera',      email: 'p.lopez@solveit.com',       role: 'user',       department: 'RRHH' },
      { name: 'Ana Sánchez Iglesias',     email: 'a.sanchez@solveit.com',     role: 'user',       department: 'Contabilidad' },
      { name: 'Miguel Torres Blanco',     email: 'm.torres@solveit.com',      role: 'user',       department: 'Ventas' },
      { name: 'Isabel Ramírez Campos',    email: 'i.ramirez@solveit.com',     role: 'user',       department: 'Marketing' },
      { name: 'Francisco Moreno Reyes',   email: 'f.moreno@solveit.com',      role: 'user',       department: 'Compras' },
      { name: 'Carmen Díaz Fuentes',      email: 'c.diaz@solveit.com',        role: 'user',       department: 'RRHH' },
      { name: 'Alejandro Ruiz Peña',      email: 'a.ruiz@solveit.com',        role: 'user',       department: 'Ventas' },
      { name: 'Lucía Gómez Santana',      email: 'l.gomez@solveit.com',       role: 'user',       department: 'Contabilidad' },
      { name: 'Sergio Álvarez Medina',    email: 's.alvarez@solveit.com',     role: 'user',       department: 'Logística' },
      { name: 'Marta Ibáñez Cordero',     email: 'm.ibanez@solveit.com',      role: 'user',       department: 'Atención al cliente' },
      { name: 'David Ortega Lozano',      email: 'd.ortega@solveit.com',      role: 'user',       department: 'Marketing' },
      { name: 'Patricia Vargas Nieto',    email: 'p.vargas@solveit.com',      role: 'user',       department: 'Compras' },
      { name: 'Raúl Cano Espinosa',       email: 'r.cano@solveit.com',        role: 'user',       department: 'Logística' },
    ];

    // Elimina usuarios de prueba antiguos y los vuelve a insertar
    for (const u of users) {
      await client.query(`
        INSERT INTO users (name, email, password, role, department)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET name=$1, role=$4, department=$5
      `, [u.name, u.email, hash, u.role, u.department]);
    }
    console.log(`✓ ${users.length} usuarios creados/actualizados`);

    // ── CATEGORÍAS ────────────────────────────────────────────────────────
    const cats = await client.query('SELECT id, name FROM categories');
    const catMap = {};
    cats.rows.forEach(c => { catMap[c.name] = c.id; });

    // ── OBTENER IDs ───────────────────────────────────────────────────────
    const usersDB = await client.query('SELECT id, email, role FROM users');
    const byEmail = {};
    usersDB.rows.forEach(u => { byEmail[u.email] = u.id; });

    const techs  = usersDB.rows.filter(u => u.role === 'technician').map(u => u.id);
    const admins = usersDB.rows.filter(u => u.role === 'admin').map(u => u.id);
    const normal = usersDB.rows.filter(u => u.role === 'user').map(u => u.id);

    // ── INCIDENCIAS ───────────────────────────────────────────────────────
    const incidentsData = [
      {
        title: 'El ordenador no enciende al pulsar el botón',
        description: 'Al llegar esta mañana pulso el botón de encendido y no ocurre nada. No hay luces ni pitidos. El cable de alimentación está bien conectado.',
        status: 'resolved', priority: 'high',
        created_by: byEmail['p.lopez@solveit.com'],
        assigned_to: techs[0],
        comments: [
          { user: techs[0], msg: 'Buenos días Pedro. ¿Podrías comprobar si la regleta tiene corriente? A veces el problema es tan sencillo como eso.' },
          { user: byEmail['p.lopez@solveit.com'], msg: 'Acabo de probarlo con otra regleta y sigue igual.' },
          { user: techs[0], msg: 'Voy a pasarme por tu puesto en 10 minutos para revisarlo.' },
          { user: techs[0], msg: 'Revisado. La fuente de alimentación estaba quemada. He instalado una de repuesto del almacén.' },
          { user: byEmail['p.lopez@solveit.com'], msg: 'Perfecto, ya funciona. Muchas gracias Carlos!' },
        ]
      },
      {
        title: 'No puedo acceder a la VPN desde casa',
        description: 'Intento conectarme a la VPN corporativa desde mi domicilio y me da error de autenticación aunque la contraseña es correcta.',
        status: 'resolved', priority: 'medium',
        created_by: byEmail['m.torres@solveit.com'],
        assigned_to: techs[2],
        comments: [
          { user: techs[2], msg: '¿Qué cliente VPN estás usando y qué mensaje de error exacto aparece?' },
          { user: byEmail['m.torres@solveit.com'], msg: 'Uso el FortiClient y pone "Authentication failed".' },
          { user: techs[2], msg: 'Tu certificado de usuario ha caducado. Voy a renovártelo ahora.' },
          { user: techs[2], msg: 'Ya he renovado el certificado. Cierra y vuelve a abrir el FortiClient.' },
          { user: byEmail['m.torres@solveit.com'], msg: 'Ya conecta perfectamente. Gracias Javier!' },
        ]
      },
      {
        title: 'Outlook no envía correos, se quedan en bandeja de salida',
        description: 'Desde ayer todos los correos que envío se quedan en la bandeja de salida y no se entregan. Recibo correos sin problema.',
        status: 'resolved', priority: 'medium',
        created_by: byEmail['a.sanchez@solveit.com'],
        assigned_to: techs[1],
        comments: [
          { user: techs[1], msg: 'Hola Ana. ¿Cuándo empezó exactamente el problema? ¿Después de alguna actualización?' },
          { user: byEmail['a.sanchez@solveit.com'], msg: 'Creo que fue tras reiniciar el equipo ayer por la tarde.' },
          { user: techs[1], msg: 'El perfil de Outlook se ha corrompido. Voy a repararlo remotamente.' },
          { user: techs[1], msg: 'He reparado el perfil y borrado la caché OST. Prueba a enviar un correo de prueba.' },
          { user: byEmail['a.sanchez@solveit.com'], msg: 'Funcionando perfectamente. Muchas gracias Laura!' },
        ]
      },
      {
        title: 'Pantalla azul al iniciar Windows con código KERNEL_SECURITY_CHECK_FAILURE',
        description: 'El equipo aparece pantalla azul al arrancar con el código KERNEL_SECURITY_CHECK_FAILURE. He podido acceder en modo seguro.',
        status: 'resolved', priority: 'high',
        created_by: byEmail['f.moreno@solveit.com'],
        assigned_to: techs[0],
        comments: [
          { user: techs[0], msg: 'Desde modo seguro ejecuta: sfc /scannow y pásame el resultado.' },
          { user: byEmail['f.moreno@solveit.com'], msg: 'Dice "Windows encontró archivos dañados pero no pudo reparar algunos de ellos".' },
          { user: techs[0], msg: 'Voy a conectarme remotamente para ejecutar DISM y reparar la imagen del sistema.' },
          { user: techs[0], msg: 'El problema era un driver de tarjeta gráfica corrupto. He reinstalado el driver limpio.' },
          { user: byEmail['f.moreno@solveit.com'], msg: 'Perfecto, ya arranca sin problemas. Gracias!' },
        ]
      },
      {
        title: 'La impresora de planta 2 no imprime desde ningún equipo',
        description: 'La impresora HP LaserJet de la planta 2 no imprime desde esta mañana. Los trabajos quedan en cola pero no salen.',
        status: 'resolved', priority: 'medium',
        created_by: byEmail['c.diaz@solveit.com'],
        assigned_to: techs[1],
        comments: [
          { user: techs[1], msg: 'Voy a revisar el servidor de impresión. ¿La impresora tiene luces de error encendidas?' },
          { user: byEmail['c.diaz@solveit.com'], msg: 'La luz naranja parpadea.' },
          { user: techs[1], msg: 'Hay un atasco de papel en el interior, en la unidad dúplex. He limpiado la impresora.' },
          { user: techs[1], msg: 'También he reiniciado el spooler de impresión en el servidor. Ya debería funcionar.' },
          { user: byEmail['c.diaz@solveit.com'], msg: 'Confirmado, ya imprime. Gracias Laura!' },
        ]
      },
      {
        title: 'No tengo acceso al servidor de archivos compartidos',
        description: 'Desde esta mañana no puedo acceder a la carpeta compartida \\\\servidor\\documentos. Me pide credenciales y no acepta las mías.',
        status: 'in_progress', priority: 'medium',
        created_by: byEmail['i.ramirez@solveit.com'],
        assigned_to: techs[2],
        comments: [
          { user: techs[2], msg: 'Estoy revisando los permisos en Active Directory. ¿Desde qué equipo intentas acceder?' },
          { user: byEmail['i.ramirez@solveit.com'], msg: 'Desde mi portátil habitual, el Dell Latitude.' },
          { user: techs[2], msg: 'Tu cuenta fue movida de grupo accidentalmente durante una reorganización. Estoy restaurando los permisos.' },
        ]
      },
      {
        title: 'El ratón inalámbrico deja de funcionar cada pocos minutos',
        description: 'El ratón se congela cada pocos minutos y tengo que quitarle y ponerle la pila para que vuelva a funcionar.',
        status: 'open', priority: 'low',
        created_by: byEmail['a.ruiz@solveit.com'],
        assigned_to: null,
        comments: []
      },
      {
        title: 'No puedo instalar Teams, da error de permisos',
        description: 'Intento instalar Microsoft Teams y aparece el error "No tienes permisos para instalar software en este equipo".',
        status: 'open', priority: 'low',
        created_by: byEmail['l.gomez@solveit.com'],
        assigned_to: null,
        comments: []
      },
      {
        title: 'El monitor secundario no es detectado',
        description: 'He conectado un segundo monitor por HDMI pero Windows no lo detecta. El cable funciona porque lo he probado en otro equipo.',
        status: 'resolved', priority: 'low',
        created_by: byEmail['s.alvarez@solveit.com'],
        assigned_to: techs[3],
        comments: [
          { user: techs[3], msg: '¿Has probado a pulsar Win+P y seleccionar "Extender"?' },
          { user: byEmail['s.alvarez@solveit.com'], msg: 'Sí, lo he probado pero no aparece el segundo monitor.' },
          { user: techs[3], msg: 'El driver de la tarjeta gráfica estaba desactualizado. He actualizado y ya detecta los dos monitores.' },
          { user: byEmail['s.alvarez@solveit.com'], msg: 'Perfecto, funciona. Gracias Sofía!' },
        ]
      },
      {
        title: 'El equipo va muy lento desde la actualización de Windows',
        description: 'Tras instalar la actualización KB5034441 el equipo va extremadamente lento. Tarda 10 minutos en arrancar.',
        status: 'resolved', priority: 'high',
        created_by: byEmail['m.ibanez@solveit.com'],
        assigned_to: techs[4],
        comments: [
          { user: techs[4], msg: 'Esa actualización tiene un bug conocido con algunos antivirus. ¿Qué antivirus tienes instalado?' },
          { user: byEmail['m.ibanez@solveit.com'], msg: 'Kaspersky Endpoint.' },
          { user: techs[4], msg: 'Efectivamente, hay un conflicto conocido. He desinstalado la actualización y pausado las actualizaciones automáticas hasta que salga el parche.' },
          { user: byEmail['m.ibanez@solveit.com'], msg: 'Ya va fluido. Muchas gracias Andrés!' },
        ]
      },
    ];

    for (const inc of incidentsData) {
      const catId = Object.values(catMap)[Math.floor(Math.random() * Object.values(catMap).length)];
      const res = await client.query(`
        INSERT INTO incidents (title, description, status, priority, category_id, created_by, assigned_to, resolved_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        inc.title, inc.description, inc.status, inc.priority,
        catId, inc.created_by, inc.assigned_to,
        inc.status === 'resolved' ? new Date() : null
      ]);
      const incId = res.rows[0].id;

      for (const c of inc.comments) {
        await client.query(
          'INSERT INTO comments (incident_id, user_id, message) VALUES ($1, $2, $3)',
          [incId, c.user, c.msg]
        );
      }
    }
    console.log(`✓ ${incidentsData.length} incidencias creadas con comentarios`);

    // ── BASE DE CONOCIMIENTO ───────────────────────────────────────────────
    const adminId = admins[0];
    const articles = [
      { title: 'Cómo restablecer tu contraseña de Windows', content: `Si has olvidado tu contraseña de Windows o necesitas cambiarla:\n\n1. Pulsa Ctrl+Alt+Del y selecciona "Cambiar contraseña"\n2. Introduce la contraseña actual y la nueva dos veces\n3. La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número\n4. Si no recuerdas la contraseña actual, contacta con IT para resetearla\n5. Nunca compartas tu contraseña con compañeros\n\nNota: Las contraseñas caducan cada 90 días.` },
      { title: 'Solución a pantallas azules (BSOD) más comunes', content: `Las pantallas azules más frecuentes y su solución:\n\n**KERNEL_SECURITY_CHECK_FAILURE**\n- Actualiza o reinstala los drivers de tarjeta gráfica\n- Ejecuta sfc /scannow en CMD como administrador\n\n**IRQL_NOT_LESS_OR_EQUAL**\n- Suele ser un driver de red o WiFi corrupto\n- Actualiza los drivers desde el Administrador de dispositivos\n\n**PAGE_FAULT_IN_NONPAGED_AREA**\n- Problema de RAM o disco duro\n- Ejecuta chkdsk C: /f /r\n- Comprueba la RAM con MemTest86\n\n**Pasos generales:**\n1. Anota el código de error\n2. Arranca en modo seguro\n3. Ejecuta sfc /scannow\n4. Abre incidencia si persiste` },
      { title: 'Configurar la VPN corporativa paso a paso', content: `Para conectarte a la red corporativa desde fuera de la oficina:\n\n**Instalación:**\n1. Descarga FortiClient VPN desde la intranet (Recursos IT > Software)\n2. Instálalo con la opción "Solo VPN"\n3. Abre FortiClient y ve a "Configurar VPN"\n4. Tipo: SSL-VPN\n5. Nombre: SolveIT Corp\n6. Servidor: vpn.solveit.com\n7. Puerto: 443\n\n**Uso diario:**\n1. Abre FortiClient\n2. Introduce tu usuario y contraseña corporativa\n3. Haz clic en Conectar\n4. Cuando termines, desconéctate siempre\n\n**Importante:** La VPN es obligatoria para acceder a recursos internos desde fuera.` },
      { title: 'Outlook no envía correos — solución', content: `Si los correos se quedan en la bandeja de salida:\n\n**Causa 1: Perfil corrompido**\n1. Cierra Outlook\n2. Ve a Panel de control > Correo > Mostrar perfiles\n3. Añade un nuevo perfil y configura tu cuenta\n4. Establece el nuevo perfil como predeterminado\n\n**Causa 2: Caché OST corrupta**\n1. Cierra Outlook\n2. Ve a %localappdata%\\Microsoft\\Outlook\\\n3. Borra los archivos .ost\n4. Reabre Outlook (se sincronizará de nuevo)\n\n**Causa 3: Modo sin conexión activado**\n- Ve a la pestaña Enviar/Recibir\n- Comprueba que "Trabajar sin conexión" NO está activo` },
      { title: 'Cómo liberar espacio en disco en Windows', content: `Pasos para liberar espacio rápidamente:\n\n**Limpieza rápida:**\n1. Busca "Liberador de espacio en disco" en el menú inicio\n2. Selecciona el disco C:\n3. Marca todas las opciones y pulsa Aceptar\n4. Pulsa "Limpiar archivos del sistema" para más opciones\n\n**Limpieza avanzada:**\n- Desinstala programas que no uses: Panel de control > Programas\n- Vacía la papelera de reciclaje\n- Borra descargas antiguas de la carpeta Descargas\n- Mueve documentos grandes a la carpeta de red compartida\n\n**Herramienta recomendada:**\nTreeSize Free (disponible en la intranet) muestra qué carpetas ocupan más espacio.` },
      { title: 'Configurar impresora de red en Windows', content: `Para añadir una impresora de red:\n\n**Método automático:**\n1. Ve a Configuración > Dispositivos > Impresoras\n2. Haz clic en "Agregar impresora o escáner"\n3. Si aparece en la lista, selecciónala y sigue el asistente\n\n**Método manual (si no aparece):**\n1. Haz clic en "La impresora no está en la lista"\n2. Selecciona "Agregar impresora usando dirección TCP/IP"\n3. Introduce la IP de la impresora (consulta el cartel pegado en cada impresora)\n4. Windows descargará el driver automáticamente\n\n**IPs de impresoras:**\n- Planta 1: 192.168.1.50\n- Planta 2: 192.168.1.51\n- Planta 3: 192.168.1.52` },
      { title: 'Qué hacer si sospechas de un virus o malware', content: `Si tu equipo se comporta de forma extraña:\n\n**Señales de infección:**\n- El equipo va muy lento sin motivo aparente\n- Aparecen ventanas emergentes constantemente\n- El navegador redirige a páginas extrañas\n- Archivos desaparecen o se modifican solos\n\n**Qué hacer:**\n1. NO apagues el equipo (puede destruir evidencias)\n2. Desconecta el cable de red inmediatamente\n3. Llama a IT urgentemente o abre incidencia con prioridad ALTA\n4. No introduzcas contraseñas ni accedas a banca online\n\n**Qué NO hacer:**\n- No intentes "limpiar" el virus tú mismo\n- No conectes USBs de otras personas al equipo infectado` },
      { title: 'Acceso remoto a tu equipo de trabajo', content: `Para acceder a tu equipo de trabajo desde casa:\n\n**Requisitos:**\n- VPN activa (ver guía de VPN)\n- Equipo de trabajo encendido\n- Permiso de IT para acceso remoto\n\n**Conexión:**\n1. Conecta la VPN\n2. Abre "Conexión a Escritorio Remoto" (busca mstsc en inicio)\n3. Introduce el nombre de tu equipo (está en una pegatina debajo del monitor)\n4. Usa tus credenciales corporativas\n\n**Nota:** Solicita a IT que activen el acceso remoto en tu equipo si es la primera vez.` },
      { title: 'Cómo hacer una copia de seguridad de tus documentos', content: `Es obligatorio guardar los documentos de trabajo en la red, no solo en el disco local:\n\n**Carpeta de red:**\n- Ruta: \\\\servidor\\usuarios\\tu_usuario\\\n- Se hace copia de seguridad automáticamente cada noche\n- Accesible desde cualquier equipo de la empresa\n\n**Sincronización con OneDrive:**\n1. Abre OneDrive (icono en la bandeja del sistema)\n2. Inicia sesión con tu cuenta corporativa\n3. Activa la copia de seguridad de Escritorio, Documentos e Imágenes\n\n**Importante:** Los documentos guardados solo en el escritorio local NO tienen copia de seguridad.` },
      { title: 'Solución a problemas de WiFi corporativa', content: `Si tienes problemas de conexión WiFi en la oficina:\n\n**Pasos básicos:**\n1. Activa y desactiva el WiFi (modo avión)\n2. Olvida la red y vuelve a conectarte\n   - Ve a Configuración > Red > WiFi > Administrar redes\n   - Selecciona "SolveIT-Corp" y pulsa Olvidar\n   - Vuelve a conectarte con tus credenciales\n\n**Si el problema persiste:**\n3. Actualiza el driver de red (Administrador de dispositivos)\n4. Ejecuta el solucionador de problemas de red\n5. Abre incidencia indicando tu ubicación exacta (planta y sala)\n\n**Redes disponibles:**\n- SolveIT-Corp: Red corporativa (requiere credenciales)\n- SolveIT-Guest: Red para visitas (sin acceso a recursos internos)` },
      { title: 'Cómo solicitar nuevo software o hardware', content: `Para solicitar equipamiento o software:\n\n**Software:**\n1. Abre una incidencia en SolveIT con categoría "Software"\n2. Indica el nombre del programa y el motivo de la solicitud\n3. IT valorará si es compatible y tiene licencia\n4. Tiempo estimado: 2-5 días laborables\n\n**Hardware (ratón, teclado, auriculares...):**\n1. Habla primero con tu responsable para que autorice la compra\n2. Abre incidencia con la aprobación del responsable\n3. Tiempo estimado: 1-2 semanas\n\n**Equipo nuevo o sustitución:**\n- Solo se tramita con autorización de dirección\n- Habla con RRHH para iniciar el proceso` },
      { title: 'Teams: solución a problemas frecuentes', content: `Problemas más comunes en Microsoft Teams:\n\n**No carga o va lento:**\n1. Cierra Teams completamente (icono en bandeja > Salir)\n2. Ve a %appdata%\\Microsoft\\Teams\\\n3. Borra la carpeta "Cache"\n4. Reabre Teams\n\n**No se escucha en reuniones:**\n1. Ve a Configuración de Teams > Dispositivos\n2. Selecciona el micrófono y altavoz correctos\n3. Comprueba que no estás silenciado (icono micrófono en la reunión)\n\n**Pantalla parpadea al compartir:**\n1. Ve a Configuración > General\n2. Desactiva "Aceleración de hardware de GPU"\n3. Reinicia Teams\n\n**Error de inicio de sesión:**\n- Cierra Teams, borra credenciales en Administrador de credenciales de Windows y vuelve a iniciar.` },
    ];

    for (const a of articles) {
      const catId = Object.values(catMap)[Math.floor(Math.random() * Object.values(catMap).length)];
      await client.query(`
        INSERT INTO knowledge_base (title, content, category_id, created_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [a.title, a.content, catId, adminId]);
    }
    console.log(`✓ ${articles.length} artículos de conocimiento creados`);

    // ── FORO ───────────────────────────────────────────────────────────────
    const forumPosts = [
      {
        title: '¿Cómo libero espacio en disco rápidamente?',
        content: 'Mi ordenador tiene el disco casi lleno (solo 2GB libres) y va muy lento. He probado a borrar archivos de la carpeta de descargas pero sigue igual. ¿Algún truco que os haya funcionado?',
        user: byEmail['p.lopez@solveit.com'],
        comments: [
          { user: byEmail['c.garcia@solveit.com'], msg: 'Prueba el Liberador de espacio en disco de Windows. Busca "cleanmgr" en inicio y limpia también los archivos del sistema. A mí me liberó 8GB de golpe.' },
          { user: byEmail['a.sanchez@solveit.com'], msg: 'Yo uso TreeSize Free, está en la intranet. Te muestra exactamente qué carpetas ocupan más y puedes borrar lo que no necesites.' },
          { user: byEmail['p.lopez@solveit.com'], msg: 'Con el cleanmgr he liberado 5GB! Gracias. Voy a probar también el TreeSize.' },
          { user: byEmail['l.martinez@solveit.com'], msg: 'También revisa si Windows Update ha dejado archivos de instalación viejos. En cleanmgr hay una opción "Archivos de actualización de Windows" que puede pesar varios GB.' },
        ]
      },
      {
        title: 'Problema con doble pantalla en reuniones de Teams',
        content: 'Cuando comparto pantalla en Teams con dos monitores, el otro participante ve parpadeos constantes. He probado en diferentes reuniones y siempre ocurre. ¿A alguien le ha pasado?',
        user: byEmail['m.torres@solveit.com'],
        comments: [
          { user: byEmail['j.fernandez@solveit.com'], msg: 'Sí, es un bug conocido con la aceleración de hardware. Ve a Configuración de Teams > General y desactiva "Aceleración de hardware de GPU". A mí me lo solucionó.' },
          { user: byEmail['m.torres@solveit.com'], msg: 'Lo he desactivado y parece que va mejor. Haré una prueba en la próxima reunión.' },
          { user: byEmail['s.jimenez@solveit.com'], msg: 'También puedes probar a compartir solo una ventana específica en lugar de toda la pantalla. Así evitas el problema con el segundo monitor.' },
          { user: byEmail['m.torres@solveit.com'], msg: 'Confirmado, con la aceleración desactivada ya no parpadea. Gracias Javier!' },
        ]
      },
      {
        title: 'Truco para acelerar el inicio de Windows',
        content: 'Descubrí que desactivando programas del inicio se reduce el tiempo de arranque de 2 minutos a 20 segundos. Os cuento cómo hacerlo paso a paso: Ctrl+Shift+Esc > pestaña Inicio > desactivar todo lo que no sea imprescindible.',
        user: byEmail['a.ruiz@solveit.com'],
        comments: [
          { user: byEmail['f.moreno@solveit.com'], msg: 'Muy buen truco! Yo también desactivé el OneDrive del inicio y el arranque es mucho más rápido.' },
          { user: byEmail['d.ortega@solveit.com'], msg: 'Ojo con desactivar el antivirus del inicio, ese hay que dejarlo siempre activo.' },
          { user: byEmail['a.ruiz@solveit.com'], msg: 'Totalmente de acuerdo David. El antivirus, el Teams y el cliente VPN mejor dejarlos. El resto se puede quitar sin problema.' },
          { user: byEmail['c.garcia@solveit.com'], msg: 'Otro truco: activar el inicio rápido en Opciones de energía > Configuración de apagado. Reduce bastante el tiempo de arranque en equipos con HDD.' },
          { user: byEmail['l.gomez@solveit.com'], msg: 'Lo acabo de probar y he pasado de 3 minutos a 45 segundos. Increíble la diferencia!' },
        ]
      },
      {
        title: 'No me llegan notificaciones de Teams cuando estoy en otra ventana',
        content: 'Cuando trabajo en Word o Excel no me llegan las notificaciones de mensajes de Teams. Solo las veo cuando abro Teams directamente. He revisado la configuración pero no encuentro la solución.',
        user: byEmail['i.ramirez@solveit.com'],
        comments: [
          { user: byEmail['s.jimenez@solveit.com'], msg: 'Ve a Configuración de Teams > Notificaciones y asegúrate de que el banner y el sonido están activados para mensajes directos y menciones.' },
          { user: byEmail['i.ramirez@solveit.com'], msg: 'Los tenía activados pero igualmente no llegaban.' },
          { user: byEmail['a.molina@solveit.com'], msg: 'El problema puede ser que Windows esté bloqueando las notificaciones de Teams. Ve a Configuración de Windows > Sistema > Notificaciones y asegúrate de que Teams está en la lista y con notificaciones activadas.' },
          { user: byEmail['i.ramirez@solveit.com'], msg: 'Era eso! Teams estaba desactivado en las notificaciones de Windows. Ya me llegan. Gracias Andrés!' },
        ]
      },
      {
        title: '¿Cuánto tiempo tardan en resolver las incidencias?',
        content: 'Llevo 3 días con una incidencia abierta de prioridad media y aún no la han resuelto. ¿Es normal? ¿Cuáles son los tiempos estimados?',
        user: byEmail['r.cano@solveit.com'],
        comments: [
          { user: byEmail['e.navarro@solveit.com'], msg: 'Los tiempos objetivo son: Alta → 4h, Media → 24h, Baja → 72h. 3 días para una media está fuera del SLA. Abre la incidencia y añade un comentario urgiendo la resolución.' },
          { user: byEmail['c.garcia@solveit.com'], msg: 'También puedes llamar directamente al departamento IT: ext. 200. A veces las incidencias se quedan sin asignar por volumen de trabajo.' },
          { user: byEmail['r.cano@solveit.com'], msg: 'Gracias, he añadido el comentario y me han llamado. Estaban con una incidencia crítica de servidor. La resuelven mañana.' },
        ]
      },
      {
        title: 'Recomendación: extensiones útiles para Chrome en el trabajo',
        content: '¿Qué extensiones de Chrome usáis que os hayan resultado útiles para el trabajo? Yo uso Bitwarden para contraseñas y Dark Reader para reducir el cansancio visual.',
        user: byEmail['l.gomez@solveit.com'],
        comments: [
          { user: byEmail['p.vargas@solveit.com'], msg: 'Yo uso uBlock Origin para bloquear publicidad y Grammarly para revisar textos en inglés. Son muy útiles.' },
          { user: byEmail['d.ortega@solveit.com'], msg: 'OneTab es genial si abres muchas pestañas. Las agrupa en una lista y libera mucha memoria RAM.' },
          { user: byEmail['s.alvarez@solveit.com'], msg: 'Recordad que para instalar extensiones en los equipos corporativos necesitáis aprobación de IT. Abrid una incidencia antes de instalar.' },
          { user: byEmail['l.gomez@solveit.com'], msg: 'Buen apunte Sergio. Las que mencioné las solicité por incidencia y las aprobaron en un día.' },
        ]
      },
    ];

    for (const post of forumPosts) {
      const res = await client.query(
        'INSERT INTO forum_posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING id',
        [post.title, post.content, post.user]
      );
      const postId = res.rows[0].id;
      for (const c of post.comments) {
        await client.query(
          'INSERT INTO forum_comments (post_id, user_id, message) VALUES ($1, $2, $3)',
          [postId, c.user, c.msg]
        );
      }
    }
    console.log(`✓ ${forumPosts.length} posts del foro creados con comentarios`);

    console.log('\n✅ Seed completado correctamente');
  } catch (e) {
    console.error('Error en seed:', e.message);
    throw e;
  } finally {
    client.release();
    process.exit(0);
  }
}

seed().catch(e => { console.error(e); process.exit(1); });
