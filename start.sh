#!/bin/bash
set -e

echo "Esperando a que la base de datos PostgreSQL esté lista..."
# Esperar a que PostgreSQL esté disponible
MAX_RETRIES=30
RETRY_INTERVAL=2
RETRIES=0

until PGPASSWORD=123 psql -h diagram_db -U postgres -d Diagrama -c "SELECT 1" > /dev/null 2>&1 || [ $RETRIES -eq $MAX_RETRIES ]; do
  echo "Esperando conexión a PostgreSQL... ($((RETRIES+1))/$MAX_RETRIES)"
  RETRIES=$((RETRIES+1))
  sleep $RETRY_INTERVAL
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
  echo "Error: No se pudo conectar a PostgreSQL después de $MAX_RETRIES intentos."
  exit 1
fi

echo "Base de datos conectada correctamente."

# Ejecutar migraciones de Prisma
echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

# Verificar si existen las tablas
echo "Verificando si se crearon las tablas..."
TABLES=$(PGPASSWORD=123 psql -h diagram_db -U postgres -d Diagrama -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
echo "Tablas existentes en la base de datos:"
echo "$TABLES"

# Iniciar la aplicación
echo "Iniciando la aplicación..."
npm run start:prod