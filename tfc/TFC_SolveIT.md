# TRABAJO FIN DE CICLO

**CURSO 2024/2025**

---

# SolveIT: Plataforma SaaS multi-tenant para la gestión inteligente de incidencias IT en pequeñas y medianas empresas

---

**Alumno/a:** Rubén Aguado Perulero

**Tutor/a:** [NOMBRE Y APELLIDOS DEL TUTOR]

**CICLO FORMATIVO DE GRADO SUPERIOR EN DESARROLLO DE APLICACIONES MULTIPLATAFORMA (DAM)**

---
---

## RESUMEN

El presente Trabajo Fin de Ciclo desarrolla SolveIT, una plataforma SaaS multi-tenant dirigida a pequeñas y medianas empresas que necesitan gestionar incidencias informáticas de forma profesional sin asumir el coste de soluciones empresariales como ServiceNow o Jira Service Management. La solución integra una aplicación móvil multiplataforma desarrollada en React Native, una aplicación web responsive en Next.js y un backend Node.js con base de datos PostgreSQL. Entre sus funcionalidades destacan la asignación automática de técnicos según carga de trabajo, una base de conocimiento colaborativa, un foro interno para los equipos, recuperación segura de contraseñas mediante código por correo electrónico y, como diferenciador clave, un asistente de inteligencia artificial integrado mediante el modelo Gemma de Google que orienta a los usuarios ante problemas técnicos y reduce la carga del departamento de soporte. La arquitectura multi-tenant permite que un único despliegue dé servicio a múltiples empresas con aislamiento total de datos. La plataforma se aloja en infraestructura cloud Railway con escalado bajo demanda y un coste operativo reducido. Tras desarrollar y desplegar la plataforma, se ha validado su funcionalidad sobre dos empresas piloto, demostrando que la solución es viable como producto comercial accesible para el tejido empresarial español.

**Palabras clave:** asistente IA; gestión de incidencias; multi-tenant; PYME; SaaS

---

## ABSTRACT

This Final Project develops SolveIT, a multi-tenant SaaS platform aimed at small and medium-sized enterprises that need to manage IT incidents professionally without assuming the cost of enterprise solutions such as ServiceNow or Jira Service Management. The solution integrates a cross-platform mobile application developed in React Native, a responsive web application built in Next.js and a Node.js backend with a PostgreSQL database. Its features include automatic technician assignment based on workload, a collaborative knowledge base, an internal forum for teams, secure password recovery through email codes and, as a key differentiator, an integrated artificial intelligence assistant powered by Google's Gemma model that guides users through technical issues and reduces the workload of the support department. The multi-tenant architecture enables a single deployment to serve multiple companies with full data isolation. The platform is hosted on Railway cloud infrastructure with on-demand scaling and a reduced operating cost. After developing and deploying the platform, its functionality has been validated on two pilot companies, demonstrating that the solution is viable as a commercial product accessible to the Spanish business sector.

**Key words:** AI assistant; incident management; multi-tenant; SaaS; SME

---
---

## ÍNDICE

1. INTRODUCCIÓN
2. ANÁLISIS
   - 2.1 Estudio de mercado
   - 2.2 Elección de soluciones
3. VALORACIÓN ECONÓMICA
   - 3.1 Hardware
   - 3.2 Licencias y servicios
   - 3.3 Personal
   - 3.4 Costes de mantenimiento
4. VIABILIDAD DEL PROYECTO
5. PUESTA EN MARCHA
   - 5.1 Forma jurídica y trámites
   - 5.2 Recursos humanos
   - 5.3 Prevención de riesgos laborales
   - 5.4 Análisis medioambiental
   - 5.5 Plan de financiación
6. EVALUACIÓN FUNCIONAL
7. CONCLUSIÓN
8. BIBLIOGRAFÍA
9. ANEXOS

---
---

## 1. INTRODUCCIÓN

La transformación digital del tejido empresarial español ha incrementado de forma exponencial la dependencia de los sistemas informáticos en cualquier organización, independientemente de su tamaño o sector. Según el Instituto Nacional de Estadística (INE, 2024), más del 99% de las empresas españolas con asalariados dispone de conexión a internet y utiliza ordenadores en su actividad diaria. Esta dependencia tecnológica ha generado, paralelamente, una necesidad creciente de gestionar de forma eficiente las incidencias técnicas que inevitablemente surgen: equipos averiados, problemas de red, software que falla, accesos denegados, dispositivos periféricos que dejan de funcionar y un largo etcétera.

Mientras que las grandes corporaciones cuentan con soluciones consolidadas como ServiceNow, BMC Helix o Jira Service Management para gestionar sus tickets de soporte, las pequeñas y medianas empresas (PYME), que representan el 99,8% del tejido empresarial español según el Ministerio de Industria (2024), se encuentran ante un dilema. Por un lado, el coste y la complejidad de implantación de las soluciones empresariales resultan inasumibles. Por otro, gestionar las incidencias mediante hojas de cálculo, correos electrónicos o sistemas caseros conlleva pérdidas de información, falta de trazabilidad y una experiencia de usuario deficiente.

Este Trabajo Fin de Ciclo presenta **SolveIT**, una plataforma SaaS (Software as a Service) multi-tenant concebida específicamente para cubrir esta necesidad. La idea de negocio consiste en ofrecer a las PYME un sistema profesional de gestión de incidencias IT con todas las funcionalidades que un departamento de soporte moderno requiere, accesible desde el navegador y desde el móvil, con un modelo de pago por suscripción mensual y sin necesidad de mantenimiento por parte del cliente.

La plataforma propone un servicio en tres capas. La primera capa es la aplicación móvil multiplataforma, desarrollada con React Native y Expo, que permite a usuarios y técnicos gestionar incidencias desde cualquier ubicación. La segunda capa es la aplicación web responsive, construida con Next.js, orientada principalmente a roles administrativos y a entornos donde el ordenador es la herramienta habitual. La tercera capa es el backend Node.js con base de datos PostgreSQL, donde reside la lógica de negocio y se centralizan los datos de todas las empresas cliente bajo una arquitectura multi-tenant que garantiza el aislamiento total entre organizaciones.

Como elemento diferenciador frente a la competencia, SolveIT incorpora un **asistente de inteligencia artificial** basado en el modelo Gemma de Google que asiste a los usuarios ante problemas técnicos antes de generar un ticket. Este asistente, además de mejorar la experiencia del empleado al ofrecerle una respuesta inmediata, reduce la carga sobre el departamento de soporte al filtrar consultas que pueden resolverse con la documentación existente.

La justificación personal de este proyecto responde a varias motivaciones interconectadas. Durante la realización de las prácticas en empresa observé de primera mano cómo los departamentos de IT de las PYME conviven con herramientas heterogéneas y poco integradas para gestionar el día a día. La idea de construir una solución que aglutine todas las necesidades en un único producto, accesible y con tecnologías modernas, surgió de manera natural. A nivel profesional, este trabajo me permite consolidar las competencias adquiridas en los módulos de Programación Multimedia y Dispositivos Móviles, Acceso a Datos, Programación de Servicios y Procesos y Sistemas de Gestión Empresarial, integrándolas en un único proyecto end-to-end. Además, posiciona mi perfil profesional en un sector con alta demanda como es el desarrollo full-stack y la integración de inteligencia artificial en productos reales.

Desde la perspectiva del emprendimiento, SolveIT se presenta como un proyecto alineado con los **Objetivos de Desarrollo Sostenible** de la Agenda 2030 (Naciones Unidas, 2015). En particular, contribuye al **ODS 8** (Trabajo decente y crecimiento económico) al mejorar la productividad de los trabajadores reduciendo el tiempo de inactividad por incidencias técnicas; al **ODS 9** (Industria, innovación e infraestructura) al democratizar el acceso a herramientas de gestión IT que hasta ahora estaban reservadas a grandes empresas; y al **ODS 12** (Producción y consumo responsables) al fomentar la digitalización y reducir el uso de papel y desplazamientos físicos del personal técnico. El proyecto se enmarca, asimismo, dentro de las **economías transformadoras** al impulsar la digitalización del tejido productivo y al ofrecer un modelo de software accesible que reduce la brecha tecnológica entre grandes corporaciones y PYME.

---

## 2. ANÁLISIS

### 2.1 Estudio de mercado

El mercado del IT Service Management (ITSM) ha experimentado un crecimiento sostenido durante los últimos años. Según el informe de Gartner (2024), el segmento global de software ITSM superó los 12.000 millones de dólares en 2023 y se proyecta una tasa anual compuesta de crecimiento (CAGR) cercana al 9% hasta 2028. Este crecimiento responde a la combinación de tres factores: la digitalización acelerada tras la pandemia, la adopción de modelos híbridos de trabajo y la creciente complejidad de las infraestructuras IT.

Para validar la necesidad del producto se ha realizado una investigación cualitativa basada en observación directa durante el periodo de Formación en Centros de Trabajo y en conversaciones informales con responsables de soporte de cinco empresas de entre 15 y 200 empleados. Las conclusiones más relevantes son las siguientes:

- Cuatro de las cinco empresas consultadas no disponen de un sistema profesional de tickets. Gestionan las incidencias mediante correo electrónico o aplicaciones de mensajería instantánea.
- El 100% de los responsables consultados reconoce que pierde información sobre incidencias previas, lo que provoca que se repitan diagnósticos para problemas ya resueltos.
- La principal barrera para adoptar una solución profesional es el coste de las licencias y la complejidad de implantación.
- Existe un interés explícito por funcionalidades de inteligencia artificial que reduzcan la carga del equipo de soporte.

#### Análisis de la competencia

A continuación se analizan las soluciones más relevantes del mercado:

**ServiceNow.** Es la solución líder en el segmento corporativo. Ofrece una plataforma completa de gestión de servicios IT, gestión de activos, automatización y analítica. Su precio parte de aproximadamente 100 dólares por usuario y mes, con costes adicionales de implantación que pueden superar los 50.000 euros para una empresa mediana. Su orientación es claramente *enterprise* y resulta inviable para PYME.

**Jira Service Management** (Atlassian). Es la opción más popular entre empresas tecnológicas medianas. Su modelo es freemium con un plan gratuito limitado a tres agentes y planes de pago desde 21 dólares por agente al mes. Aunque su precio es más accesible que ServiceNow, su curva de aprendizaje es considerable y muchas funcionalidades requieren plugins de pago.

**Freshservice** (Freshworks). Solución cloud orientada a empresas medianas. Precios desde 19 dólares por agente al mes, interfaz amigable y buena experiencia móvil. Su limitación principal es que está orientada a empresas con un único tenant y no incorpora capacidades nativas de IA generativa.

**Zammad y osTicket.** Soluciones open source autoalojadas. El coste de licencia es nulo pero requieren administración de infraestructura, mantenimiento, parcheado y conocimiento técnico que la mayoría de PYME no tiene internamente.

**SysAid, Zendesk, ManageEngine.** Soluciones intermedias con buena cobertura funcional pero con precios y complejidad que las alejan del segmento PYME pequeña (menos de 50 empleados).

#### Análisis DAFO de SolveIT

| Fortalezas | Debilidades |
|---|---|
| Tecnología moderna (React Native, Next.js, Node.js) | Marca desconocida sin reputación previa |
| Asistente de IA integrado de serie | Equipo inicial reducido (un único desarrollador) |
| Multi-tenant nativo | Cartera de funcionalidades inferior a ServiceNow |
| Coste reducido para el cliente | Dependencia de proveedores cloud externos |

| Oportunidades | Amenazas |
|---|---|
| Crecimiento del segmento ITSM | Entrada de competidores con más recursos |
| Ayudas a la digitalización (Kit Digital) | Cambios en políticas de precios de cloud o IA |
| Demanda de IA en productos SaaS | Madurez del open source autoalojable |
| Tejido PYME español infrautilizando ITSM | Riesgo regulatorio (RGPD, AI Act) |

### 2.2 Elección de soluciones

Tras el análisis de mercado y aplicando la **filosofía KISS** (*Keep It Simple, Stupid*), se ha decidido construir SolveIT como una solución a medida sobre un stack tecnológico moderno y mayoritariamente abierto, en lugar de adaptar una solución existente o construir un fork de un sistema open source como Zammad. Las razones de esta elección son las siguientes.

**Re-usabilidad.** El stack elegido (Node.js, React Native, Next.js, PostgreSQL) es ampliamente conocido por la comunidad de desarrolladores, lo que facilita la incorporación de nuevos miembros al equipo en el futuro y garantiza el soporte a largo plazo. Los conocimientos adquiridos durante el desarrollo se trasladan sin fricción a otros proyectos.

**Complejidad de instalación.** El cliente final no tiene que instalar nada en sus sistemas. La aplicación móvil se distribuye a través de las tiendas oficiales (Google Play y App Store) y la aplicación web se accede desde un navegador. El backend se aloja en infraestructura cloud gestionada por el proveedor del servicio.

**Velocidad de desarrollo.** React Native y Next.js comparten lenguaje (JavaScript/TypeScript), lo que permite reutilizar lógica entre web y móvil. Expo simplifica el ciclo de desarrollo y publicación de la aplicación móvil.

**Coste.** Todas las tecnologías base son gratuitas y de código abierto. Los servicios cloud se contratan por uso, lo que permite escalar el coste linealmente con los ingresos.

#### Stack tecnológico definitivo

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend móvil | React Native + Expo (SDK 54) | Multiplataforma, rapidez de desarrollo, comunidad amplia |
| Frontend web | Next.js 14 + TypeScript | SSR, SEO, ecosistema React |
| Backend | Node.js + Express | Curva de aprendizaje suave, comunidad enorme |
| Base de datos | PostgreSQL | ACID, soporte JSON, multi-tenant friendly |
| Hosting | Railway | PaaS sencillo, integración Git, escalado automático |
| IA generativa | Google Gemma 3 12B (API gratuita) | Calidad alta, plan gratuito viable |
| Email transaccional | Resend | API moderna, plan gratuito 100/día |
| Autenticación | JWT propio + bcrypt | Control total, sin dependencia externa |

---

## 3. VALORACIÓN ECONÓMICA

En este apartado se desglosan los costes asociados al desarrollo y al mantenimiento del proyecto durante su primer año de vida. Las cifras corresponden a estimaciones realistas basadas en los precios actuales del mercado español a mayo de 2026.

### 3.1 Hardware

El hardware necesario para llevar a cabo el proyecto es mínimo, ya que el stack elegido permite desarrollar desde un equipo personal sin grandes requisitos.

| Concepto | Coste (€) | Vida útil |
|---|---|---|
| Equipo de desarrollo (portátil 16 GB RAM, SSD 512 GB) | 1.000 | 4 años |
| Monitor adicional 24" | 180 | 6 años |
| Smartphone Android para pruebas | 250 | 4 años |
| Periféricos (teclado, ratón) | 70 | 5 años |
| **Total hardware** | **1.500** | |

Aplicando amortización lineal, el coste imputable al primer año del proyecto es de aproximadamente **375 €**.

### 3.2 Licencias y servicios

Una de las ventajas de elegir un stack basado en software libre es la práctica inexistencia de costes de licencia. Los costes recurrentes corresponden principalmente a servicios cloud y SaaS de terceros.

| Concepto | Coste mensual (€) | Coste anual (€) |
|---|---|---|
| Railway (hosting backend + PostgreSQL) | 5 | 60 |
| Dominio .com | – | 12 |
| Cuenta Apple Developer | – | 99 |
| Cuenta Google Play Developer (pago único) | – | 25 |
| Certificado SSL (incluido en Railway) | 0 | 0 |
| Resend (plan gratuito 100 emails/día) | 0 | 0 |
| Google Gemini API (plan gratuito) | 0 | 0 |
| GitHub (repositorio privado) | 0 | 0 |
| Expo EAS Build (plan gratuito) | 0 | 0 |
| **Total licencias y servicios año 1** | | **196** |

A medida que la plataforma escale, será necesario migrar a planes de pago (especialmente Resend cuando se superen 100 emails diarios y un plan superior de Railway con más memoria y CPU). Para el segundo año se estima un coste anual de servicios de aproximadamente 850 €.

### 3.3 Personal

Durante la fase inicial el desarrollo lo asume el promotor del proyecto. El coste del personal se valora a precio de mercado para poder construir un análisis de viabilidad realista, aunque en la práctica se trate de horas autoaplicadas.

| Rol | Horas | Coste/hora (€) | Coste total (€) |
|---|---|---|---|
| Desarrollador full-stack | 600 | 25 | 15.000 |
| Diseñador UX/UI (puntual, 30 h) | 30 | 35 | 1.050 |
| Asesoría legal (constitución, RGPD) | 8 | 80 | 640 |
| Asesoría fiscal (1 año, cuota mensual) | – | – | 720 |
| **Total personal año 1** | | | **17.410** |

### 3.4 Costes de mantenimiento

Una vez la plataforma está en producción, el mantenimiento incluye actualizaciones de dependencias, corrección de bugs, atención a incidencias de clientes y desarrollo evolutivo. Para el primer año se estima una dedicación media de 8 horas semanales (aproximadamente 384 horas anuales), lo que supone un coste de 9.600 €. A esto se suma el coste creciente de la infraestructura cloud (estimado en 600 € adicionales) y el coste de un servicio de monitorización (UptimeRobot gratuito en plan inicial, Better Stack en plan de pago a partir del año 2 por 24 € anuales).

#### Resumen económico año 1

| Concepto | Importe (€) |
|---|---|
| Amortización hardware | 375 |
| Licencias y servicios | 196 |
| Personal desarrollo | 17.410 |
| Personal mantenimiento (medio año) | 4.800 |
| **Total año 1** | **22.781** |

---

## 4. VIABILIDAD DEL PROYECTO

El análisis de viabilidad se aborda desde tres dimensiones complementarias: viabilidad técnica, viabilidad económica y viabilidad de mercado.

### Viabilidad técnica

La viabilidad técnica está demostrada porque la plataforma se ha desarrollado y desplegado en producción. La aplicación está accesible públicamente en `solveit-app-production.up.railway.app` y la versión móvil es instalable mediante un APK generado con EAS Build de Expo. El stack elegido es maduro y existe abundante documentación oficial y comunitaria. La arquitectura multi-tenant basada en `company_id` por fila ha sido validada con dos empresas en paralelo (SolveIT Demo y LKS Next) sin fugas de información entre tenants.

### Viabilidad económica

Para evaluar la viabilidad económica se ha construido un modelo de proyección a tres años con tres planes comerciales:

| Plan | Precio (€/mes) | Usuarios incluidos | Funcionalidades |
|---|---|---|---|
| Basic | 19 | Hasta 10 | Tickets, KB, foro |
| Pro | 49 | Hasta 50 | + IA, dashboard avanzado |
| Enterprise | 149 | Ilimitado | + SLA, soporte prioritario |

#### Proyección a 3 años (escenario realista)

| Año | Clientes | Ingresos (€) | Costes (€) | Resultado (€) |
|---|---|---|---|---|
| 1 | 8 | 4.500 | 22.781 | -18.281 |
| 2 | 25 | 18.000 | 28.000 | -10.000 |
| 3 | 60 | 49.000 | 38.000 | +11.000 |

El punto de equilibrio se alcanza durante el tercer año, lo que es coherente con los plazos habituales en proyectos SaaS B2B (Frasco, 2023). Los dos primeros años requieren financiación externa o reinversión de horas no remuneradas del promotor.

### Viabilidad de mercado

España cuenta con aproximadamente 2,9 millones de PYME activas (Ministerio de Industria, 2024). Asumiendo conservadoramente que solo el 5% de las PYME con más de 10 empleados podrían ser clientes potenciales (alrededor de 30.000 empresas), capturar un 0,2% de ese segmento durante los primeros tres años (60 clientes) es un objetivo razonable. Los clientes objetivo son PYME españolas del sector servicios, comercio y manufactura ligera con plantillas entre 10 y 100 empleados.

### Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Fuga de información entre tenants | Baja | Alto | Tests automáticos de aislamiento, auditoría externa |
| Caída prolongada del proveedor cloud | Media | Alto | Backups diarios, plan de migración a otro PaaS |
| Cambio en política de precios de IA | Media | Medio | Capa de abstracción que permita cambiar de proveedor |
| Brecha de seguridad / RGPD | Baja | Muy alto | Cifrado en tránsito y reposo, auditorías, seguro |
| Aparición de competidor con mejor financiación | Alta | Medio | Foco en segmento PYME, precio, IA, soporte cercano |
| Baja adopción inicial | Media | Alto | Estrategia freemium, pilotos gratuitos, marketing digital |

---

## 5. PUESTA EN MARCHA

### 5.1 Forma jurídica y trámites de constitución

La forma jurídica seleccionada para la explotación comercial de SolveIT es la **Sociedad Limitada Unipersonal (SLU)**. Esta elección se justifica por tres motivos. Primero, limita la responsabilidad del emprendedor al capital aportado, protegiendo el patrimonio personal frente a posibles reclamaciones. Segundo, transmite mayor confianza a clientes B2B que otras formas como autónomo. Tercero, facilita la entrada de socios o inversores en el futuro mediante ampliación de capital.

Los trámites para la constitución son los siguientes:

1. **Solicitud de denominación social** en el Registro Mercantil Central. Coste: 16 €.
2. **Apertura de cuenta bancaria** y depósito del capital social mínimo (3.000 €).
3. **Otorgamiento de escritura pública** ante notario. Coste estimado: 200 €.
4. **Liquidación del Impuesto de Operaciones Societarias** (exento desde 2010 para constitución).
5. **Inscripción en el Registro Mercantil**. Coste estimado: 100 €.
6. **Solicitud del NIF definitivo** ante la Agencia Tributaria.
7. **Alta en Hacienda** mediante el modelo 036 (Censo de Empresarios).
8. **Alta en la Seguridad Social** (Régimen Especial de Trabajadores Autónomos para el administrador).
9. **Registro como responsable de tratamiento** ante la AEPD si se procesan datos de carácter personal (obligatorio por el RGPD).

### 5.2 Recursos humanos

Durante el primer año la plantilla se compone exclusivamente del promotor en doble rol de administrador y desarrollador. A partir del segundo año, dependiendo de la captación de clientes, se planifica la incorporación de un segundo desarrollador full-stack (junior) y, en el tercer año, de un perfil comercial con conocimientos técnicos.

| Año | Plantilla |
|---|---|
| 1 | 1 desarrollador full-stack (promotor) |
| 2 | 2 desarrolladores |
| 3 | 2 desarrolladores + 1 comercial |

La organización se diseña para ser plana, con reuniones semanales, uso intensivo de herramientas de colaboración asíncrona (GitHub, Notion, Slack) y posibilidad de teletrabajo total para reducir costes inmobiliarios y atraer talento más allá de la zona geográfica del promotor.

### 5.3 Prevención de riesgos laborales

Aunque inicialmente la actividad se desarrolle en régimen de autónomo desde domicilio o espacios de coworking, la incorporación futura de personal asalariado obliga al cumplimiento de la **Ley 31/1995 de Prevención de Riesgos Laborales**. Los principales riesgos identificados en una empresa de desarrollo software son:

- Riesgos ergonómicos derivados del trabajo prolongado con pantallas (síndrome del túnel carpiano, dolor lumbar, fatiga visual).
- Riesgo psicosocial por carga mental, plazos ajustados y trabajo aislado en remoto.
- Riesgos eléctricos en puestos de trabajo.

Las medidas previstas incluyen la contratación de un **Servicio de Prevención Ajeno** que realice la evaluación inicial de riesgos, la formación obligatoria al personal en uso seguro de pantallas (Real Decreto 488/1997), la dotación de mobiliario ergonómico (silla regulable, soporte para pantalla, teclado y ratón ergonómicos) y la planificación de pausas activas. En entorno de teletrabajo se aplicará la **Ley 10/2021 de trabajo a distancia**, formalizando un acuerdo individual con cada trabajador.

### 5.4 Análisis medioambiental

Aunque la actividad de desarrollo de software tiene un impacto medioambiental directo limitado, sí existen consideraciones relevantes en el ciclo de vida de los servicios cloud y en los hábitos de trabajo. Se adoptan las siguientes medidas:

- **Selección de proveedores cloud con compromiso de neutralidad de carbono.** Railway opera sobre infraestructura de Google Cloud y Amazon Web Services, ambas con planes públicos de neutralidad de carbono.
- **Optimización del consumo de recursos.** Se monitoriza periódicamente el uso de memoria y CPU para escalar solo lo necesario, reduciendo el consumo energético del backend.
- **Política de cero papel.** Toda la documentación interna y la facturación se gestiona digitalmente.
- **Reciclaje del hardware** al final de su vida útil mediante puntos limpios o programas de retoma del fabricante.
- **Política de teletrabajo** que reduce desplazamientos y, por tanto, emisiones de CO₂.

### 5.5 Plan de financiación

La financiación inicial necesaria para superar el periodo de pérdidas (años 1 y 2) se estima en aproximadamente 30.000 €. El plan combina recursos propios y ajenos:

| Fuente | Importe (€) | Tipo |
|---|---|---|
| Capital social aportado por promotor | 3.000 | Propios |
| Ahorros del promotor | 5.000 | Propios |
| Préstamo participativo ENISA Jóvenes Emprendedores | 15.000 | Ajenos |
| Subvención Kit Digital (cliente final) | – | Indirecta |
| Ingresos por suscripciones año 1-2 | 22.500 | Operativos |
| **Total financiación cubierta** | **45.500** | |

Adicionalmente, se valora la solicitud de la **Ayuda CDTI Neotec** para empresas de base tecnológica de hasta 250.000 € en caso de validación temprana del modelo. Los **fondos europeos Next Generation** vinculados a la transformación digital también constituyen una vía relevante a explorar a través del programa Kit Digital, que beneficia indirectamente a SolveIT al subvencionar a sus clientes potenciales (PYME) en la adopción de soluciones digitales como la nuestra (Red.es, 2024).

---

## 6. EVALUACIÓN FUNCIONAL

La plataforma SolveIT ha sido desplegada en producción y se ha validado funcionalmente sobre dos empresas piloto: SolveIT Demo (interna, 27 usuarios) y LKS Next (externa, 3 usuarios). El soporte de evaluación es la propia aplicación corriendo sobre infraestructura Railway. Los resultados de la verificación funcional se exponen a continuación.

### Funcionalidades verificadas

**Autenticación y gestión de usuarios.** Se ha verificado el inicio de sesión, el cierre de sesión, la recuperación de contraseña mediante código enviado por correo electrónico (utilizando Resend como proveedor SMTP-API) y el control de acceso por roles (superadmin, admin, technician, user). Los mensajes de error se muestran de forma visible en la pantalla de login (incluyendo "email o contraseña incorrectos" y "cuenta desactivada").

**Gestión de incidencias.** Los usuarios pueden crear incidencias indicando título, descripción, prioridad y categoría. El sistema asigna automáticamente al técnico con menor carga de trabajo activa. Los técnicos cambian el estado de las incidencias entre los valores `open`, `in_progress`, `resolved` y `closed`, y todos los cambios se registran en el historial.

**Sistema de notificaciones.** Cuando se crea una incidencia, el técnico asignado recibe una notificación en la campanita de la aplicación. Cuando el estado cambia, el creador de la incidencia es notificado. La tabla `notifications` incluye los campos `title`, `body` y `type` para construir notificaciones tipadas y enriquecidas.

**Base de conocimiento.** Los administradores pueden crear, editar y eliminar artículos. Los usuarios pueden valorar los artículos con una puntuación de 1 a 5 estrellas y dejar reseñas. Los artículos están vinculados a categorías y soportan imágenes de portada.

**Foro interno.** Permite a los empleados publicar mensajes, comentar y reaccionar con emojis. Es un canal de comunicación interno alternativo al correo electrónico para temas no estrictamente vinculados a una incidencia.

**Asistente de inteligencia artificial.** Se ha integrado el modelo Gemma 3 12B mediante la API gratuita de Google Generative Language. El asistente recibe la pregunta del usuario y, opcionalmente, contexto de la base de conocimiento, y devuelve una respuesta detallada en español. El acceso al asistente se realiza mediante un botón flotante (FAB) presente en todas las pantallas principales.

**Arquitectura multi-tenant.** Cada fila de las tablas `incidents`, `users`, `knowledge_base`, `forum_posts` y `notifications` incluye un campo `company_id` que se filtra automáticamente en cada consulta a través del middleware `tenant.js`. Se ha verificado que un administrador de la empresa A no puede ver datos de la empresa B aunque manipule el token JWT.

**Panel de SuperAdmin.** Permite al desarrollador (rol superadmin) crear nuevas empresas cliente, asignar el plan contratado (Basic, Pro o Enterprise), activar o desactivar empresas y crear el usuario administrador inicial.

### Métricas y herramientas de validación

- **Pruebas manuales** sobre dispositivos Android reales (Xiaomi y Samsung) y sobre Expo Web en navegador Chrome.
- **Logs de Railway** para verificar el comportamiento del backend ante peticiones reales.
- **Network tab del navegador** para verificar tiempos de respuesta y códigos HTTP.
- **Validación de aislamiento multi-tenant** mediante usuarios de prueba en distintas empresas.
- **Inspección de la base de datos** vía cliente PostgreSQL para confirmar que los datos se persisten con los `company_id` correctos.

### Consecución de objetivos

| Objetivo planteado | Resultado |
|---|---|
| Aplicación móvil funcional en Android | ✓ APK generado y probado |
| Aplicación web responsive | ✓ Desplegada en Railway |
| Backend API REST | ✓ 11 grupos de rutas operativos |
| Multi-tenant con aislamiento real | ✓ Verificado con dos empresas |
| Asistente IA integrado | ✓ Gemma 3 12B funcionando en producción |
| Recuperación de contraseña | ✓ Resend operativo |
| Sistema de notificaciones | ✓ Funcionando en tiempo real |
| Documentación visual de soporte | ✓ Capturas y vídeo demostrativo |

Todos los objetivos planteados al inicio del proyecto se han alcanzado satisfactoriamente, lo que permite afirmar que la plataforma es funcionalmente válida para su comercialización a clientes piloto.

---

## 7. CONCLUSIÓN

El presente trabajo ha consistido en el diseño, desarrollo, despliegue y validación de SolveIT, una plataforma SaaS multi-tenant para la gestión de incidencias informáticas en pequeñas y medianas empresas. A lo largo del proyecto se ha cubierto el ciclo completo de un producto software, desde la identificación de la necesidad de mercado hasta la puesta en producción real con clientes piloto.

Las **principales aportaciones** del trabajo son tres. En primer lugar, se demuestra que es viable construir un producto SaaS completo y profesional con un stack mayoritariamente abierto y servicios cloud gratuitos o de bajo coste, abriendo la puerta a que otros emprendedores con recursos limitados aborden proyectos de complejidad similar. En segundo lugar, se valida que la integración de inteligencia artificial generativa en productos B2B no es solo un reclamo de marketing sino una funcionalidad que aporta valor real reduciendo la carga del equipo de soporte. En tercer lugar, se confirma que el modelo multi-tenant basado en discriminador por columna es suficiente para los volúmenes esperados en el segmento PYME, sin necesidad de bases de datos separadas por cliente.

A nivel **personal y profesional**, el trabajo ha permitido consolidar las competencias adquiridas durante el ciclo formativo, especialmente en programación de servicios y procesos, acceso a datos, programación multimedia y dispositivos móviles. La integración end-to-end de tecnologías heterogéneas (backend, frontend web, móvil, IA, cloud) refleja el perfil profesional demandado actualmente en el mercado laboral.

El proyecto está alineado con la **Agenda 2030** y los Objetivos de Desarrollo Sostenible, especialmente el ODS 8, el ODS 9 y el ODS 12, al contribuir a la digitalización del tejido empresarial español, mejorar la productividad de los trabajadores y democratizar el acceso a herramientas IT que tradicionalmente solo estaban al alcance de grandes corporaciones. Se sitúa, asimismo, en el ámbito de las **economías transformadoras** al ofrecer un producto accesible que reduce la brecha tecnológica entre PYME y grandes empresas.

Como **líneas futuras de trabajo** se proponen las siguientes: la incorporación de un módulo de gestión de activos (CMDB) que permita asociar incidencias con dispositivos y software concretos; la integración con Microsoft Teams y Slack para crear y consultar tickets desde el chat corporativo; el desarrollo de una API pública que permita a clientes con necesidades específicas integrar SolveIT con sus sistemas internos; y la incorporación de un módulo de SLA (Service Level Agreement) para empresas que necesiten garantías formales de tiempos de respuesta.

Para abrir el debate con el tribunal se plantean las siguientes preguntas. ¿Hasta qué punto el uso de modelos de IA gratuitos pero externos compromete la sostenibilidad a largo plazo de un producto SaaS? ¿Es ética la asignación automática de incidencias al técnico con menor carga si esto puede generar desigualdades en la valoración del rendimiento de los empleados? ¿Cómo debe SolveIT evolucionar para cumplir con los requisitos del próximo Reglamento Europeo de Inteligencia Artificial?

---

## 8. BIBLIOGRAFÍA

Atlassian. (2024). *Jira Service Management documentation*. Atlassian Documentation. https://www.atlassian.com/software/jira/service-management

Frasco, S. (2023). *SaaS metrics 2.0: A guide to measuring and improving what matters*. For Entrepreneurs. https://www.forentrepreneurs.com/saas-metrics-2/

Gartner. (2024). *Magic Quadrant for IT Service Management Platforms*. Gartner Research.

Google. (2024). *Gemma: Open models from Google*. Google for Developers. https://ai.google.dev/gemma

Instituto Nacional de Estadística. (2024). *Encuesta sobre el uso de Tecnologías de la Información y las Comunicaciones (TIC) y del comercio electrónico en las empresas 2023-2024*. INE. https://www.ine.es/

Ley 10/2021, de 9 de julio, de trabajo a distancia. *Boletín Oficial del Estado*, 164, de 10 de julio de 2021. https://www.boe.es/eli/es/l/2021/07/09/10

Ley 31/1995, de 8 de noviembre, de Prevención de Riesgos Laborales. *Boletín Oficial del Estado*, 269, de 10 de noviembre de 1995.

Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales. *Boletín Oficial del Estado*, 294, de 6 de diciembre de 2018.

Ministerio de Industria, Comercio y Turismo. (2024). *Cifras PYME: datos enero 2024*. Dirección General de Industria y de la Pequeña y Mediana Empresa. https://industria.gob.es/

Naciones Unidas. (2015). *Transformar nuestro mundo: la Agenda 2030 para el Desarrollo Sostenible*. Resolución A/RES/70/1. https://www.un.org/sustainabledevelopment/es/

Real Decreto 488/1997, de 14 de abril, sobre disposiciones mínimas de seguridad y salud relativas al trabajo con equipos que incluyen pantallas de visualización. *Boletín Oficial del Estado*, 97, de 23 de abril de 1997.

Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales (Reglamento General de Protección de Datos). *Diario Oficial de la Unión Europea*, L 119, de 4 de mayo de 2016.

Red.es. (2024). *Programa Kit Digital: bases reguladoras y convocatorias*. Ministerio para la Transformación Digital. https://www.acelerapyme.gob.es/kit-digital

ServiceNow. (2024). *ServiceNow IT Service Management*. ServiceNow. https://www.servicenow.com/products/itsm.html

---

## 9. ANEXOS

### Anexo I. Capturas de pantalla de la aplicación

*[Insertar capturas de las pantallas principales: login, lista de incidencias, detalle de incidencia, base de conocimiento, foro, asistente IA, panel SuperAdmin]*

### Anexo II. Diagrama de la arquitectura

*[Insertar diagrama mostrando: app móvil → API REST (Railway) → PostgreSQL, con conexiones externas a Resend (email) y Google Gemini (IA)]*

### Anexo III. Modelo entidad-relación de la base de datos

*[Insertar diagrama ER con tablas: companies, users, incidents, comments, incident_history, notifications, knowledge_base, knowledge_ratings, forum_posts, forum_comments, forum_reactions, password_resets, ai_conversations]*

### Anexo IV. Repositorio del código fuente

El código fuente completo del proyecto se encuentra publicado en GitHub bajo el siguiente repositorio:

https://github.com/r-aguado/solveit-app

### Anexo V. URL de la aplicación en producción

- API backend: `https://solveit-app-production.up.railway.app`
- Aplicación web: *[URL de despliegue de Next.js]*
- APK Android: enlace generado por EAS Build de Expo

### Anexo VI. Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| SuperAdmin | superadmin@solveit.com | superadmin1234 |
| Admin (Demo) | admin@solveit.com | admin1234 |
| Usuarios sembrados | *@solveit.com | password |
