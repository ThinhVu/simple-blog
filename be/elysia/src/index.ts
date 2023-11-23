import createApp from './app'

async function main() {
  console.log('create app')
  const app = await createApp()
  console.log('start app')
  app.listen(3000, () => {
    console.log(
      `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
    )
  })
}

main()




