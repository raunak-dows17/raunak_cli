# 🛠️ Raunak CLI – Clean Architecture Node.js Generator

A blazing-fast CLI to bootstrap professional clean architecture projects in Node.js using TypeScript.

## 🚀 Features

- `raunak init`: Bootstraps a production-grade backend with:
    - Express, Mongoose, JWT, Dotenv, etc.
    - Typed env config
    - Multer Config for media upload
    - Middleware for custom API response
    - Media handling for any Entity handling both single and multiple media upload
    - Seamless RawLib Integration
    - Project structure: `core/`, `config/`, `root/`
- `raunak generate:feature <name>`:
    - Creates a feature folder with domain, application and data layers
    - Generates starter files (e.g. `auth.entity.ts`, `auth.controller.ts`)
- `raunak generate:model <name>`:
  - Generates:
    - Entity (Domain Layer)
    - Mongoose model (Infrastructure Layer)
    - Optional Zod validator
  - Feature-aware structure: generate in `core/` or `features/<name>/`

## 🧪 Usage

```bash
npx raunak init --with-validator

npx raunak generate feature auth

npx raunak generate:model user --fields "name:string, username:string:required, email:string:unique, password:string, role:string" --with-validator
