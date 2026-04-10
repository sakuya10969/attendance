import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { FirebaseService } from '../src/firebase/firebase.service'

const seedUsers = [
  {
    email: 'dev-admin@example.com',
    displayName: 'Dev Admin',
  },
  {
    email: 'manager@example.com',
    displayName: 'Manager User',
  },
  {
    email: 'member1@example.com',
    displayName: 'Member One',
  },
]

async function main() {
  const password = process.env.DEV_AUTH_SEED_PASSWORD

  if (!password) {
    throw new Error('DEV_AUTH_SEED_PASSWORD is required.')
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  })

  const firebase = app.get(FirebaseService)

  try {
    firebase.assertDevelopmentSeedAllowed('auth')

    for (const seedUser of seedUsers) {
      const user = await firebase.createOrGetUser(
        seedUser.email,
        seedUser.displayName,
        { password },
      )

      console.log(`${seedUser.email} -> ${user.uid}`)
    }
  } finally {
    await app.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
