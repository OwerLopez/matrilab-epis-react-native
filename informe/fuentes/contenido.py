"""Contenido del informe del LAB 04 (Plataformas Emergentes): MatriLab EPIS con React Native."""
from informe_lib import Informe

REPO = "https://github.com/OwerLopez/matrilab-epis-react-native"
DEMO = "https://owerlopez.github.io/matrilab-epis-react-native/"

inf = Informe()
S, P, L, F, T, C, N = inf.sub, inf.p, inf.lista, inf.figura, inf.tabla, inf.codigo, inf.nota

# =====================================================================================
inf.seccion("1. Descripción general del programa")

S("1.1 Contexto y propósito")
P("**MatriLab EPIS** es una aplicación móvil para gestionar la matrícula en los grupos de laboratorio de la Escuela "
  "Profesional de Ingeniería de Sistemas de la UNSA. Es el mismo dominio que el equipo trabajó en el LAB 01 (selección de "
  "herramienta y requisitos) y en el LAB 02 (prototipo RMAD en FlutterFlow). En esta práctica la aplicación se reconstruye "
  "desde cero con un **framework multiplataforma**, **React Native**, usando únicamente los componentes propios de la "
  "plataforma para organizar cada interfaz.")
P("El programa atiende a tres tipos de usuario. El **estudiante** consulta la oferta de grupos con un semáforo de "
  "vacantes, se matricula sin cruces de horario y obtiene un pase digital con código QR. El **docente o jefe de prácticas** "
  "revisa la nómina de sus grupos y registra la asistencia leyendo el QR con la cámara del teléfono. La **coordinación de "
  "laboratorios** define la capacidad de cada ambiente y la ventana de matrícula. Todas las pantallas comparten un mismo "
  "código TypeScript que se ejecuta como aplicación nativa en Android y como aplicación web.")
P("Los datos de esta versión son de demostración y viven en memoria: el objetivo de la práctica es el diseño y la "
  "organización de las interfaces con los componentes del framework, no la persistencia. Aun así, las reglas de negocio "
  "(cruce de horarios, aforo, ventana de matrícula y verificación del pase) son reales, están aisladas en un módulo de "
  "dominio y se verifican con pruebas automatizadas.")

S("1.2 Árbol de problemas")
P("El diseño parte del diagnóstico realizado en el LAB 01 sobre el proceso de matrícula de laboratorios. Para ordenarlo "
  "se aplicó la técnica del árbol de problemas de la metodología del marco lógico [17]: se identificó un problema central, "
  "sus causas directas e indirectas y los efectos que produce. La Figura 1 muestra el resultado.")
F("img/diagramas/arbol_problemas.png", "Árbol de problemas del proceso de matrícula de laboratorios de la EPIS-UNSA", 1.0, "fig:arbol_problemas")
P("El problema central es que **la matrícula en los laboratorios es lenta, poco transparente y genera sobrecupos y cruces "
  "de horario**. Las cinco causas directas se explican por causas más profundas: las vacantes se publican en listas que no "
  "se actualizan en tiempo real, nadie contrasta el grupo práctico con la teoría ya inscrita, las inscripciones simultáneas "
  "no se procesan como una operación atómica, no existe una constancia digital verificable y la información de cada sala se "
  "coordina por correo. Los efectos llegan hasta el aula: estudiantes rechazados al final del trámite, permutas cuando las "
  "clases ya empezaron, salas con más estudiantes que computadoras y nóminas que el docente recibe semanas tarde.")

S("1.3 Árbol de objetivos y alcance")
P("Cada condición negativa se convirtió en la situación deseada correspondiente (Figura 2). Los **medios fundamentales**, "
  "en la base del árbol, son las acciones concretas que el software puede ejecutar; por eso se tomaron como origen de las "
  "funcionalidades. En la misma figura, debajo de cada medio, se indican las interfaces de MatriLab que lo implementan.")
F("img/diagramas/arbol_objetivos.png", "Árbol de objetivos: los medios fundamentales se traducen en interfaces de MatriLab", 1.0, "fig:arbol_objetivos")
P("El alcance de esta práctica cubre los cinco medios con **doce interfaces** (I1 a I12). Quedan fuera la autenticación "
  "real contra Google Workspace y la persistencia en la nube, que en el LAB 02 se resolvieron con Firebase; aquí se "
  "simulan con un inicio de sesión de demostración y un almacén de estado local, de modo que la aplicación funciona sin "
  "conexión y cualquier evaluador puede probarla.")

S("1.4 Actores y roles")
T("Actores del sistema y lo que cada uno puede hacer en la aplicación",
  ["Rol", "Cuenta de demostración", "Responsabilidades en MatriLab", "Interfaces"],
  [["Estudiante", "Lopez Arela, Ower Frank · CUI 20213412", "Consultar la oferta, matricularse sin cruces, ver su horario, mostrar su pase QR y anular una matrícula dentro de la ventana.", "I1–I6, I12"],
   ["Docente / jefe de prácticas", "Mg. Carla Medina Rojas (ficticia)", "Revisar la ocupación de sus grupos, consultar la nómina, registrar asistencia con QR o código manual y exportar la nómina.", "I1, I7–I9, I12"],
   ["Coordinación de laboratorios", "`laboratorios.epis@unsa.edu.pe`", "Ajustar capacidad y estado de cada ambiente, definir la ventana de matrícula y revisar los grupos agotados.", "I1, I10–I12"]],
  [0.17, 0.22, 0.46, 0.15])

S("1.5 Requisitos funcionales atendidos")
P("La Tabla 2 relaciona los requisitos funcionales formulados en el LAB 01 con la interfaz y el mecanismo que los "
  "resuelve en esta versión.")
T("Requisitos funcionales del LAB 01 y cómo se resuelven en la aplicación React Native",
  ["Código", "Requisito", "Cómo se resuelve", "Interfaz"],
  [["RF-01", "Autenticación institucional", "Validación del dominio `@unsa.edu.pe` y de la contraseña; acceso de demostración por rol.", "I1"],
   ["RF-02", "Catálogo de cursos y grupos", "`SectionList` agrupada por curso con buscador y filtros.", "I3"],
   ["RF-03", "Vacantes en vivo", "Semáforo y barra de ocupación derivados del estado global; se recalculan al matricular o anular.", "I2, I3, I4"],
   ["RF-04", "Validación anti-cruces", "`validarMatricula` contrasta el grupo con los laboratorios y la teoría inscritos (RN-02).", "I4"],
   ["RF-05", "Reserva atómica", "`reservarCupo` dentro del reductor: el cupo se descuenta y la matrícula se registra en una sola transición.", "I4"],
   ["RF-06", "Ficha digital con QR", "`react-native-qrcode-svg` con contenido firmado por una huella FNV-1a.", "I5"],
   ["RF-07", "Horario consolidado y nómina", "Cuadrícula semanal con bloques posicionados y nómina virtualizada.", "I6, I7, I8"],
   ["RF-08", "Asistencia por escaneo QR", "`CameraView` de `expo-camera` con lector de códigos QR y verificación del pase.", "I9"],
   ["RF-09", "Parametrización de laboratorios", "Capacidad con *stepper*, estado con `Switch` y edición en `Modal`; ventana de matrícula validada.", "I10, I11"],
   ["RF-10", "Exportación de nóminas", "CSV con separador punto y coma compartido con la API `Share`.", "I8"]],
  [0.09, 0.23, 0.53, 0.15])

S("1.6 Elección del framework")
P("La guía permite Flutter, React Native o Xamarin. El equipo eligió **React Native con Expo** por tres razones "
  "verificables. Primero, React Native dibuja la interfaz con **vistas nativas** de cada sistema operativo: un `<View>` es "
  "un `ViewGroup` en Android y un `UIView` en iOS [2], lo que responde de forma directa al requisito de usar los "
  "componentes propios de la plataforma. Segundo, el LAB 02 ya se había construido sobre Flutter mediante FlutterFlow; "
  "usar otro framework permite comparar ambos enfoques con evidencia propia. Tercero, Expo [14] permite ejecutar la "
  "aplicación en un teléfono o emulador con Expo Go sin compilar proyectos nativos, y exportarla a la web con el mismo "
  "código.")
T("Versiones de la pila tecnológica utilizada",
  ["Componente", "Versión", "Uso en el proyecto"],
  [["React Native", "0.88.0", "Framework multiplataforma; Nueva Arquitectura (Fabric, JSI) y motor Hermes."],
   ["React", "19.3.0", "Modelo de componentes, hooks y contexto."],
   ["Expo SDK", "58 (CLI 58.1.13)", "Herramientas, `expo-camera`, `expo-status-bar`, exportación web."],
   ["TypeScript", "6.0", "Tipado estático de modelo, navegación y componentes."],
   ["React Navigation", "7.x", "`native-stack` y `bottom-tabs`."],
   ["react-native-safe-area-context", "5.10", "Márgenes seguros (reemplazo del `SafeAreaView` del núcleo)."],
   ["react-native-svg / qrcode-svg", "15.16 / 6.3", "Dibujo vectorial del código QR."],
   ["react-native-web", "0.21", "Traducción de los mismos componentes al DOM."],
   ["Jest + jest-expo", "30 / 58", "Pruebas unitarias del dominio y del reductor."],
   ["Node.js / npm", "22.14 / 10.9", "Entorno de ejecución de las herramientas."]],
  [0.30, 0.18, 0.52])

# =====================================================================================
inf.seccion("2. Diseño de interfaces")

S("2.1 Funcionalidades derivadas del árbol de objetivos")
P("Cada medio fundamental del árbol de objetivos se descompuso en funcionalidades concretas. La Tabla 4 muestra esa "
  "trazabilidad, que es la base del diseño: ninguna pantalla se agregó sin un medio que la justifique.")
T("Trazabilidad entre medios del árbol de objetivos, funcionalidades e interfaces",
  ["Medio", "Funcionalidad", "Interfaz"],
  [["1.1 Catálogo conectado", "F-01 Iniciar sesión con correo institucional y elegir rol", "I1 Inicio de sesión"],
   ["1.1 Catálogo conectado", "F-02 Ver resumen personal: ventana, créditos, vacantes y laboratorios matriculados", "I2 Panel del estudiante"],
   ["1.1 Catálogo conectado", "F-03 Explorar grupos por curso con semáforo, buscador y filtros", "I3 Catálogo"],
   ["2.1 Contraste de horario", "F-04 Revisar el detalle del grupo y el mapa de puestos; validar cruces antes de confirmar", "I4 Detalle del grupo"],
   ["2.1 Contraste de horario", "F-05 Consultar el horario semanal con teoría y laboratorios", "I6 Horario"],
   ["3.1 Operación única", "F-06 Confirmar la matrícula con reserva atómica del cupo", "I4 Detalle del grupo"],
   ["4.1 Código verificable", "F-07 Mostrar y compartir el pase con QR y código de verificación", "I5 Pase QR"],
   ["4.1 Código verificable", "F-08 Monitorear la ocupación de los grupos del docente", "I7 Panel docente"],
   ["4.1 Código verificable", "F-09 Consultar la nómina, marcar asistencia y exportar CSV", "I8 Nómina"],
   ["4.1 Código verificable", "F-10 Leer el QR con la cámara o digitar el código", "I9 Escáner"],
   ["5.1 Parametrización", "F-11 Ajustar capacidad, estado y datos de cada laboratorio", "I10 Laboratorios"],
   ["5.1 Parametrización", "F-12 Configurar la ventana de matrícula y las reglas; revisar grupos agotados", "I11 Matrícula"],
   ["Transversal", "F-13 Elegir tema claro u oscuro, ajustar avisos y cerrar sesión", "I12 Perfil"]],
  [0.24, 0.53, 0.23])

S("2.2 Mapa de navegación")
P("La estructura de navegación se definió antes de dibujar las pantallas (Figura 3). Una **pila nativa** raíz contiene el "
  "inicio de sesión, tres navegadores de **pestañas inferiores** (uno por rol) y tres pantallas que se apilan sobre las "
  "pestañas: el detalle del grupo, que se presenta como hoja modal, el pase QR y la nómina. Así cada rol ve solo sus "
  "opciones y el botón Atrás del sistema se comporta como el usuario espera.")
F("img/diagramas/navegacion.png", "Mapa de navegación de MatriLab: pila nativa raíz y pestañas por rol", 1.0, "fig:navegacion")

S("2.3 Sistema visual")
P("Para que las doce interfaces se vean consistentes se definieron *tokens* de diseño en `src/theme/tokens.ts`. Se "
  "conservaron los colores institucionales usados desde el LAB 01 y se definió una variante oscura de cada color, ya que "
  "la aplicación sigue el tema del sistema operativo.")
T("Tokens de diseño de la aplicación",
  ["Token", "Claro", "Oscuro", "Uso"],
  [["primario", "#19375A", "#7FA7D9", "Botones principales, cabeceras de tarjetas, grupo seleccionado."],
   ["marca", "#C3141E", "#FF6B6B", "Acciones decisivas (Ingresar, Confirmar matrícula) y pestaña activa."],
   ["éxito / alerta / peligro", "#1E7B45 / #A35F00 / #B3261E", "variantes claras", "Semáforo de vacantes: verde, ámbar y rojo."],
   ["fondo / superficie", "#F4F6F9 / #FFFFFF", "#0F1720 / #17212C", "Fondo de pantalla y de tarjetas."],
   ["espacio", "4 · 8 · 12 · 16 · 24 · 32", "igual", "Escala de 4 pt para márgenes, rellenos y `gap`."],
   ["radio", "8 · 12 · 16 · 999", "igual", "Esquinas de controles, tarjetas y píldoras."],
   ["tipo", "26 · 18 · 15 · 13 · 12", "igual", "Título, subtítulo, cuerpo, etiqueta y pie (en dp)."]],
  [0.20, 0.27, 0.20, 0.33])

S("2.4 Mockups de baja fidelidad")
P("Con las funcionalidades y la navegación definidas se dibujaron mockups de baja fidelidad para las doce interfaces "
  "(Figuras 4 y 5). Se usaron solo grises, sin textos reales, para discutir la **organización** de cada pantalla antes que "
  "su apariencia. Cada región lleva una etiqueta roja con el componente de React Native previsto y los recuadros "
  "discontinuos marcan contenedores de layout (filas, columnas o listas). Ese mismo boceto guió luego la implementación: "
  "en la sección 4.6 cada mockup aparece junto a la captura real de la pantalla.")
F("img/diagramas/mockups_estudiante.png", "Mockups de baja fidelidad de las interfaces del estudiante (I1 a I6)", 0.8, "fig:mockups_e")
F("img/diagramas/mockups_docente_admin.png", "Mockups de baja fidelidad de las interfaces del docente y de administración (I7 a I12)", 0.8, "fig:mockups_d")
P("Las decisiones de organización más importantes que quedaron fijadas en los mockups fueron las siguientes:")
L(["**Listas largas virtualizadas.** El catálogo, el panel docente, la nómina y los laboratorios se planificaron como "
   "`SectionList` o `FlatList`, nunca como un `ScrollView` con muchos hijos.",
   "**Acción principal fija.** En el detalle del grupo y en la nómina el botón principal queda en un pie fuera del área "
   "desplazable, siempre visible.",
   "**Superposiciones con posición absoluta.** El sello del pase, la guía de encuadre del escáner y los bloques del "
   "horario se colocan con `position: 'absolute'` sobre su contenedor.",
   "**Cuadrículas que se reacomodan.** Los indicadores (KPI) y el mapa de puestos usan `flexWrap`, de modo que el número "
   "de columnas depende del ancho disponible y no de valores fijos."])

S("2.5 Criterios de usabilidad y accesibilidad")
L(["Área táctil mínima de **48 dp** en botones y campos (`minHeight: 48`), y `hitSlop` en iconos pequeños.",
   "Todos los controles tienen `accessibilityLabel` y `accessibilityRole`; las filas de la nómina se anuncian como casillas "
   "(`accessibilityRole=\"checkbox\"`) con su estado.",
   "Los mensajes de error y de validación usan `accessibilityLiveRegion` para que el lector de pantalla los lea al aparecer.",
   "El semáforo nunca depende solo del color: siempre va acompañado del texto *Disponible*, *Últimos cupos* o *Agotado*.",
   "Tema claro y oscuro con contraste suficiente; la escala de texto del sistema (`fontScale`) se respeta y se muestra en el perfil."])

# =====================================================================================
inf.seccion("3. Componentes de React Native para la organización de la interfaz")

S("3.1 Cómo dibuja React Native una interfaz")
P("En React Native la interfaz se describe con componentes de React escritos en JavaScript o TypeScript, pero lo que "
  "aparece en pantalla no es HTML: el renderizador **Fabric** traduce cada componente del núcleo a una vista nativa del "
  "sistema operativo [2], [13]. Las posiciones y tamaños se calculan con **Yoga**, un motor de layout multiplataforma que "
  "implementa el modelo Flexbox [15]. La Tabla 6 resume la correspondencia documentada para los componentes básicos.")
T("Componentes del núcleo y la vista nativa que los representa en cada plataforma (según [2])",
  ["Componente", "Android", "iOS", "Web (react-native-web)", "Función"],
  [["`<View>`", "ViewGroup", "UIView", "`<div>`", "Contenedor con flexbox, estilo, toques y accesibilidad."],
   ["`<Text>`", "TextView", "UITextView", "`<p>`", "Muestra y anida texto con estilos."],
   ["`<Image>`", "ImageView", "UIImageView", "`<img>`", "Muestra imágenes locales o remotas."],
   ["`<ScrollView>`", "ScrollView", "UIScrollView", "`<div>` desplazable", "Contenedor genérico con desplazamiento."],
   ["`<TextInput>`", "EditText", "UITextField", "`<input>`", "Entrada de texto con teclado del sistema."]],
  [0.15, 0.15, 0.15, 0.19, 0.36])
P("Esta correspondencia explica por qué una aplicación React Native se siente propia de cada sistema: el `Switch` de la "
  "configuración es el interruptor de Android, el teclado es el del teléfono y la pila de navegación usa las transiciones "
  "nativas. A la vez, todo se describe con un solo árbol de componentes, que es lo que permite compartir el código.")

S("3.2 Flexbox en React Native")
P("Toda la organización espacial se hace con Flexbox. Un contenedor define un **eje principal** (`flexDirection`) y "
  "distribuye a sus hijos a lo largo de él (`justifyContent`) y del eje transversal (`alignItems`). La documentación "
  "oficial advierte que, aunque el modelo es el de CSS, **los valores por defecto cambian** [1]:")
L(["`flexDirection` vale `'column'` (en la web vale `'row'`): por eso, sin indicar nada, los hijos se apilan.",
   "`alignContent` vale `'flex-start'` en lugar de `'stretch'`.",
   "`flexShrink` vale `0` en lugar de `1`: un hijo no se encoge salvo que se indique.",
   "`flex` acepta un solo número, no la forma abreviada de tres valores de CSS."])
P("La Figura 6 reproduce, con las mismas propiedades que usa la app, los ocho patrones de layout que más se repiten en "
  "MatriLab.")
F("img/diagramas/flexbox.png", "Patrones de layout con Flexbox utilizados en MatriLab", 1.0, "fig:flexbox")
T("Propiedades de layout más usadas y dónde se aplican",
  ["Propiedad", "Valores usados", "Ejemplo en MatriLab"],
  [["`flexDirection`", "`'row'`, `'column'`", "Filas icono/texto/acción; formularios en columna."],
   ["`flex`", "`1`", "El texto de una fila ocupa el espacio que dejan avatar e insignia."],
   ["`justifyContent`", "`'space-between'`, `'center'`", "Cabecera de tarjeta con título e insignia; botones centrados."],
   ["`alignItems` / `alignSelf`", "`'center'`, `'flex-start'`, `'stretch'`", "Insignias que no se estiran; columna de datos del pase."],
   ["`flexWrap` + `gap`", "`'wrap'`, 6–12 dp", "Mapa de puestos del laboratorio y KPI en dos columnas."],
   ["`flexBasis` / `flexGrow`", "`'47%'`, `1`", "Cada KPI ocupa media fila y absorbe el sobrante."],
   ["`position`", "`'absolute'` con `top/left/right/bottom`", "Sello del pase, guía del escáner, bloques del horario."],
   ["`width` en porcentaje", "`'50%'` y porcentajes calculados", "Datos del pase en dos columnas; relleno de la barra de ocupación."]],
  [0.24, 0.30, 0.46])

S("3.3 Contenedores de organización")
L(["**View.** Es el bloque de construcción de toda pantalla. En MatriLab no se usa ninguna librería de componentes "
   "visuales: tarjetas, botones, chips, insignias y barras de progreso se construyeron sobre `View`, `Text` y `Pressable` "
   "(archivo `src/components/ui.tsx`).",
   "**SafeAreaView.** Evita que el contenido quede bajo la barra de estado o la muesca. La documentación de React Native "
   "marca el `SafeAreaView` del núcleo como obsoleto y recomienda `react-native-safe-area-context` [16], que funciona "
   "también en Android; la aplicación usa este último en el inicio de sesión y con `SafeAreaProvider` en la raíz.",
   "**ScrollView.** Contenedor desplazable que monta todos sus hijos a la vez [3]. Se reserva para pantallas de contenido "
   "acotado: panel del estudiante, detalle del grupo, pase QR, horario, configuración y perfil. Con `horizontal` se usa "
   "para la fila de filtros del catálogo y para el horario cuando la pantalla es angosta.",
   "**KeyboardAvoidingView.** Ajusta el espacio cuando aparece el teclado [8]. Su comportamiento difiere por plataforma, "
   "por eso se usa `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` en el inicio de sesión y en el escáner.",
   "**Modal.** Presenta contenido sobre la pantalla actual [9]. Con `transparent` y `animationType=\"slide\"` se "
   "construyó una hoja inferior para editar los datos de un laboratorio; `onRequestClose` atiende el botón Atrás de Android."])

S("3.4 Listas virtualizadas")
P("Cuando la cantidad de elementos crece, un `ScrollView` desperdicia memoria porque dibuja todo aunque no se vea. "
  "`FlatList` y `SectionList` solo montan los elementos cercanos a la zona visible y reciclan el resto [4], [5], [18]. "
  "La Tabla 8 resume cómo se configuró cada lista.")
T("Configuración de las listas virtualizadas de la aplicación",
  ["Interfaz", "Componente", "Propiedades clave", "Motivo"],
  [["I3 Catálogo", "`SectionList`", "`sections`, `renderSectionHeader`, `stickySectionHeadersEnabled`, `ListEmptyComponent`", "Agrupar los grupos por curso con el nombre del curso fijo arriba al desplazarse."],
   ["I7 Panel docente", "`FlatList`", "`ListHeaderComponent`, `ItemSeparatorComponent`", "Saludo y KPI dentro de la misma lista, sin anidar listas en un `ScrollView`."],
   ["I8 Nómina", "`FlatList`", "`stickyHeaderIndices={[0]}`, filas de alto fijo", "Resumen de asistencia y buscador siempre visibles sobre la lista de estudiantes."],
   ["I10 Laboratorios", "`FlatList`", "`numColumns`, `columnWrapperStyle`, `key={columnas}`", "Rejilla de 1, 2 o 3 columnas según el ancho de la ventana."]],
  [0.15, 0.14, 0.38, 0.33])
N("`numColumns` no puede cambiar mientras la lista está montada. Por eso en I10 la propiedad `key` depende del número de "
  "columnas: al girar el teléfono React desmonta la lista y la vuelve a crear con la nueva rejilla.", "info")

S("3.5 Posicionamiento, dimensiones y adaptación")
L(["**`position: 'absolute'`** saca a un elemento del flujo y lo ubica respecto de su contenedor. `StyleSheet.absoluteFill` "
   "es el atajo para cubrirlo por completo, como hace la vista de cámara del escáner.",
   "**Porcentajes.** `width` y `height` aceptan porcentajes del contenedor [12]; el relleno de la barra de ocupación "
   "recibe como ancho el porcentaje calculado de puestos ocupados.",
   "**useWindowDimensions** devuelve el ancho y alto de la ventana y se actualiza solo al rotar o redimensionar [10]. Con él "
   "se calculan el ancho de cada día del horario, el tamaño del QR y las columnas de la lista de laboratorios.",
   "**Platform** permite pequeñas diferencias por sistema (`Platform.OS`, `Platform.Version`) [11].",
   "**StyleSheet** agrupa los estilos de cada archivo y ofrece `hairlineWidth`, la línea más fina que puede dibujar la "
   "pantalla, usada en bordes y separadores [6].",
   "**useColorScheme** informa si el sistema está en modo claro u oscuro; el `ThemeContext` lo usa para elegir la paleta."])

S("3.6 Componentes de interacción y retroalimentación")
T("Componentes de interacción utilizados",
  ["Componente o API", "Uso en MatriLab"],
  [["`Pressable`", "Base de botones, chips, tarjetas tocables y filas de la nómina. Su `style` recibe `pressed` para el efecto visual y en Android se agrega `android_ripple` [7]."],
   ["`TextInput`", "Correo y contraseña (`secureTextEntry`), buscadores, fechas de la ventana y código de verificación filtrado a hexadecimal."],
   ["`Switch`", "Mantener sesión, habilitar laboratorio, reglas de matrícula y avisos del perfil."],
   ["`ActivityIndicator`", "Indicador mientras se confirma la reserva del puesto."],
   ["`RefreshControl`", "Gesto de deslizar hacia abajo para actualizar el panel del estudiante."],
   ["`Alert`", "Diálogo nativo para confirmar la anulación de una matrícula y avisar cambios guardados."],
   ["`Share`", "Hoja nativa de compartir para el pase y para la nómina en CSV."],
   ["`Image`", "Logotipo de la EPIS en el inicio de sesión con `resizeMode=\"contain\"`."],
   ["`StatusBar` (expo-status-bar)", "Texto claro u oscuro de la barra de estado según el fondo de la pantalla."],
   ["`CameraView` (expo-camera)", "Vista previa de la cámara con lectura de códigos QR (`barcodeScannerSettings`) [19]."]],
  [0.28, 0.72])

S("3.7 Navegación nativa")
P("React Native no incluye un navegador en su núcleo; se usó **React Navigation** [20], [21]. `createNativeStackNavigator` "
  "delega la pila en los componentes nativos (fragmentos en Android y `UINavigationController` en iOS), por lo que las "
  "transiciones y el gesto de volver son los del sistema. `presentation: 'modal'` presenta el detalle del grupo como una "
  "hoja. `createBottomTabNavigator` genera la barra de pestañas de cada rol; sus íconos cambian entre la versión "
  "rellena y la de contorno según la pestaña activa.")

S("3.8 Catálogo de componentes por interfaz")
T("Componentes de React Native utilizados en cada interfaz",
  ["Interfaz", "Componentes de organización y layout", "Componentes de interacción"],
  [["I1 Inicio de sesión", "SafeAreaView, KeyboardAvoidingView, ScrollView, View (maxWidth)", "TextInput, Pressable, Switch, Image, StatusBar"],
   ["I2 Panel del estudiante", "ScrollView, View con flexWrap y flexBasis", "RefreshControl, Pressable, Alert"],
   ["I3 Catálogo", "SectionList, ScrollView horizontal", "TextInput, Pressable (chips y tarjetas)"],
   ["I4 Detalle del grupo", "ScrollView, View con flexWrap, pie fijo", "Pressable, ActivityIndicator"],
   ["I5 Pase QR", "ScrollView, position absolute, width 50 %", "QRCode (SVG), Share"],
   ["I6 Horario", "ScrollView (vertical y horizontal), position absolute, useWindowDimensions", "Pressable (chips)"],
   ["I7 Panel docente", "FlatList con ListHeaderComponent", "Pressable"],
   ["I8 Nómina", "FlatList con stickyHeaderIndices", "TextInput, Pressable (checkbox), Share"],
   ["I9 Escáner", "KeyboardAvoidingView, ScrollView, absoluteFill", "CameraView, TextInput"],
   ["I10 Laboratorios", "FlatList con numColumns, Modal", "Pressable (stepper), Switch, TextInput"],
   ["I11 Matrícula", "ScrollView, filas space-between", "TextInput, Switch, Alert"],
   ["I12 Perfil", "ScrollView, filas de ajustes", "Pressable, Switch, Platform, useWindowDimensions"]],
  [0.22, 0.43, 0.35])

# =====================================================================================
inf.seccion("4. Descripción del proceso de desarrollo")

S("4.1 Entorno de trabajo")
T("Entorno de desarrollo y ejecución",
  ["Elemento", "Detalle"],
  [["Sistema operativo", "Windows 11 Pro"],
   ["Editor", "Visual Studio Code"],
   ["Node.js / npm", "22.14.0 / 10.9.2"],
   ["Expo CLI", "58.1.13 (proyecto con Expo SDK 58)"],
   ["Emulador", "Android Studio · Pixel 7a · Android 16 (API 36) · 1080 × 2400 px, 420 dpi (411 × 914 dp)"],
   ["Cliente de ejecución", "Expo Go 58.0.5 en el emulador"],
   ["Control de versiones", "Git y GitHub"]],
  [0.28, 0.72])

S("4.2 Creación del proyecto y estructura")
P("El proyecto se creó con la plantilla en blanco de TypeScript de Expo y se agregaron las dependencias con "
  "`npx expo install`, que elige versiones compatibles con el SDK instalado:")
C("""npx create-expo-app@latest matrilab-rn --template blank-typescript
cd matrilab-rn
npx expo install @react-navigation/native @react-navigation/native-stack \\
  @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context \\
  react-native-svg react-native-qrcode-svg expo-camera @expo/vector-icons
npx expo install react-native-web react-dom @expo/metro-runtime
npx expo install jest-expo jest @types/jest -- --save-dev""", "Creación del proyecto e instalación de dependencias", "bash")
P("El código se organizó por responsabilidad: dominio sin dependencias de React, estado, tema, componentes reutilizables, "
  "navegación y una carpeta de pantallas por rol.")
C("""matrilab-rn/
|-- App.tsx                  # proveedores: área segura, tema, estado y navegación
|-- app.json                 # configuración de Expo (nombre, orientación, permisos)
|-- src/
|   |-- domain/              # types.ts, reglas.ts (reglas puras), datos.ts (2026-B)
|   |-- state/AppStore.tsx   # Context + useReducer y selectores
|   |-- theme/               # tokens.ts y ThemeContext.tsx
|   |-- components/ui.tsx    # Tarjeta, Boton, Chip, Insignia, BarraProgreso, Kpi...
|   |-- navigation/          # RootNavigator.tsx y tipos.ts
|   `-- screens/             # LoginScreen, PerfilScreen y carpetas estudiante/,
|                            # docente/ y admin/ con las demás interfaces
|-- __tests__/reglas.test.ts # 31 pruebas unitarias
|-- herramientas/capturas-android.mjs  # recorrido automático de capturas
`-- informe/                 # este informe: LaTeX, DOCX, figuras y generadores""", "Estructura de carpetas del proyecto", "Texto")

S("4.3 Arquitectura")
P("La aplicación se dividió en capas (Figura 7). La capa de presentación solo conoce el estado a través de hooks; el "
  "estado aplica las reglas del dominio, y el dominio está formado por funciones puras que no importan nada de React ni "
  "de la plataforma. Esa separación permitió probar las reglas de negocio con Jest en un segundo, sin emulador.")
F("img/diagramas/arquitectura.png", "Arquitectura por capas de MatriLab EPIS", 1.0, "fig:arquitectura")

S("4.4 Modelo de dominio y reglas de negocio")
P("Los horarios se guardan en minutos desde la medianoche (por ejemplo, 07:00 es 420). Con esa representación la regla "
  "RN-02 de cruce de horario se reduce a comparar intervalos; los extremos no cuentan, de modo que un bloque que termina a "
  "las 08:40 no choca con otro que empieza a las 08:40.")
C("""/** RN-02: dos bloques se cruzan si comparten día y sus intervalos se solapan (los extremos no cuentan). */
export function haySolape(a: Bloque, b: Bloque): boolean {
  return a.dia === b.dia && a.inicio < b.fin && b.inicio < a.fin;
}

/** Semáforo de vacantes: rojo sin cupo, ámbar con menos del 30 % libre, verde en otro caso. */
export function semaforo(t: Turno): Semaforo {
  const libres = cuposLibres(t);
  if (libres === 0) return 'rojo';
  return libres / t.cuposTotales < 0.3 ? 'ambar' : 'verde';
}""", "src/domain/reglas.ts · cruce de horario y semáforo")
P("`validarMatricula` aplica los controles en el mismo orden del proceso BPMN del LAB 01 y devuelve el primer motivo de "
  "rechazo con un mensaje legible: ventana cerrada, grupo ya matriculado, otro grupo del mismo curso, límite de "
  "laboratorios, cruce con un laboratorio, cruce con la teoría y grupo sin cupo. La reserva se hace con una función "
  "inmutable: si entre la consulta y la confirmación el cupo se agotó, no modifica nada.")
C("""export function reservarCupo(turnos: Turno[], turnoId: string): { turnos: Turno[]; reservado: boolean } {
  const objetivo = turnos.find((t) => t.id === turnoId);
  if (!objetivo || cuposLibres(objetivo) === 0) return { turnos, reservado: false };
  return {
    reservado: true,
    turnos: turnos.map((t) => (t.id === turnoId ? { ...t, cuposOcupados: t.cuposOcupados + 1 } : t)),
  };
}""", "src/domain/reglas.ts · reserva atómica del cupo (RF-05)")
P("El pase QR contiene la cadena `MATRILAB|matrícula|grupo|estudiante|huella`. La huella es un FNV-1a de 32 bits sobre "
  "los cuatro primeros campos: si alguien altera el contenido, la huella deja de coincidir y el escáner rechaza el pase. "
  "No pretende ser un mecanismo criptográfico; en producción la verificación debe hacerse en el servidor.")

S("4.5 Estado global, tema y componentes propios")
P("El estado se maneja con `useReducer` dentro de un contexto. El reductor es la única puerta para cambiar los cupos: la "
  "acción `MATRICULAR` reserva el cupo y registra la matrícula en la misma transición, lo que en la interfaz garantiza que "
  "dos toques seguidos no ocupen dos puestos.")
C("""case 'MATRICULAR': {
  if (!e.usuario) return e;
  const { turnos, reservado } = reservarCupo(e.turnos, a.turnoId);
  if (!reservado) return e;
  const id = `M-${String(e.matriculas.length + 1).padStart(4, '0')}`;
  return {
    ...e,
    turnos,
    matriculas: [...e.matriculas, { id, estudianteId: e.usuario.id, turnoId: a.turnoId, fecha: a.ahora, codigo: id, estado: 'confirmada' }],
  };
}""", "src/state/AppStore.tsx · acción MATRICULAR")
P("Los componentes visuales propios se construyeron solo con primitivas del núcleo. El botón, por ejemplo, es un "
  "`Pressable` cuyo estilo depende de la variante y del estado `pressed`, con ripple nativo en Android y estados de "
  "accesibilidad:")
C("""<Pressable
  onPress={onPress}
  disabled={deshabilitado || cargando}
  accessibilityRole="button"
  accessibilityLabel={accessibilityLabel ?? titulo}
  accessibilityState={{ disabled: Boolean(deshabilitado), busy: Boolean(cargando) }}
  android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
  style={({ pressed }) => [
    estilos.boton,
    { backgroundColor: fondo, borderColor: variante === 'fantasma' ? c.borde : fondo, opacity: deshabilitado ? 0.45 : pressed ? 0.85 : 1 },
    style,
  ]}
>""", "src/components/ui.tsx · componente Boton")

S("4.6 Desarrollo de las interfaces")
P("A continuación se describe cada interfaz. En cada figura, el panel (a) es el mockup de la sección 2.4, el panel (b) "
  "es la captura real en el emulador Android y, cuando existe, el panel (c) muestra un estado alternativo de la misma "
  "pantalla.")

INTERFACES = [
    ("I1 · Inicio de sesión institucional", "fig_i01", "Inicio de sesión: (a) mockup, (b) pantalla inicial, (c) validación del dominio institucional",
     "Pantalla de entrada con la marca sobre el color primario y una tarjeta blanca centrada. Contiene el logotipo de la EPIS, "
     "los campos de correo y contraseña con iconos, el botón para mostrar u ocultar la contraseña, el interruptor *Mantener la "
     "sesión iniciada*, el botón **Ingresar** y tres accesos de demostración por rol. Al ingresar un correo que no termina en "
     "`@unsa.edu.pe` aparece el mensaje de error del panel (c).",
     "La pantalla combina `SafeAreaView` (márgenes seguros), `KeyboardAvoidingView` y un `ScrollView` con `flexGrow: 1` y "
     "`justifyContent: 'center'`, de modo que el formulario queda centrado pero sube cuando aparece el teclado. La tarjeta tiene "
     "`width: '100%'` con `maxWidth: 440` para no estirarse en tabletas ni en la web. Los tres accesos de demostración son una "
     "fila (`flexDirection: 'row'`) de botones con `flex: 1`, que se reparten el ancho por igual. Como el fondo es oscuro, "
     "la pantalla fija `<StatusBar style=\"light\" />`.",
     """const validar = () => {
  const limpio = correo.trim().toLowerCase();
  if (!/^[a-z0-9._-]+@unsa\\.edu\\.pe$/.test(limpio)) return setError('Usa tu correo institucional @unsa.edu.pe.');
  if (clave.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
  const u = USUARIOS.find((x) => x.correo === limpio);
  if (!u || clave !== CLAVE_DEMO) return setError('Correo o contraseña incorrectos.');
  setError(null);
  entrar(u);
};""", "LoginScreen.tsx · validación del formulario"),
    ("I2 · Panel del estudiante", "fig_i02", "Panel del estudiante: (a) mockup, (b) tema claro, (c) tema oscuro después de matricularse en Plataformas Emergentes",
     "Muestra el saludo con avatar e iniciales, una tarjeta con el estado de la ventana de matrícula y su fecha de cierre, "
     "cuatro indicadores (laboratorios matriculados, créditos, vacantes libres en la oferta y laboratorios que aún puede "
     "tomar) y la lista *Mis laboratorios*, donde cada matrícula tiene una franja con el color del curso y los botones "
     "**Ver pase QR** y **Anular**. En el panel (c) se ve la misma pantalla en tema oscuro, ya con dos laboratorios.",
     "Un `ScrollView` con `RefreshControl` permite deslizar para actualizar. Los cuatro KPI están en una fila con "
     "`flexWrap: 'wrap'` y cada `Kpi` usa `flexBasis: '47%'` y `flexGrow: 1`: en un teléfono se forman dos columnas y en "
     "una pantalla ancha caben cuatro sin cambiar el código. La tarjeta de cada matrícula es una fila donde la franja de color "
     "es un `View` de 5 dp de ancho y el contenido ocupa el resto con `flex: 1`. Anular usa el `Alert` nativo con un botón "
     "de estilo destructivo.",
     """<View style={estilos.kpis}>
  <Kpi valor={String(activas.length)} etiqueta="Laboratorios matriculados" icono="flask-outline" />
  <Kpi valor={String(creditos)} etiqueta="Créditos con laboratorio" icono="ribbon-outline" color={c.marca} />
  ...
</View>
// kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.m }
// kpi:  { flexBasis: '47%', flexGrow: 1 }""", "DashboardScreen.tsx · cuadrícula de indicadores"),
    ("I3 · Catálogo de grupos con semáforo", "fig_i03", "Catálogo: (a) mockup, (b) todos los grupos, (c) filtro Sin cruce de horario",
     "Lista todos los grupos de laboratorio agrupados por curso. Cada tarjeta muestra la letra del grupo, día y hora, ambiente "
     "y docente, la insignia del semáforo (*Agotado*, *Últimos cupos*, *Disponible*), una barra de ocupación y el texto "
     "*N de M PC libres*. Arriba hay un buscador y tres filtros. Con el filtro *Sin cruce de horario* (panel c) desaparece "
     "el grupo C de Plataformas Emergentes, que coincide con la teoría de Gestión de Proyectos del jueves.",
     "La lista es una `SectionList` con una sección por curso; `renderSectionHeader` dibuja el punto de color y el nombre del "
     "curso, y `stickySectionHeadersEnabled` lo mantiene fijo mientras se desplazan sus grupos. Los filtros son chips dentro "
     "de un `ScrollView` horizontal, de modo que pueden agregarse más sin romper el diseño. En cada tarjeta, la letra del "
     "grupo es un cuadro de 44 × 44 dp centrado con `alignItems` y `justifyContent`, el texto toma el espacio libre con "
     "`flex: 1` y la insignia queda al final de la fila.",
     """<SectionList
  sections={secciones}                 // [{ curso, data: Turno[] }, ...]
  keyExtractor={(t) => t.id}
  renderItem={renderTurno}             // Tarjeta tocable con semáforo y barra
  stickySectionHeadersEnabled
  renderSectionHeader={({ section }) => (
    <View style={estilos.seccion}>{/* punto de color + nombre del curso */}</View>
  )}
  ListEmptyComponent={<Vacio icono="search-outline" titulo="Sin resultados" detalle="..." />}
/>""", "CatalogoScreen.tsx · lista por secciones"),
    ("I4 · Detalle del grupo y confirmación", "fig_i04", "Detalle del grupo: (a) mockup, (b) grupo B disponible, (c) grupo C bloqueado por cruce con la teoría (RN-02)",
     "Se abre como hoja modal desde el catálogo. Presenta el curso, las insignias de grupo y semáforo, una tarjeta con "
     "horario, ambiente, docente y equipamiento, y el **mapa de puestos**: una celda por computadora, en rojo las ocupadas y "
     "en verde las libres. Debajo, un aviso verde confirma que no hay cruces; si los hay, el aviso rojo explica con qué curso "
     "y en qué horario, y el botón **Confirmar matrícula** queda deshabilitado (panel c).",
     "El mapa de puestos es un `View` con `flexDirection: 'row'`, `flexWrap: 'wrap'` y `gap: 6`, cuyas celdas miden 46 × 40 "
     "dp. Con 20, 25 o 30 computadoras la cuadrícula se reacomoda sola en cualquier ancho. El botón de confirmación vive en un "
     "pie **fuera** del `ScrollView`, así siempre está visible. Al confirmar, un `ActivityIndicator` simula la latencia del "
     "servidor y luego `navigation.replace` sustituye el detalle por el pase, para que Atrás no regrese a un formulario ya "
     "enviado.",
     """<View style={estilos.mapa}>   {/* flexDirection: 'row', flexWrap: 'wrap', gap: 6 */}
  {Array.from({ length: turno.cuposTotales }, (_, i) => (
    <View key={i} style={[estilos.pc, { backgroundColor: i < turno.cuposOcupados ? c.peligroSuave : c.exitoSuave }]}>
      <Ionicons name="desktop-outline" size={14} color={i < turno.cuposOcupados ? c.peligro : c.exito} />
      <Text style={estilos.numeroPc}>{i + 1}</Text>
    </View>
  ))}
</View>
// pc: { width: 46, height: 40, alignItems: 'center', justifyContent: 'center' }""", "DetalleTurnoScreen.tsx · mapa de puestos"),
    ("I5 · Pase de laboratorio con QR", "fig_i05", "Pase de laboratorio: (a) mockup, (b) pase emitido tras confirmar la matrícula",
     "Es la constancia digital que el estudiante muestra en la puerta del laboratorio. La parte superior, en color primario, "
     "lleva el curso, el grupo, el horario y el sello *Confirmada*; la inferior, el código QR, el código de verificación de "
     "ocho caracteres y los datos del estudiante, el ambiente y la matrícula. El botón **Compartir pase** abre la hoja "
     "nativa de compartir.",
     "La tarjeta del pase es un `View` con `overflow: 'hidden'` dividido en dos zonas. Entre ellas, la perforación se "
     "dibuja con dos círculos del color del fondo en `position: 'absolute'` (`left: -12` y `right: -12`) y una línea "
     "discontinua. El sello usa `position: 'absolute'` con `top` y `right`. El lado del QR se calcula con "
     "`useWindowDimensions` (`Math.min(220, width - 140)`) y los datos se ordenan en dos columnas con `flexWrap` y "
     "`width: '50%'` en cada dato.",
     """<View style={estilos.perforacion}>
  <View style={[estilos.muesca, { left: -12, backgroundColor: c.fondo }]} />
  <View style={[estilos.guiones, { borderColor: c.borde }]} />
  <View style={[estilos.muesca, { right: -12, backgroundColor: c.fondo }]} />
</View>
<QRCode value={payloadQR(m)} size={ladoQR} color="#14202E" backgroundColor="#FFFFFF" />
// muesca: { position: 'absolute', width: 24, height: 24, borderRadius: 12 }""", "FichaQRScreen.tsx · perforación y código QR"),
    ("I6 · Horario semanal consolidado", "fig_i06", "Horario: (a) mockup, (b) vista semanal, (c) vista de lista por día",
     "Consolida en una semana los laboratorios matriculados (bloques rellenos con el color del curso) y las clases de teoría "
     "(bloques con borde discontinuo). El selector *Semana / Lista* cambia a una vista de tarjetas agrupadas por día, más "
     "cómoda para leer en un teléfono pequeño.",
     "La cuadrícula se construye a mano porque React Native no tiene CSS Grid. Una columna de horas y cinco columnas de día se "
     "colocan en fila; el ancho de cada día sale de `useWindowDimensions` con un mínimo de 64 dp. Dentro de cada día, cada "
     "bloque usa `position: 'absolute'` con `top` igual a la hora de inicio y `height` igual a la duración, ambos "
     "convertidos con una constante de 58 dp por hora. Si el ancho mínimo no cabe, la cuadrícula se envuelve en un "
     "`ScrollView` horizontal.",
     """const disponible = width - espacio.l * 2 - CANAL_HORAS;
const anchoDia = Math.max(64, disponible / DIAS_VISIBLES.length);
const desborda = anchoDia * DIAS_VISIBLES.length > disponible + 1;
...
style={{
  top: (e.inicio - INICIO) / 60 * ALTO_HORA + 1,
  height: (e.fin - e.inicio) / 60 * ALTO_HORA - 2,
  borderStyle: lab ? 'solid' : 'dashed',
}}
...
{desborda ? <ScrollView horizontal>{cuadricula}</ScrollView> : cuadricula}""", "HorarioScreen.tsx · cuadrícula con posición absoluta"),
    ("I7 · Panel del docente", "fig_i07", "Panel del docente: (a) mockup, (b) panel con los grupos a cargo",
     "Resume la carga del docente: grupos a cargo, estudiantes inscritos sobre la capacidad, ocupación promedio y "
     "asistencias registradas en el día. Un botón destacado lleva al escáner y debajo se listan los grupos con semáforo, "
     "barra de ocupación y acceso a la **Nómina**.",
     "Toda la pantalla es una sola `FlatList`. El saludo, los KPI y el botón van en `ListHeaderComponent`, de modo que se "
     "desplazan junto con la lista sin anidar una lista dentro de un `ScrollView`, situación que React Native desaconseja "
     "porque anula la virtualización. Las cabeceras de cada tarjeta usan `justifyContent: 'space-between'`.",
     """<FlatList
  data={mios}
  keyExtractor={(t) => t.id}
  ItemSeparatorComponent={() => <View style={{ height: espacio.m }} />}
  ListHeaderComponent={<View>{/* saludo, KPI y botón Escanear */}</View>}
  renderItem={({ item }) => <Tarjeta>{/* curso, semáforo, barra y botón Nómina */}</Tarjeta>}
/>""", "PanelDocenteScreen.tsx · cabecera dentro de la lista"),
    ("I8 · Nómina y asistencia", "fig_i08", "Nómina del grupo: (a) mockup, (b) dos asistencias registradas con su hora",
     "Lista a los estudiantes del grupo ordenados alfabéticamente, con número, nombre y CUI. Tocar una fila registra la "
     "asistencia con la hora; la fila pasa de *Pendiente* a una píldora verde. El resumen superior muestra presentes sobre "
     "el total, una barra de avance y un buscador por nombre o CUI. El pie ofrece **Exportar CSV** y **Escanear**.",
     "Es una `FlatList` cuyo primer elemento, el resumen, queda fijo con `stickyHeaderIndices={[0]}`. Las filas tienen alto "
     "constante (68 dp) para que el desplazamiento sea uniforme. Cada fila es un `Pressable` con "
     "`accessibilityRole=\"checkbox\"` y `accessibilityState` marcado, de modo que el lector de pantalla anuncia si el "
     "estudiante ya está presente. El título de la cabecera se cambia con `navigation.setOptions`.",
     """<FlatList
  data={visibles}
  keyExtractor={(f) => f.id}
  stickyHeaderIndices={[0]}
  ListHeaderComponent={<View style={estilos.resumen}>{/* presentes, barra y buscador */}</View>}
  renderItem={({ item, index }) => (
    <Pressable onPress={() => marcar(item.id)} disabled={Boolean(estado.asistencias[item.id])}
      accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(estado.asistencias[item.id]) }}>
      ...
    </Pressable>
  )}
/>""", "NominaScreen.tsx · resumen fijo y filas marcables"),
    ("I9 · Escáner de asistencia", "fig_i09", "Escáner: (a) mockup, (b) cámara activa en el emulador, (c) pase validado con el código de verificación",
     "Muestra la vista de la cámara con una guía de encuadre y lee el QR del pase. Si la cámara no está disponible, el "
     "docente puede digitar el código de verificación de ocho caracteres. El resultado aparece en una tarjeta verde con el "
     "nombre del estudiante, el curso y la hora, o en una roja si el pase es inválido o pertenece a otro docente.",
     "El visor es un `View` de 340 dp de alto con `overflow: 'hidden'`. La `CameraView` lo cubre con "
     "`StyleSheet.absoluteFill` y encima se coloca otra capa con `absoluteFill` y `pointerEvents=\"none\"`, que dibuja las "
     "cuatro esquinas del marco (cada una un `View` absoluto con dos bordes) y la leyenda. El campo manual normaliza lo "
     "escrito a mayúsculas hexadecimales y limita la longitud a ocho caracteres. Para evitar lecturas repetidas se bloquea "
     "el lector durante 2,5 s después de cada código.",
     """<View style={estilos.visor}>
  <CameraView style={StyleSheet.absoluteFill} facing="back"
    barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={alLeer} />
  <View style={[StyleSheet.absoluteFill, estilos.capa]} pointerEvents="none">
    <View style={estilos.marco}>
      {(['si', 'sd', 'ii', 'id'] as const).map((p) => <View key={p} style={[estilos.esquina, estilos[p]]} />)}
    </View>
    <Text style={estilos.ayuda}>Encuadra el código QR del pase</Text>
  </View>
</View>""", "EscanerScreen.tsx · cámara con capa superpuesta"),
    ("I10 · Gestión de laboratorios", "fig_i10", "Gestión de laboratorios: (a) mockup, (b) lista de ambientes, (c) edición en la hoja modal",
     "La coordinación ve el total de computadoras operativas y una tarjeta por ambiente con ubicación, equipamiento, "
     "capacidad ajustable con botones − y +, barra de puestos reservados, interruptor de habilitación y botón **Editar "
     "datos**, que abre una hoja inferior para cambiar nombre, ubicación y equipamiento.",
     "La lista es una `FlatList` con `numColumns` calculado a partir del ancho: una columna por debajo de 600 dp, dos hasta "
     "960 dp y tres en adelante. `columnWrapperStyle` agrega el espacio entre columnas. La edición usa el `Modal` nativo "
     "con fondo transparente: un `Pressable` semitransparente ocupa la pantalla (tocarlo cierra) y la hoja con esquinas "
     "superiores redondeadas queda abajo.",
     """const { width } = useWindowDimensions();
const columnas = width < 600 ? 1 : width < 960 ? 2 : 3;

<FlatList
  key={columnas}
  data={estado.laboratorios}
  numColumns={columnas}
  columnWrapperStyle={columnas > 1 ? { gap: espacio.m } : undefined}
  ...
/>
<Modal visible={edicion !== null} animationType="slide" transparent onRequestClose={() => setEdicion(null)}>""", "LaboratoriosScreen.tsx · columnas según el ancho y edición modal"),
    ("I11 · Configuración de la matrícula", "fig_i11", "Configuración de la matrícula: (a) mockup, (b) ventana abierta y reglas",
     "Permite fijar la apertura y el cierre de la ventana de matrícula, el máximo de laboratorios por estudiante y dos "
     "reglas: permitir anular matrículas y avisar cuando un grupo se agota. Muestra el estado actual de la ventana y la lista "
     "de grupos agotados con la opción de solicitar un grupo adicional.",
     "Es un formulario en un `ScrollView` con `keyboardShouldPersistTaps=\"handled\"`, para que tocar un botón no solo "
     "cierre el teclado. Cada regla es una fila con `justifyContent: 'space-between'`: texto a la izquierda con `flex: 1` y "
     "`Switch` a la derecha. Antes de guardar se valida el formato `dd/mm/aaaa hh:mm`, que el cierre sea posterior a la "
     "apertura y que el máximo esté entre 1 y 6; el error aparece sobre el botón.",
     """const guardar = () => {
  const i = aISO(inicio);
  const f = aISO(fin);
  const max = Number(maximo);
  if (!i || !f) return setError('Usa el formato dd/mm/aaaa hh:mm en ambas fechas.');
  if (new Date(f) <= new Date(i)) return setError('El cierre debe ser posterior a la apertura.');
  if (!Number.isInteger(max) || max < 1 || max > 6) return setError('El máximo de laboratorios debe estar entre 1 y 6.');
  dispatch({ tipo: 'ACTUALIZAR_CONFIG', config: { inicio: i, fin: f, maxLaboratoriosPorEstudiante: max, ... } });
};""", "ConfiguracionScreen.tsx · validación de la ventana"),
    ("I12 · Perfil y ajustes", "fig_i12", "Perfil y ajustes: (a) mockup, (b) perfil del estudiante",
     "Es común a los tres roles. Muestra los datos del usuario, el selector de tema (*Sistema*, *Claro*, *Oscuro*), dos "
     "interruptores de notificaciones, información del dispositivo y el botón **Cerrar sesión**, que reinicia la pila de "
     "navegación hacia el inicio de sesión.",
     "Las filas de ajustes reutilizan el componente `FilaAjuste` (icono, texto con `flex: 1` y un control a la derecha). La "
     "sección *Dispositivo* evidencia el entorno de ejecución: `Platform.OS` y `Platform.Version` indican el sistema, y "
     "`useWindowDimensions` el tamaño de la ventana en dp y la escala de texto. En el emulador se lee *android · versión 36* "
     "y *411 × 914 dp*. El tema elegido se guarda en el `ThemeContext` y repinta toda la aplicación al instante.",
     """<FilaAjuste icono="hardware-chip-outline" titulo="Plataforma" detalle={`${Platform.OS} · versión ${String(Platform.Version)}`} />
<FilaAjuste icono="resize-outline" titulo="Ventana"
  detalle={`${Math.round(width)} × ${Math.round(height)} dp · escala de texto ${fontScale.toFixed(2)}`} />""", "PerfilScreen.tsx · datos del dispositivo"),
]

for k, (titulo, fig, leyenda, elementos, layout, codigo, cod_titulo) in enumerate(INTERFACES):
    inf.subsub(titulo, nueva_pagina=k > 0)
    F(f"img/figuras/{fig}.png", leyenda, 0.66 if fig in ("fig_i01", "fig_i02", "fig_i03", "fig_i04", "fig_i06", "fig_i09", "fig_i10") else 0.44)
    P("**Elementos.** " + elementos)
    P("**Componentes y layout.** " + layout)
    C(codigo, cod_titulo)

S("4.7 Adaptación a la orientación y a otras plataformas")
P("Para comprobar que el layout responde al tamaño de la ventana se giró el emulador a horizontal. `useWindowDimensions` "
  "entrega entonces unos 915 dp de ancho y la lista de laboratorios pasa de una a dos columnas sin ningún código "
  "específico para la rotación (Figura 20). Para que esto fuera posible se cambió `orientation` a `\"default\"` en "
  "`app.json`, ya que con `\"portrait\"` el sistema bloqueaba el giro.")
F("img/capturas/13_laboratorios_horizontal.png", "Gestión de laboratorios en orientación horizontal: la FlatList pasa a dos columnas", 0.85, "fig:horizontal")
P("El mismo código se exportó a la web con `npx expo export --platform web`. `react-native-web` traduce los componentes "
  "al DOM y la aplicación funciona en el navegador (Figura 21); la versión publicada está en " + f"<{DEMO}>.")
F("img/figuras/fig_web.png", "La misma aplicación ejecutándose en un navegador web: inicio de sesión, panel del estudiante y catálogo", 0.98, "fig:web")

S("4.8 Pruebas automatizadas y verificación")
P("Las reglas de negocio y el reductor se verificaron con **31 pruebas unitarias** en Jest [22], [23]. Se ejecutan con "
  "`npm test` y terminan en alrededor de un segundo porque no necesitan emulador. La Tabla 13 resume qué verifica cada "
  "grupo.")
T("Pruebas unitarias agrupadas por regla verificada",
  ["Grupo", "Pruebas", "Qué se verifica"],
  [["Conversión de horas", "1", "`'07:00'` equivale a 420 minutos y 640 minutos a `'10:40'`."],
   ["RN-02 cruce de horario", "3", "Solape el mismo día; bloques contiguos no se cruzan; días distintos no se cruzan."],
   ["Semáforo", "1", "Rojo sin cupo, ámbar con menos del 30 % libre y verde en otro caso."],
   ["validarMatricula", "8", "Acepta un grupo libre; rechaza cruce con teoría y con otro laboratorio, mismo grupo, mismo curso, grupo agotado, ventana cerrada y límite de laboratorios."],
   ["Reserva atómica (RF-05)", "4", "Suma un cupo sin mutar el arreglo; no reserva sin cupo; nunca supera el aforo con más solicitudes que vacantes; liberar no deja negativos."],
   ["Pase QR", "3", "El contenido generado se verifica; un QR alterado se rechaza; la huella es estable y de 8 caracteres."],
   ["Horario", "1", "Los bloques se ordenan por día y luego por hora."],
   ["Ventana y nómina", "3", "La ventana de demostración está abierta; la nómina tiene tantas filas como cupos; el CSV usa `;`."],
   ["Reductor", "7", "Matricular y anular actualizan cupos; sin sesión no se matricula; cerrar sesión; acciones de administración; código de verificación; la asistencia se marca una sola vez."]],
  [0.24, 0.10, 0.66])
C("""PASS __tests__/reglas.test.ts
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------|---------|----------|---------|---------|-------------------
All files      |    86.3 |    87.83 |   78.57 |   92.85 |
 domain        |   98.88 |    95.55 |     100 |     100 |
  datos.ts     |     100 |      100 |     100 |     100 |
  reglas.ts    |   98.52 |    95.34 |     100 |     100 | 132,140
 state         |   66.07 |    75.86 |      50 |   78.37 |
  AppStore.tsx |   66.07 |    75.86 |      50 |   78.37 | 76-84,95-99
---------------|---------|----------|---------|---------|-------------------
Tests:       31 passed, 31 total
Time:        1.088 s""", "Resultado de npm run test:cobertura", "bash")
P("El dominio alcanza 100 % de líneas cubiertas. En `AppStore.tsx` quedan sin cubrir el proveedor de contexto y algunos "
  "selectores que solo se ejercitan al renderizar pantallas; esas rutas se verificaron en el recorrido manual y "
  "automatizado sobre Android descrito a continuación. Además, `npm run typecheck` (`tsc --noEmit`) termina sin errores "
  "en modo estricto.")

S("4.9 Ejecución en Android y recorrido automatizado de capturas")
P("La aplicación se ejecutó en el emulador con `npx expo start --android`, que inicia el servidor Metro y abre el "
  "proyecto en Expo Go. Para que las capturas del informe fueran reproducibles se escribió el script "
  "`herramientas/capturas-android.mjs`. El script recorre la aplicación por adb: con `uiautomator dump` obtiene el árbol "
  "de la pantalla, localiza los controles por su `accessibilityLabel` y los toca, escribe en los campos y guarda una "
  "captura de cada estado. Como depende de las etiquetas de accesibilidad y no de coordenadas, el mismo recorrido sirve "
  "en otro tamaño de pantalla y funciona además como prueba de humo de la navegación completa: iniciar sesión con cada "
  "rol, matricularse, ver el pase, marcar asistencia, validar el código en el escáner y girar la pantalla.")
C("""async function buscar(etiqueta, { exacto = true, intentos = 20, desplazar = false } = {}) {
  for (let i = 0; i < intentos; i++) {
    const lista = nodos();
    const coincide = (v) => (exacto ? v === etiqueta : v.includes(etiqueta));
    // Primero la etiqueta de accesibilidad (el control) y luego el texto visible (p. ej. un rótulo).
    const n = lista.find((x) => coincide(x.desc)) ?? lista.find((x) => coincide(x.texto));
    if (n && n.y > 0 && n.y < 2380) return n;
    if (desplazar) adb('shell', 'input', 'swipe', '540', '1700', '540', '800', '350');
    await dormir(700);
  }
  throw new Error(`No se encontró «${etiqueta}» en pantalla`);
}""", "herramientas/capturas-android.mjs · búsqueda de controles por accesibilidad", "TSX")

S("4.10 Registro de cambios")
P("La guía pide dejar constancia de las modificaciones realizadas durante el trabajo. La Tabla 13 registra los cambios "
  "que surgieron al probar la aplicación en el emulador; en el documento DOCX cada cambio lleva además un comentario de "
  "revisión.")
T("Cambios realizados durante el desarrollo y su motivo",
  ["N.°", "Archivo", "Cambio", "Motivo"],
  [["1", "LoginScreen.tsx", "Se agregó `<StatusBar style=\"light\" />`.", "La hora y los iconos del sistema quedaban oscuros sobre el fondo azul."],
   ["2", "LaboratoriosScreen.tsx", "Una columna por debajo de 600 dp (antes dos desde 400 dp).", "En el Pixel 7a (411 dp) las tarjetas quedaban comprimidas y el stepper se cortaba."],
   ["3", "app.json", "`orientation` pasó de `\"portrait\"` a `\"default\"`.", "El sistema bloqueaba el giro y no se podía comprobar el layout horizontal."],
   ["4", "EscanerScreen.tsx", "El campo manual solo acepta hexadecimal en mayúsculas y 8 caracteres.", "Evitar rechazos por minúsculas o espacios al dictar el código."],
   ["5", "NominaScreen.tsx", "Se retiró `getItemLayout`.", "La cabecera fija tiene alto variable y desplazaba los índices calculados."],
   ["6", "tsconfig.json", "Se declararon los tipos `jest` y `node`.", "TypeScript 6 no incluye tipos globales por defecto y `tsc` fallaba en las pruebas."],
   ["7", "reglas.test.ts", "Se agregaron 8 pruebas (de 23 a 31).", "Cubrir los motivos YA_MATRICULADO y cruce con laboratorio, y las acciones del reductor."],
   ["8", "app.json", "Se agregó `experiments.baseUrl` para la web.", "Publicar la exportación web en GitHub Pages bajo una subruta."]],
  [0.06, 0.22, 0.35, 0.37], "footnotesize")
N("Cambio 2: la regla de columnas se ajustó después de ver las tarjetas cortadas en el emulador; el umbral de 600 dp "
  "coincide con el límite habitual entre teléfono y tableta pequeña.", "info",
  "Modificación: LaboratoriosScreen.tsx, columnas = width < 600 ? 1 : width < 960 ? 2 : 3 (antes el corte era 400 dp).")
N("Cambio 3: con la orientación libre, la Figura 20 demuestra la adaptación automática de la rejilla.", "info",
  "Modificación: app.json, orientation \"portrait\" → \"default\".")
N("Cambios 6 y 7: el comando `npm run typecheck` y las 31 pruebas se ejecutan sin errores después de estos ajustes.", "ok",
  "Modificación: tsconfig.json (types jest, node) y 8 pruebas nuevas en __tests__/reglas.test.ts.")

S("4.11 Repositorio, ejecución y versión web")
P(f"Todo el código, las capturas y este informe están en el repositorio <{REPO}>. La versión web se publica "
  f"automáticamente con GitHub Actions en <{DEMO}>. La carpeta `informe/` contiene las fuentes LaTeX de este "
  "documento, la versión DOCX, los diagramas en HTML y los scripts que los generan. Para ejecutar el proyecto:")
C(f"""git clone {REPO}.git
cd matrilab-epis-react-native
npm install
npx expo start            # escanear el QR con Expo Go o pulsar «a» para el emulador Android
npm test                  # 31 pruebas unitarias
npm run typecheck         # verificación de tipos
npm run export:web        # versión web en dist/""", "Comandos de instalación y ejecución", "bash")
P("Credenciales de demostración: `olopeza@unsa.edu.pe`, `cmedina@unsa.edu.pe` o `laboratorios.epis@unsa.edu.pe` con la "
  "contraseña `unsa2026`, o los botones *Estudiante*, *Docente* y *Admin* del inicio de sesión.")

# =====================================================================================
inf.seccion("5. Apreciación de la herramienta")
P("La valoración se basa en lo que el equipo observó al construir y probar MatriLab con React Native y Expo, no en "
  "afirmaciones generales sobre el framework.")

S("5.1 Características favorables")
inf.subsub("A. Interfaces nativas reales a partir de un solo código")
P("Cada componente del núcleo se convierte en una vista nativa del sistema [2]. En la práctica, el `Switch` de la "
  "configuración es el interruptor de Android, el teclado y la hoja de compartir son los del teléfono, el `Alert` es el "
  "diálogo del sistema y `native-stack` usa las transiciones y el gesto de retroceso nativos. Con ese mismo código, sin "
  "una sola línea específica, la aplicación se exportó a la web (Figura 21). Las diferencias por plataforma que sí hubo "
  "que escribir fueron mínimas y explícitas: el `behavior` de `KeyboardAvoidingView` y el `android_ripple` de "
  "`Pressable`. Para un proyecto universitario que debe llegar a estudiantes con Android y con iPhone, esto reduce a la "
  "mitad el trabajo frente al desarrollo nativo separado.")
inf.subsub("B. Ciclo de desarrollo rápido y ecosistema JavaScript")
P("Con Expo Go no fue necesario compilar proyectos de Android Studio: el emulador cargaba el paquete desde Metro y "
  "*Fast Refresh* aplicaba cada cambio de estilo en uno o dos segundos conservando el estado de la pantalla, lo que "
  "permitió ajustar márgenes, columnas y colores viendo el resultado al instante. El ecosistema de JavaScript aportó "
  "piezas maduras: TypeScript detectó errores de navegación entre pantallas antes de ejecutarlas, `react-native-qrcode-svg` "
  "resolvió el QR en una línea y Jest probó las reglas de negocio en un segundo. El mismo lenguaje sirvió para la "
  "aplicación, las pruebas y el script de capturas.")

S("5.2 Características desfavorables")
inf.subsub("A. Dependencia de la compatibilidad entre versiones")
P("Una aplicación React Native depende de una cadena de versiones que deben coincidir: Expo SDK, React Native, React, "
  "cada librería con código nativo (`react-native-screens`, `react-native-svg`, `expo-camera`) y la versión de Expo Go "
  "instalada en el teléfono, que solo abre proyectos de su mismo SDK. Fue obligatorio instalar las dependencias con "
  "`npx expo install` para no romper esa cadena. El ritmo de cambios también se notó: el `SafeAreaView` del núcleo figura "
  "como obsoleto [16], la Nueva Arquitectura cambió el comportamiento interno de varias librerías y TypeScript 6 dejó de "
  "incluir tipos globales por defecto, lo que obligó a corregir `tsconfig.json` (cambio 6). En un proyecto que dure varios "
  "semestres, actualizar dependencias requiere tiempo dedicado.")
inf.subsub("B. Layout limitado a Flexbox y diferencias entre plataformas")
P("React Native solo ofrece Flexbox y posición absoluta: no hay CSS Grid ni *media queries*. La cuadrícula del horario "
  "tuvo que calcularse a mano con `useWindowDimensions` y `position: 'absolute'`, y la rejilla adaptable de laboratorios "
  "obligó a volver a montar la `FlatList` con `key` porque `numColumns` no puede cambiar en caliente. Algunos componentes "
  "se comportan distinto en cada sistema (`KeyboardAvoidingView`, sombras, ripple) y hay que probar en ambos. Además, la "
  "depuración de lo que ocurre del lado nativo exige conocer las herramientas de Android: los permisos de cámara de Expo "
  "Go, el teclado del emulador y la rotación tuvieron que resolverse con adb.")

S("5.3 Valoración general")
T("Resumen de la apreciación de React Native con Expo",
  ["Aspecto", "Valoración", "Evidencia en el laboratorio"],
  [["Componentes propios de la plataforma", "Favorable", "Switch, Alert, Share, teclado y pila de navegación nativos en Android."],
   ["Productividad", "Favorable", "Fast Refresh, Expo Go, TypeScript y pruebas del dominio en 1 s."],
   ["Mantenimiento de versiones", "Desfavorable", "Cadena SDK–RN–librerías–Expo Go; APIs obsoletas; ajuste de tsconfig."],
   ["Sistema de layout", "Desfavorable", "Sin Grid ni media queries; horario y rejilla calculados a mano."]],
  [0.28, 0.16, 0.56])

# =====================================================================================
inf.seccion("6. Conclusiones")
L(["Se desarrolló MatriLab EPIS con React Native 0.88 y Expo SDK 58: doce interfaces para tres roles que se ejecutan "
   "como aplicación nativa en Android y como aplicación web con el mismo código, usando solo componentes del núcleo del "
   "framework para la organización de la interfaz.",
   "El árbol de problemas y el árbol de objetivos permitieron justificar cada pantalla: los cinco medios fundamentales se "
   "tradujeron en trece funcionalidades y estas en las doce interfaces, con trazabilidad explícita (Tabla 4).",
   "La investigación de componentes mostró que el layout en React Native descansa en Flexbox con valores por defecto "
   "distintos a los de la web, en listas virtualizadas para colecciones grandes y en `position: 'absolute'` y "
   "`useWindowDimensions` para superposiciones y adaptación. La rejilla de laboratorios pasó de una a dos columnas al girar "
   "la pantalla sin código adicional.",
   "Separar el dominio en funciones puras permitió verificar las reglas de negocio con 31 pruebas que cubren el 100 % de "
   "las líneas del dominio, y el recorrido automatizado por accesibilidad sirvió como prueba de humo de la navegación "
   "completa en Android.",
   "Frente a FlutterFlow (LAB 02), React Native exige escribir más código, pero da control total sobre el layout y el "
   "estado y produce interfaces que usan los controles nativos de cada sistema; el costo principal es mantener la "
   "compatibilidad de versiones del ecosistema."])

# =====================================================================================
inf.seccion("7. Anexos: código de la aplicación")
P("Se incluye el código fuente completo de la aplicación tal como está en el repositorio. Cada archivo de pantalla "
  "comienza con un comentario que explica su layout.")
ANEXOS = [
    ("App.tsx", "A.1 Punto de entrada y proveedores"),
    ("app.json", "A.2 Configuración de Expo"),
    ("package.json", "A.3 Dependencias y scripts"),
    ("src/domain/types.ts", "A.4 Modelo de dominio"),
    ("src/domain/reglas.ts", "A.5 Reglas de negocio"),
    ("src/domain/datos.ts", "A.6 Datos de demostración 2026-B"),
    ("src/state/AppStore.tsx", "A.7 Estado global"),
    ("src/theme/tokens.ts", "A.8 Tokens de diseño"),
    ("src/theme/ThemeContext.tsx", "A.9 Contexto de tema"),
    ("src/components/ui.tsx", "A.10 Componentes reutilizables"),
    ("src/navigation/tipos.ts", "A.11 Tipos de navegación"),
    ("src/navigation/RootNavigator.tsx", "A.12 Navegación"),
    ("src/screens/LoginScreen.tsx", "A.13 I1 · Inicio de sesión"),
    ("src/screens/estudiante/DashboardScreen.tsx", "A.14 I2 · Panel del estudiante"),
    ("src/screens/estudiante/CatalogoScreen.tsx", "A.15 I3 · Catálogo"),
    ("src/screens/estudiante/DetalleTurnoScreen.tsx", "A.16 I4 · Detalle del grupo"),
    ("src/screens/estudiante/FichaQRScreen.tsx", "A.17 I5 · Pase QR"),
    ("src/screens/estudiante/HorarioScreen.tsx", "A.18 I6 · Horario"),
    ("src/screens/docente/PanelDocenteScreen.tsx", "A.19 I7 · Panel docente"),
    ("src/screens/docente/NominaScreen.tsx", "A.20 I8 · Nómina"),
    ("src/screens/docente/EscanerScreen.tsx", "A.21 I9 · Escáner"),
    ("src/screens/admin/LaboratoriosScreen.tsx", "A.22 I10 · Laboratorios"),
    ("src/screens/admin/ConfiguracionScreen.tsx", "A.23 I11 · Configuración de matrícula"),
    ("src/screens/PerfilScreen.tsx", "A.24 I12 · Perfil"),
    ("__tests__/reglas.test.ts", "A.25 Pruebas unitarias"),
    ("herramientas/capturas-android.mjs", "A.26 Recorrido automatizado de capturas"),
]
for ruta, titulo in ANEXOS:
    inf.archivo(ruta, titulo)

# =====================================================================================
inf.seccion("8. Referencias")
REFERENCIAS = [
    "Meta Platforms, Inc., *Layout with Flexbox*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/flexbox>",
    "Meta Platforms, Inc., *Core Components and Native Components*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/intro-react-native-components>",
    "Meta Platforms, Inc., *ScrollView*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/scrollview>",
    "Meta Platforms, Inc., *FlatList*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/flatlist>",
    "Meta Platforms, Inc., *SectionList*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/sectionlist>",
    "Meta Platforms, Inc., *StyleSheet*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/stylesheet>",
    "Meta Platforms, Inc., *Pressable*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/pressable>",
    "Meta Platforms, Inc., *KeyboardAvoidingView*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/keyboardavoidingview>",
    "Meta Platforms, Inc., *Modal*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/modal>",
    "Meta Platforms, Inc., *useWindowDimensions*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/usewindowdimensions>",
    "Meta Platforms, Inc., *Platform*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/platform>",
    "Meta Platforms, Inc., *Height and Width*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/height-and-width>",
    "Meta Platforms, Inc., *About the New Architecture*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/architecture/landing-page>",
    "Expo, *Introduction to Expo*, Expo Documentation, 2026. [En línea]. Disponible en: <https://docs.expo.dev/get-started/introduction/>",
    "Meta Platforms, Inc., *Yoga: A portable layout engine*, 2026. [En línea]. Disponible en: <https://www.yogalayout.dev/>",
    "Meta Platforms, Inc., *SafeAreaView (deprecated)*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/safeareaview>",
    "E. Ortegón, J. F. Pacheco y A. Prieto, *Metodología del marco lógico para la planificación, el seguimiento y la evaluación de proyectos y programas*, Serie Manuales n.° 42. Santiago de Chile: CEPAL, 2005.",
    "Meta Platforms, Inc., *Optimizing FlatList Configuration*, React Native Documentation, 2026. [En línea]. Disponible en: <https://reactnative.dev/docs/optimizing-flatlist-configuration>",
    "Expo, *Camera (expo-camera)*, Expo SDK Reference, 2026. [En línea]. Disponible en: <https://docs.expo.dev/versions/latest/sdk/camera/>",
    "React Navigation, *Native Stack Navigator*, React Navigation 7 Documentation, 2026. [En línea]. Disponible en: <https://reactnavigation.org/docs/native-stack-navigator>",
    "React Navigation, *Bottom Tabs Navigator*, React Navigation 7 Documentation, 2026. [En línea]. Disponible en: <https://reactnavigation.org/docs/bottom-tab-navigator>",
    "Expo, *Unit testing with Jest*, Expo Documentation, 2026. [En línea]. Disponible en: <https://docs.expo.dev/develop/unit-testing/>",
    "OpenJS Foundation, *Getting Started*, Jest Documentation, 2026. [En línea]. Disponible en: <https://jestjs.io/docs/getting-started>",
    "T. Atkins Jr., E. J. Etemad, R. Atanassov y O. Oyekunle (eds.), *CSS Flexible Box Layout Module Level 1*, W3C Candidate Recommendation, 2018. [En línea]. Disponible en: <https://www.w3.org/TR/css-flexbox-1/>",
    "International Organization for Standardization, *Ergonomics of human-system interaction — Part 210: Human-centred design for interactive systems*, ISO 9241-210:2019, 2019.",
    "B. Eisenman, *Learning React Native: Building Native Mobile Apps with JavaScript*, 2.ª ed. Sebastopol, CA, EE. UU.: O'Reilly Media, 2017.",
]
inf.referencias(REFERENCIAS)
