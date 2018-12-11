# Exercise Tracker REST API

#### Proyecto de microservicios creado como parte del Módulo de APIs de Free Code Camp

### Casos de uso

1. Puedo crear usuarios con un POST en /api/exercise/new-user and returned devuelvo un objeto con nombre de usuario y _id.
2. Puedo GET un array de todos los usuarios en api/exercise/users con nombres de usuario e _id.
3. Puedo añadir un ejercicio para cada usuario haciendo un POST con: userId(_id), descripcion, duracion, y opcionalmente fecha a /api/exercise/add. Si no se introduce fecha, se utilizará la fecha actual. Se devuelve un objeto con toda la información.
4. Puedo GET un log completo de ejercio de mi usuario en getting /api/exercise/log pasando como parametro el userId(_id). Se devuelve un objeto con log (array) y total de ejercicios realizados.
5. Puedo GET parte del log pasando también como valor opcional fecha y limite (formato de fecha yyyy-mm-dd, limit = número entero).
