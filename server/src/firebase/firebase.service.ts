import { Injectable, OnModuleInit } from '@nestjs/common'
import * as admin from 'firebase-admin'

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App

  onModuleInit() {
    if (admin.apps.length > 0) {
      this.app = admin.apps[0]!
      return
    }

    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.',
      )
    }

    this.app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    })
  }

  get auth(): admin.auth.Auth {
    return this.app.auth()
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(token)
  }

  async createOrGetUser(email: string, displayName: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.getUserByEmail(email)
    } catch {
      return this.auth.createUser({ email, displayName })
    }
  }
}
