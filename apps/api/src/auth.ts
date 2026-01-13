import { jwt, sign, verify } from 'hono/jwt'
import { Context, Next } from 'hono'

export const JWT_SECRET = 'apollo-super-secret-key' // In production, use wrangler secrets

export interface JWTPayload {
    id: string
    email: string
    role: 'student' | 'teacher' | 'volunteer'
    exp: number
    [key: string]: unknown
}

export const createToken = async (user: { id: string, email: string, role: string }) => {
    const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        role: user.role as any,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
    }
    return await sign(payload, JWT_SECRET)
}

export const authMiddleware = jwt({
    secret: JWT_SECRET,
    alg: 'HS256'
})

export const roleMiddleware = (requiredRoles: string[]) => {
    return async (c: Context, next: Next) => {
        const payload = c.get('jwtPayload') as JWTPayload
        if (!payload || !requiredRoles.includes(payload.role)) {
            return c.json({ error: 'Unauthorized: Insufficient permissions' }, 403)
        }
        await next()
    }
}
