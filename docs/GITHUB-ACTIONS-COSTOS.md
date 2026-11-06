# GitHub Actions: control de ejecuciones y costos de Pesse

Actualizado el 6 de noviembre de 2026. Esta guía se aplica a los flujos de `.github/workflows/`.

## Cambios de CI

- **Una sola compilación de Next.js por PR:** el flujo `Validate public news search` ejecuta `npm install`, `npm run check` y `npm run build` cuando cambia `src/**`, `package.json` o `next.config.mjs`.
- **Editor sin compilación duplicada:** `Validate editorial editor` se limita a verificaciones estáticas con Node.js incorporado, sin instalar dependencias. La compilación compartida sigue validando el editor cuando cambia su código.
- **Cancelar revisiones obsoletas:** `concurrency.group` utiliza el nombre del flujo y el número de PR, y `cancel-in-progress` se activa solo para `pull_request`. Un nuevo commit en el mismo PR cancela el trabajo anterior de ese mismo flujo, pero **no** el de otros PR ni las ejecuciones manuales.
- **Limitar tiempo de ejecución:** compilación principal 15 minutos; controles del editor 3 minutos; scripts de respaldo y encabezados HTTP 4 minutos.
- **Evitar doble validación PR + merge:** las comprobaciones de respaldos y cabeceras se disparan en PR o manualmente, pero no repiten el mismo trabajo por cada push a `main`. Para mantener la cobertura, **evitar cambios directos en `main` y exigir revisión antes de fusionar**.
- **Ejecutar manualmente:** Actions → elegir flujo → Run workflow, cuando se requiera una comprobación extraordinaria.

El flujo `Validate editorial publication permissions` del PR #113 es independiente y todavía debe consolidarse para evitar repetir TypeScript una vez que se integre.

## Proceso recomendado para el desarrollo

1. Crear una rama de trabajo a partir de `main`.
2. Agrupar los cambios relacionados antes de abrir el PR, evitando un PR por cada corrección pequeña.
3. Revisar archivos modificados y hacer comprobaciones locales antes de publicar la rama, si es posible.
4. Abrir **un PR por objetivo**. Dejar que GitHub ejecute los controles de ese PR.
5. Si un control falla, leer primero el registro del error y agrupar las correcciones; no reintentar sin cambiar nada.
6. Integrar tras las comprobaciones. Evitar despliegues manuales redundantes a Vercel; puede generar builds de previews automáticamente según su integración Git.

Los filtros `paths` pueden hacer que un estado requerido quede en Pending cuando no se ejecuta. Revisar reglas de protección de rama antes de declarar alguna validación como obligatoria o eliminar un flujo antiguo.

## Presupuestos y alertas (requiere configuración desde la cuenta de GitHub)

Esta integración **no dispone de una acción para crear presupuestos de facturación**. Para fijar un límite real de gastos:

1. Abrir https://github.com/settings/billing → **Budgets and alerts**.
2. Crear un presupuesto para **Actions**; seleccionar alcance de cuenta o repositorio Pesse si la interfaz ofrece esa opción.
3. Si no se quiere pagar consumo adicional, establecer presupuesto de **US$ 0** *cuando el sistema lo permita* y activar **Stop usage when budget limit is reached**. Comprobar el texto mostrado antes de confirmar, ya que un bloqueo puede detener pruebas automatizadas.
4. Activar las alertas de consumo incluido al 90 % y 100 %, y, cuando corresponda, avisos de presupuesto al 75 %, 90 % y 100 %.
5. Revisar el desglose en **Billing → Usage** cada semana mientras el equipo siga desarrollando.

Referencias:
- https://docs.github.com/en/billing/how-tos/set-up-budgets
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency
- https://docs.github.com/en/billing/concepts/product-billing/github-actions

## Privacidad: hallazgo del repositorio

En la consulta de GitHub del 6/11/2026, el repositorio `leonardoventosa1-hash/Pesse` devolvió **visibility: public**. Los runners estándar de GitHub Actions son gratuitos para repositorios públicos, pero **el código también es visible para terceros**. Un repositorio privado cambia las condiciones de cuotas y visibilidad. Para modificarlo es necesaria una decisión de la persona propietaria desde GitHub → Settings → General → Danger Zone → Change repository visibility.

Independientemente de la visibilidad, **nunca subir contraseñas, datos personales, tokens de Supabase, claves de servicio, backups descifrados ni datos de prueba reales**. Una vez expuesto un secreto, hay que revocarlo; cambiar el repositorio a privado no borra copias anteriores.

## Verificación pendiente

- [ ] Confirmar ejecución satisfactoria del PR de optimización.
- [ ] Confirmar cancelación real de una ejecución anterior al actualizar un PR (la configuración está implementada, pero debe observarse un caso).
- [ ] Comprobar que no haya reglas de rama que exijan checks filtrados y queden indefinidamente pendientes.
- [ ] Configurar el presupuesto directamente desde Billing; no declararlo aplicado sin constancia.
