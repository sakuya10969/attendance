import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app!: admin.app.App;

  private get nodeEnv() {
    return process.env.NODE_ENV ?? 'development';
  }

  private get projectId() {
    return process.env.FIREBASE_PROJECT_ID?.trim();
  }

  private get useAuthEmulator() {
    return process.env.FIREBASE_USE_AUTH_EMULATOR === 'true';
  }

  private get authEmulatorHost() {
    return process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim();
  }

  private get allowDevSeed() {
    return process.env.ALLOW_DEV_SEED === 'true';
  }

  onModuleInit() {
    if (!this.projectId) {
      throw new Error('Firebase project ID is missing. Set FIREBASE_PROJECT_ID.');
    }

    if (this.nodeEnv === 'production') {
      if (this.useAuthEmulator || this.authEmulatorHost) {
        throw new Error(
          'Firebase Auth Emulator must not be configured in production.',
        );
      }
    }

    if (admin.apps.length > 0) {
      this.app = admin.apps[0]!;
      return;
    }

    if (this.shouldUseAuthEmulator()) {
      if (!this.authEmulatorHost) {
        throw new Error(
          'FIREBASE_AUTH_EMULATOR_HOST is required when FIREBASE_USE_AUTH_EMULATOR=true.',
        );
      }

      process.env.FIREBASE_AUTH_EMULATOR_HOST = this.authEmulatorHost;
      this.app = admin.initializeApp({
        projectId: this.projectId,
      });
      return;
    }

    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      throw new Error(
        'Firebase credentials are missing. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
      );
    }

    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.projectId,
        clientEmail,
        privateKey,
      }),
      projectId: this.projectId,
    });
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

  shouldUseAuthEmulator(): boolean {
    return this.nodeEnv !== 'production' && this.useAuthEmulator;
  }

  assertDevelopmentSeedAllowed(scope: 'auth' | 'app') {
    if (this.nodeEnv === 'production') {
      throw new Error(`${scope} seed must not run in production.`);
    }

    if (!this.allowDevSeed) {
      throw new Error(
        `ALLOW_DEV_SEED=true is required to run ${scope} seed scripts.`,
      );
    }

    if (!this.shouldUseAuthEmulator()) {
      throw new Error(
        `${scope} seed requires Firebase Auth Emulator. Set FIREBASE_USE_AUTH_EMULATOR=true and FIREBASE_AUTH_EMULATOR_HOST.`,
      );
    }
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(token);
  }

  async createOrGetUser(
    email: string,
    displayName: string,
    options?: { password?: string },
  ): Promise<admin.auth.UserRecord> {
    try {
      const existing = await this.auth.getUserByEmail(email);
      if (
        existing.displayName !== displayName ||
        options?.password !== undefined
      ) {
        return this.auth.updateUser(existing.uid, {
          displayName,
          ...(options?.password ? { password: options.password } : {}),
        });
      }

      return existing;
    } catch (error) {
      if (!this.isUserNotFoundError(error)) {
        throw error;
      }

      return this.auth.createUser({
        email,
        displayName,
        ...(options?.password ? { password: options.password } : {}),
      });
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    return this.auth.getUserByEmail(email);
  }

  private isUserNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'auth/user-not-found'
    );
  }
}
