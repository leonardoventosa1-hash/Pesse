# Historias de Instagram desde redacción

En una nota publicada, elegir **Crear historia de Instagram**. La pantalla permite cambiar el título de la placa sin editar la noticia, ajustar el encuadre vertical de la portada o elegir una placa sin fotografía. Descarga PNG de 1080 × 1920 y permite copiar el enlace público para el sticker de Instagram.

No publica en redes, no conecta cuentas ni guarda archivos o cambios de contenido en Supabase. El acceso requiere rol editorial y la lectura mantiene las políticas RLS de la noticia. Los borradores y las notas en papelera no se pueden utilizar.

La portada debe permitir lectura CORS para exportarse desde canvas. Si falla su carga o descarga, se informa el problema y se puede elegir una placa sin fotografía. La vista previa se adapta a pantallas pequeñas. Los títulos se ajustan al ancho disponible sin desbordar y la descarga se bloquea si no caben.

Validación: build completo; generación PNG y revisión de la imagen de prueba; casos sin foto, títulos largos y palabras sin espacios. La subida a Instagram y el sticker de enlace son manuales.
