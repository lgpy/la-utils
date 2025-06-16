import { auth } from '@/lib/auth.server'
import { os } from '@orpc/server'
import { headers } from 'next/headers'

export const requiredAuthMiddleware = os
  .$context<{ session?: typeof auth.$Infer.Session }>()
  .middleware(async ({ context, next }) => {
    /**
     * Why we should ?? here?
     * Because it can avoid `getSession` being called when unnecessary.
     * {@link https://orpc.unnoq.com/docs/best-practices/dedupe-middleware}
     */
    const session = context.session ?? await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw new Error('UNAUTHORIZED')
    }

    return next({
      context: { session: session },
    })
  })
