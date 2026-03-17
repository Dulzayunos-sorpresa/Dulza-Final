# GUÍA DEFINITIVA DE PUBLICACIÓN: VERCEL + FIREBASE + NAMECHEAP

Esta guía está diseñada paso a paso para que puedas publicar tu web desde cero. 
He dividido el proceso en 4 fases. Tómate tu tiempo con cada una.

---

## FASE 1: Configurar Firebase (Base de Datos y Usuarios)

Firebase será el "cerebro" de tu app. Guardará los pedidos, productos y controlará quién entra al panel de administrador.

1. Ve a [console.firebase.google.com](https://console.firebase.google.com/) e inicia sesión con tu cuenta de Google.
2. Haz clic en **"Crear un proyecto"**. Ponle el nombre de tu negocio (ej. "Dulzayunos") y acepta los términos. (Puedes desactivar Google Analytics por ahora para hacerlo más rápido).
3. Una vez creado, en el menú izquierdo, ve a **"Compilación" -> "Firestore Database"**.
   - Haz clic en **"Crear base de datos"**.
   - Elige una ubicación cercana (ej. "South America" o "US East").
   - Selecciona **"Comenzar en modo de prueba"** (luego ajustaremos la seguridad).
4. En el menú izquierdo, ve a **"Compilación" -> "Authentication"**.
   - Haz clic en **"Comenzar"**.
   - En la pestaña "Sign-in method", elige **Google**, actívalo, pon tu correo de soporte y guarda.
5. Ahora, ve a la **"Rueda de engranaje"** (Configuración) arriba a la izquierda -> **"Configuración del proyecto"**.
6. Baja hasta la sección "Tus apps" y haz clic en el ícono de **Web** (el que parece `</>`).
   - Ponle un apodo a la app (ej. "Dulzayunos Web") y haz clic en "Registrar app".
   - Te aparecerá un bloque de código con algo llamado `firebaseConfig`. **Copia esos valores**, los necesitaremos en la Fase 3.

---

## FASE 2: Subir tu código a GitHub

Vercel necesita leer tu código desde algún lado. GitHub es el estándar de la industria para esto.

1. Crea una cuenta gratuita en [github.com](https://github.com/).
2. Descarga e instala **GitHub Desktop** (es un programa visual muy fácil de usar) o usa la terminal si sabes cómo.
3. Crea un **Nuevo Repositorio** en GitHub Desktop, selecciona la carpeta donde tienes este proyecto en tu computadora.
4. Haz tu primer "Commit" (guardado) escribiendo "Versión inicial" y haz clic en **"Publish repository"** para subirlo a tu cuenta de GitHub de forma privada.

---

## FASE 3: Publicar en Vercel (Hosting)

Vercel alojará tu página web y tu servidor de pagos para que esté disponible 24/7.
*Nota: Ya he configurado el archivo `vercel.json` y modificado `server.ts` en tu código para que Vercel lo entienda perfectamente.*

1. Ve a [vercel.com](https://vercel.com/) y regístrate usando tu cuenta de **GitHub**.
2. Haz clic en **"Add New..." -> "Project"**.
3. Verás una lista con tus repositorios de GitHub. Busca el que acabas de crear y haz clic en **"Import"**.
4. En la pantalla de configuración del proyecto, abre la sección **"Environment Variables" (Variables de Entorno)**. 
   Aquí debes pegar las claves secretas para que tu código funcione. Añade las siguientes (una por una):

   **De Firebase (las sacaste en la Fase 1):**
   - `VITE_FIREBASE_API_KEY` = (tu api key)
   - `VITE_FIREBASE_AUTH_DOMAIN` = (tu auth domain)
   - `VITE_FIREBASE_PROJECT_ID` = (tu project id)
   - `VITE_FIREBASE_STORAGE_BUCKET` = (tu storage bucket)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = (tu messaging sender id)
   - `VITE_FIREBASE_APP_ID` = (tu app id)

   **De Mercado Pago / Ualá:**
   - `MP_ACCESS_TOKEN` = (Tu token de producción de Mercado Pago)
   - `UALA_USERNAME` = (Tu usuario de Ualá)
   - `UALA_CLIENT_ID` = (Tu Client ID de Ualá)
   - `UALA_CLIENT_SECRET` = (Tu Client Secret de Ualá)

5. Haz clic en **"Deploy"**. Vercel empezará a construir tu página. Tardará un par de minutos.
6. ¡Listo! Vercel te dará un link temporal (ej. `dulzayunos.vercel.app`). Tu web ya está en internet.

---

## FASE 4: Conectar tu Dominio en Namecheap

Ahora vamos a quitar el ".vercel.app" y poner tu dominio profesional.

1. Ve a [namecheap.com](https://www.namecheap.com/) y compra tu dominio (ej. `dulzayunos.com`).
2. Vuelve a **Vercel**, entra a tu proyecto, ve a la pestaña **"Settings"** y luego a **"Domains"**.
3. Escribe tu dominio comprado (ej. `dulzayunos.com`) y haz clic en **"Add"**.
   - Vercel te dirá que el dominio no está configurado y te dará unos valores (generalmente un `A Record` con una IP como `76.76.21.21` o un `CNAME`).
4. Ve a **Namecheap**, entra a tu cuenta, busca tu dominio y haz clic en **"Manage"**.
5. Ve a la pestaña **"Advanced DNS"**.
6. En la sección "Host Records", borra los que vengan por defecto y añade los que te dio Vercel:
   - **Type:** `A Record` | **Host:** `@` | **Value:** `76.76.21.21` (o la IP que te dé Vercel).
   - **Type:** `CNAME Record` | **Host:** `www` | **Value:** `cname.vercel-dns.com`.
7. Guarda los cambios (el tilde verde).

*Nota: Los cambios de dominio pueden tardar entre 15 minutos y 24 horas en propagarse por todo el mundo. Vercel te avisará cuando esté listo y le pondrá el candado de seguridad (HTTPS) automáticamente.*

---
¡Felicidades! Siguiendo estos pasos tendrás tu web profesional publicada, segura y lista para recibir clientes.
