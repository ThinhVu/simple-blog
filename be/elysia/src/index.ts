import createApp from './app'

async function main() {
  const app = await createApp()
  console.log(
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
  );
}

main()




