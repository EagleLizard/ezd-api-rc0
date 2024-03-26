
import { SessionData } from 'express-session';
import { z } from 'zod';

/*
session.Cookie:

  originalMaxAge: number | null;

  maxAge?: number | undefined;
  signed?: boolean | undefined;
  expires?: Date | null | undefined;
  httpOnly?: boolean | undefined;
  path?: string | undefined;
  domain?: string | undefined;
  secure?: boolean | "auto" | undefined;
  sameSite?: boolean | "lax" | "strict" | "none" | undefined;
*/

const SessionDtoSchema = z.object({
  sid: z.string(),
  sess: z.object({
    cookie: z.object({
      originalMaxAge: z.number().or(z.null()),

      maxAge: z.number().optional(),
      expires: z.coerce.date().or(z.null()).optional(),
      httpOnly: z.boolean().optional(),
      path: z.string().optional(),
      domain: z.coerce.string().optional(),
      secure: z.boolean().or(z.literal('auto')).optional(),
      sameSite: z.boolean()
        .or(
          z.string()
          .transform(val => {
            return val.toLowerCase();
          })
          .pipe(z.literal('lax'))
        )
        .or(z.literal('strict'))
        .or(z.literal('none'))
        .nullish().transform(val => {
          return val ?? undefined;
        })
        .optional(),
    })
  }),
  expire: z.coerce.date(),
});

type SessionDtoType = z.infer<typeof SessionDtoSchema>;

export class SessionDto implements SessionDtoType {
  constructor(
    public sid: string,
    public sess: SessionData,
    public expire: Date,
  ) {}

  static deserialize(rawSession: unknown): SessionDto {
    let sessionDto: SessionDto;
    sessionDto = SessionDtoSchema.parse(rawSession);
    return new SessionDto(
      sessionDto.sid,
      sessionDto.sess,
      sessionDto.expire,
    );
  }
}
