# CitaFácil 📅
### Plataforma SaaS Multiempresa para la Gestión Inteligente de Citas y Reservas

**CitaFácil** es una aplicación web SaaS completa diseñada específicamente para pequeños negocios y profesionales independientes (barberías, salones de belleza, estéticas, spas, consultorios médicos, talleres de servicio técnico, academias y más). Resuelve el desorden de agendar mediante WhatsApp y llamadas telefónicas, centralizando el proceso en una página de reservas pública que previene de forma atómica los cruces de horarios y dobles reservas.

---

## 🚀 Características Principales

### 1. Portal Público de Reservas en 5 Pasos (`/reservar/[slug]`)
- **Paso 1. Selección de Servicio:** Catálogo activo con duración en minutos, buffer previo/posterior y precio referencial en Soles (PEN).
- **Paso 2. Elección de Profesional:** Asignación específica a un especialista o selección automática ("Cualquiera disponible") para maximizar la disponibilidad.
- **Paso 3. Calendario y Horarios en Vivo:** Selector dinámico de días y grilla de slots disponibles calculados en tiempo real según horarios comerciales, descansos y antelación mínima.
- **Paso 4. Formulario de Contacto:** Registro ágil del cliente (Nombre, Teléfono/WhatsApp, Correo opcional y Notas) con validaciones instantáneas.
- **Paso 5. Confirmación Inmediata:** Generación de identificador único de reserva, resumen detallado, botón directo "Agregar a Google Calendar" y enlace seguro de gestión/cancelación.
- **Cancelación Segura por Token (`/reservar/[slug]/cancelar/[token]`):** Los clientes pueden auto-cancelar su cita respetando la política de horas de aviso del negocio, liberando el slot al instante.

### 2. Panel Administrativo Profesional (`/dashboard`)
- **Resumen y Métricas (KPIs):** Citas de hoy, próximas reservas activas, citas confirmadas, pendientes, canceladas, ingresos estimados y servicios más solicitados.
- **Calendario Interactivo (`/dashboard/calendario`):** Visualización por día, semana y mes con filtro por profesional y tarjetas claras de cada cita.
- **Gestión de Citas (`/dashboard/citas`):** Filtros por estado (`confirmed`, `pending`, `completed`, `cancelled`, `no_show`), fecha y búsqueda por cliente; detalle de cita, actualización de estado y modal de reprogramación con verificación de disponibilidad.
- **Directorio de Clientes (`/dashboard/clientes`):** Clientes registrados automáticamente por empresa, historial de visitas y notas internas.
- **Catálogo de Servicios (`/dashboard/servicios`):** CRUD completo (Crear, Editar, Activar/Pausar, Eliminar) con duraciones, buffers de preparación/limpieza y precios.
- **Equipo y Profesionales (`/dashboard/equipo`):** Especialistas asignables con servicios vinculados.
- **Horarios Comerciales (`/dashboard/horarios`):** Configuración por día de la semana con turnos de inicio y fin.
- **Configuración del Negocio (`/dashboard/configuracion`):** Nombre, slug público, zona horaria IANA (`America/Lima`), antelación mínima (horas), días máximos a futuro y política de cancelación.

### 3. Motor de Disponibilidad y Prevención de Dobles Reservas
- Cálculo determinista de disponibilidad considerando:
  1. Horarios de atención regulares por día.
  2. Duración del servicio + buffers previo y posterior.
  3. Citas activas confirmadas o pendientes (ignora citas canceladas).
  4. Disponibilidad del profesional específico o capacidad general.
  5. Antelación mínima requerida (`min_booking_notice_hours`).
  6. Límite de días por adelantado (`max_booking_advance_days`).
  7. Zona horaria del negocio (`America/Lima`).
- **Garantía Anti-Colisión:** En PostgreSQL se utiliza el procedimiento almacenado atómico `create_appointment_atomic` con restricción de exclusión `btree_gist` (`EXCLUDE USING gist`), asegurando que bajo peticiones concurrentes idénticas solo una sea confirmada.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js (App Router), React 19, TypeScript estricto.
- **Estilos:** Tailwind CSS con tokens visuales limpios en azul índigo y grises neutros.
- **Iconografía:** Lucide React.
- **Validaciones:** Zod y React Hook Form con esquemas compartidos cliente/servidor.
- **Base de Datos & Auth:** Supabase PostgreSQL con Row Level Security (RLS) multiempresa, triggers de auditoría y RPCs atómicos.
- **Testing:** Vitest para pruebas unitarias de cálculo de slots, validaciones y simulación de concurrencia.
- **Despliegue:** Preparado para Vercel (Frontend/Edge) y Supabase (Database/Auth).

---

## 📁 Estructura del Proyecto

```text
├── src/
│   ├── app/
│   │   ├── (auth)/               # Pantallas de login, registro y onboarding
│   │   ├── api/                  # Route handlers para disponibilidad, reservas y administración
│   │   │   ├── admin/            # Endpoints de citas, servicios, equipo, horarios y configuración
│   │   │   ├── availability/     # Consulta de slots en tiempo real
│   │   │   ├── bookings/         # Creación atómica de reservas públicas
│   │   │   ├── business-public/  # Catálogo público del negocio por slug
│   │   │   └── cancel/           # Cancelación por token criptográfico
│   │   ├── dashboard/            # Panel administrativo (KPIs, calendario, citas, catálogo)
│   │   ├── reservar/[slug]/      # Portal público de reservas en 5 pasos
│   │   ├── globals.css           # Tokens de diseño y estilos globales
│   │   └── layout.tsx            # Root layout con tipografía Geist y metadatos
│   ├── features/
│   │   ├── notifications/        # Servicio y plantillas de correo electrónico
│   │   └── scheduling/           # Motor algorítmico de cálculo de slots y disponibilidad
│   ├── lib/
│   │   ├── supabase/             # Clientes SSR, repositorio unificado y motor atómico
│   │   ├── utils/                # Utilidades de fechas (América/Lima), formatos y clases
│   │   └── validations/          # Esquemas Zod para formularios y endpoints
│   └── types/                    # Tipos de dominio, contratos y modelos de base de datos
├── supabase/
│   └── migrations/               # Migración inicial PostgreSQL con RLS y RPCs
├── tests/                        # Pruebas automatizadas con Vitest
│   ├── availability.test.ts      # Cálculo de slots, buffers y horarios
│   ├── concurrency.test.ts       # Simulación de 10 peticiones concurrentes simultáneas
│   └── validations.test.ts       # Validación de slugs, formularios y citas
├── .env.example                  # Plantilla de variables de entorno
└── vitest.config.ts              # Configuración del ejecutor de pruebas
```

---

## ⚙️ Instalación y Ejecución Local

### 1. Clonar e Instalar Dependencias
```bash
git clone <url-del-repositorio>
cd "Book Appointments"
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` como `.env.local`:
```bash
cp .env.example .env.local
```
*(Nota: El proyecto incluye un adaptador de datos persistente y atómico local para desarrollo y pruebas inmediatas, por lo que puedes ejecutar y probar la aplicación completa incluso antes de vincular tu proyecto de Supabase).*

### 3. Ejecutar Pruebas Automatizadas
```bash
npm test
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador:
- **Página de inicio:** [http://localhost:3000](http://localhost:3000)
- **Portal de Reservas del Negocio Demo:** [http://localhost:3000/reservar/don-luigi](http://localhost:3000/reservar/don-luigi)
- **Panel Administrativo:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🔒 Configuración de Supabase y Migraciones

Cuando desees conectar tu base de datos de producción en Supabase:

1. Crea un nuevo proyecto en [Supabase](https://supabase.com).
2. Ve al **SQL Editor** de tu panel de Supabase.
3. Copia y ejecuta el contenido completo del archivo:
   `supabase/migrations/20261010000001_initial_citafacil_schema.sql`
4. Este script configurará automáticamente:
   - Las extensiones `uuid-ossp` y `btree_gist`.
   - Las tablas con claves foráneas e índices optimizados.
   - Triggers de auditoría para `updated_at` y creación de perfiles de usuario.
   - Políticas completas de **Row Level Security (RLS)** que aíslan los datos entre negocios.
   - El procedimiento almacenado `create_appointment_atomic` con restricción de exclusión GiST.
5. Copia tu `Project URL` y `anon public key` en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

---

## 🧪 Pruebas Automatizadas Ejecutadas

El proyecto cuenta con suites de prueba automatizadas con Vitest:
- **`tests/availability.test.ts` (5 pruebas):**
  - Generación de slots dentro del horario de atención.
  - Bloqueo de slots ocupados por citas confirmadas.
  - Liberación de horarios para citas canceladas.
  - Cumplimiento estricto de la antelación mínima (`min_booking_notice_hours`).
  - Descarte de turnos en días no laborales.
- **`tests/concurrency.test.ts` (1 prueba crítica):**
  - Simula 10 peticiones concurrentes simultáneas al mismo horario y profesional.
  - Verifica que exactamente UNA cita sea confirmada y las otras 9 sean rechazadas limpiamente por conflicto.
- **`tests/validations.test.ts` (3 pruebas):**
  - Validación de formato de slugs comerciales (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
  - Validación de datos requeridos de clientes y fechas ISO.
  - Validación de duraciones y buffers no negativos.

---

## 📋 Estado del Producto y Roadmap

| Módulo / Funcionalidad | Estado | Descripción |
|---|---|---|
| **Portal Público de Reservas** | ✅ Implementado | Flujo guiado en 5 pasos, selector de servicios, staff, horarios en tiempo real y confirmación. |
| **Prevención Anti-Doble Reserva** | ✅ Implementado | Validación transaccional atómica con exclusión GiST y RPC. |
| **Auto-Cancelación por Token** | ✅ Implementado | Cancelación segura sin exponer IDs secuenciales con política de aviso. |
| **Panel Administrativo** | ✅ Implementado | Dashboard con KPIs reales, calendario interactivo, citas, catálogo y configuración. |
| **Aislamiento Multiempresa** | ✅ Implementado | Esquema relacional con `business_id` en todas las entidades y políticas RLS. |
| **Plantillas de Notificación** | ✅ Implementado | Arquitectura de correos con plantillas HTML responsivas y trazabilidad. |
| **Suite de Pruebas Automatizadas** | ✅ Implementado | 9 pruebas unitarias y de concurrencia ejecutadas con éxito. |
| **Integración Pasarela de Pagos** | ⏳ Próxima fase | Cobro anticipado opcional (Mercado Pago / Stripe / Yape). |
| **WhatsApp Automatizado** | ⏳ Próxima fase | Notificaciones automáticas por API oficial de WhatsApp Cloud. |

---

## 📄 Licencia y Créditos
Desarrollado para el mercado de profesionales y negocios de Perú bajo arquitectura moderna SaaS multiempresa.
