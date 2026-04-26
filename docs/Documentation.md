# Documentación Técnica: Tasks Seamless Coop

## 1. Arquitectura y Stack
* **Frontend:** React, TypeScript, React Router.
* **Red:** Node.js (P2P local).
* **Estado:** `DataService` (Singleton, Pub/Sub reactivo).
* **Persistencia:** LocalStorage (`tsc-state-v1`).

## 2. Dominio
* **User:** Autenticación local y grafos de amistad (`friendRequests`).
* **Group (Gremio):** Relación bidireccional estricta (`Group.Users` ↔ `User.Groups`).
* **Actividades:**
  * `Task`: Tarea base (prioridad, fecha límite).
  * `Event`: Optimizado para hitos temporales.
  * `Challenge`: Añade condiciones de victoria/derrota y métricas de progreso.

## 3. Motor P2P (`DataService`)
Sistema sin base de datos centralizada; opera mediante intercambio de estados en memoria.
* **Serialización:** `exportSnapshot()` aplana el estado a JSON.
* **Hidratación:** `replaceStateFromSnapshot()` reconstruye clases y referencias de memoria manteniendo la sesión local (`currentUser`).
* **Resolución de Conflictos:** `syncNextId` alinea contadores estáticos para evitar colisiones de IDs en nuevos registros.
* **Ciclo de vida:** Toda mutación invoca `emit()`, forzando el volcado a LocalStorage y el re-renderizado de React.

## 4. Comandos de Entorno
```bash
# Instalación
npm install

# Iniciar nodo P2P (Backend)
P2P_HOST=0.0.0.0 P2P_PORT=4312 npm run dev:p2p

# Iniciar cliente web
npm run dev
```

## 5. Troubleshooting
* **Error:** `ENOENT: syscall: uv_cwd` en terminal Node.
* **Causa:** El SO invalidó el CWD actual de la terminal.
* **Solución:** Restablecer el path de la shell:
  ```bash
  cd $(pwd)
  # O navegando de nuevo a la ruta del proyecto
  cd ~/ruta/Tasks_Seamless_Coop
  ```
