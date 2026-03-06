cd apps\web
call npx tailwindcss init -p
call npm install react-router-dom @tanstack/react-query @supabase/supabase-js lucide-react clsx tailwind-merge date-fns @radix-ui/react-toast @radix-ui/react-slot class-variance-authority
call npm install -D @types/node
cd ..\..\packages\shared
call npm init -y
call npm pkg set name="@ai-knowledge/shared" version="1.0.0" main="src/index.ts"
if not exist src mkdir src
call npm install zod
call npm install -D typescript
call npx tsc --init
cd ..\..
call npm install
