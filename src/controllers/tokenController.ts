import { Request, Response } from "express";
import { pool } from "../config/database";

export const tokenController = {
  findAll: async (req: Request, res: Response) => {
    const userId = (req as any).user.id || (req as any).user_id;

    const result = await pool.query(
      `SELECT id, token_jti, device_name, ip_address, created_at, expired_at,
    CASE WHEN revoked_at IS NOT NULL THEN 'revoked'
         WHEN expires_at < NOW() THEN 'expired'
         ELSE 'active' END as status
     FROM refresh_tokens
     WHERE user_id = $1
     ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows;
  },
};
