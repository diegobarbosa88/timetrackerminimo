# Guía de pruebas para TimeTracker

Este documento proporciona instrucciones para probar la aplicación TimeTracker antes de desplegarla en producción.

## 1. Pruebas locales

Antes de desplegar la aplicación, es recomendable probarla localmente para verificar que todas las funcionalidades estén trabajando correctamente.

### Configuración inicial

1. Asegúrate de tener todas las dependencias instaladas:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

3. Abre tu navegador en `http://localhost:3000`

### Pruebas de navegación

Verifica que puedas navegar correctamente entre las diferentes secciones de la aplicación:

- [ ] Página principal
- [ ] Sección de gestión de empleados
- [ ] Página de añadir empleado
- [ ] Página de editar empleado
- [ ] Página de ver detalles de empleado
- [ ] Sección de informes

### Pruebas de funcionalidad

#### Gestión de empleados

- [ ] Visualización de la lista de empleados
- [ ] Filtrado de empleados por departamento
- [ ] Filtrado de empleados por estado
- [ ] Búsqueda de empleados por nombre/email
- [ ] Navegación entre páginas de la lista
- [ ] Exportación de la lista de empleados

#### Añadir empleado

- [ ] Formulario muestra todos los campos requeridos
- [ ] Validación de campos obligatorios
- [ ] Mensaje de confirmación al guardar
- [ ] Redirección a la lista después de guardar

#### Editar empleado

- [ ] Carga correcta de datos del empleado según ID
- [ ] Formulario muestra todos los campos con valores actuales
- [ ] Validación de campos obligatorios
- [ ] Mensaje de confirmación al guardar cambios
- [ ] Funcionalidad de eliminar empleado con confirmación

#### Ver empleado

- [ ] Carga correcta de datos del empleado según ID
- [ ] Visualización de información de contacto
- [ ] Visualización de información laboral
- [ ] Visualización de estadísticas
- [ ] Visualización de historial de registros

#### Informes

- [ ] Filtrado por período (día, semana, mes, personalizado)
- [ ] Selección de fechas personalizadas
- [ ] Selección de días específicos
- [ ] Filtrado por cliente
- [ ] Visualización del resumen con estadísticas
- [ ] Visualización de la lista de registros
- [ ] Generación y descarga de informes en PDF
- [ ] Exportación de datos en CSV

## 2. Pruebas de despliegue

Una vez que las pruebas locales sean exitosas, puedes proceder con el despliegue en Netlify:

1. Sube los cambios a tu repositorio GitHub
2. Verifica que Netlify inicie automáticamente el proceso de despliegue
3. Revisa los logs de construcción para detectar posibles errores
4. Una vez completado el despliegue, verifica la URL proporcionada por Netlify

### Pruebas post-despliegue

Repite todas las pruebas de navegación y funcionalidad en el entorno de producción para asegurarte de que todo funciona correctamente en el entorno desplegado.

## 3. Pruebas de compatibilidad

Verifica que la aplicación funcione correctamente en diferentes navegadores y dispositivos:

### Navegadores

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Dispositivos

- [ ] Desktop
- [ ] Tablet
- [ ] Móvil

## 4. Solución de problemas comunes

Si encuentras problemas durante las pruebas, aquí hay algunas soluciones a problemas comunes:

### Problema: Página en blanco después del despliegue

Posibles soluciones:
- Verifica que todos los archivos estén en las ubicaciones correctas
- Asegúrate de que el archivo layout.tsx esté presente en src/app
- Revisa los logs de construcción en Netlify para identificar errores específicos

### Problema: Errores de JavaScript en consola

Posibles soluciones:
- Verifica que todos los componentes interactivos tengan la directiva 'use client'
- Asegúrate de que las importaciones de módulos sean correctas
- Comprueba que las dependencias estén correctamente instaladas

### Problema: Estilos no se aplican correctamente

Posibles soluciones:
- Verifica que el archivo globals.css esté importado en el layout.tsx
- Asegúrate de que las clases de Tailwind estén correctamente definidas
- Comprueba que no haya conflictos entre estilos
