# 🛠️ Raunak CLI – Clean Architecture Node.js Generator

A blazing-fast CLI to bootstrap professional clean architecture projects in Node.js using TypeScript.

## 🚀 Features

- `raunak init`: Bootstraps a production-grade backend with:
    - Express, Mongoose, JWT, Dotenv, etc.
    - Typed env config
    - Middleware for custom API response
    - Project structure: `core/`, `config/`, `root/`
- `raunak create-feature <name>`:
    - Creates a feature folder with domain, application, interface, and infrastructure layers
    - Generates starter files (e.g. `auth.entity.ts`, `auth.controller.ts`)

## 🧪 Usage

```bash
npx raunak init
npx raunak create-feature auth

