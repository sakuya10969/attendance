import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { FirebaseService } from '../src/firebase/firebase.service'
import { PrismaService } from '../src/prisma/prisma.service'

async function main() {
  const email = process.argv[2]
  const name = process.argv[3]

  if (!email || !name) {
    console.error('Usage: tsx scripts/create-system-admin.ts <email> <name>')
    process.exit(1)
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  })

  const firebase = app.get(FirebaseService)
  const prisma = app.get(PrismaService)

  try {
    // Firebase ユーザー作成 or 取得
    const firebaseUser = await firebase.createOrGetUser(email, name)
    console.log(`Firebase user: ${firebaseUser.uid}`)

    // 既存チェック
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    })

    if (existingUser) {
      if (existingUser.role === 'system_admin') {
        console.log(`System admin already exists: ${existingUser.email}`)
        return
      }
      // system_admin に昇格
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'system_admin', tenantId: null },
      })
      console.log(`Updated existing user to system_admin: ${email}`)
    } else {
      await prisma.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email,
          name,
          role: 'system_admin',
          tenantId: null,
        },
      })
      console.log(`Created system_admin: ${email}`)
    }
  } finally {
    await app.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
