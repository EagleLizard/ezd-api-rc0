
import { z } from 'zod';

const JwtSessionDtoSchema = z.object({
  jwt_session_id: z.number(),
  valid: z.boolean(),
  user_id: z.string(),
  created_at: z.coerce.date(),
});

type JwtSessionDtoType = z.infer<typeof JwtSessionDtoSchema>;

export class JwtSessionDto implements JwtSessionDtoType {
  constructor(
    public jwt_session_id: number,
    public valid: boolean,
    public user_id: string,
    public created_at: Date,
  ) {}

  static deserialize(rawJwtSession: unknown): JwtSessionDto {
    let jwtSessionDto: JwtSessionDto;
    jwtSessionDto = JwtSessionDtoSchema.parse(rawJwtSession);
    return new JwtSessionDto(
      jwtSessionDto.jwt_session_id,
      jwtSessionDto.valid,
      jwtSessionDto.user_id,
      jwtSessionDto.created_at,
    );
  }
}
